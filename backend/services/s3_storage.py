"""Private S3 storage for resume PDFs, using the standard AWS credential chain."""

import hashlib
import logging
import re
import uuid
from datetime import datetime, timezone

from config import AWS_REGION, S3_RESUME_BUCKET

logger = logging.getLogger("careerlens.s3_storage")
_s3_client = None
_KEY_PATTERN = re.compile(r"^resumes/[a-f0-9]{64}/[a-f0-9]{32}\.pdf$")


class S3StorageError(RuntimeError):
    """Safe application-level S3 failure without provider details."""


class S3ConfigurationError(S3StorageError):
    """Required S3 configuration is unavailable."""


class S3ObjectNotFound(S3StorageError):
    """The requested resume object does not exist."""


class InvalidResumeFile(ValueError):
    """The uploaded content is not an acceptable PDF."""


def _bucket_name():
    bucket = (S3_RESUME_BUCKET or "").strip()
    if not bucket:
        raise S3ConfigurationError("Resume storage is not configured.")
    return bucket


def _get_client():
    global _s3_client
    if _s3_client is None:
        try:
            import boto3
            from botocore.config import Config

            _s3_client = boto3.client(
                "s3",
                region_name=AWS_REGION,
                config=Config(
                    connect_timeout=5,
                    read_timeout=15,
                    retries={"max_attempts": 3, "mode": "standard"},
                ),
            )
        except Exception as exc:
            logger.error("Unable to initialize S3 client (%s).", type(exc).__name__)
            raise S3StorageError("Resume storage is temporarily unavailable.") from None
    return _s3_client


def _validated_key(object_key):
    if not isinstance(object_key, str) or not _KEY_PATTERN.fullmatch(object_key):
        raise S3StorageError("Resume object reference is invalid.")
    return object_key


def upload_resume_file(user_id, file_bytes, content_type="application/pdf"):
    """Upload PDF bytes to a private bucket and return MongoDB-safe metadata."""
    bucket = _bucket_name()
    if not isinstance(user_id, str) or not user_id.strip():
        raise S3StorageError("Resume ownership is unavailable.")
    if not isinstance(file_bytes, (bytes, bytearray)) or not file_bytes.startswith(b"%PDF-"):
        raise InvalidResumeFile("Only valid PDF files are supported.")
    if content_type not in (None, "", "application/pdf", "application/octet-stream"):
        raise InvalidResumeFile("Only PDF files are supported.")

    body = bytes(file_bytes)
    owner_hash = hashlib.sha256(user_id.encode("utf-8")).hexdigest()
    object_key = f"resumes/{owner_hash}/{uuid.uuid4().hex}.pdf"
    normalized_type = "application/pdf"
    try:
        _get_client().put_object(
            Bucket=bucket,
            Key=object_key,
            Body=body,
            ContentType=normalized_type,
            ServerSideEncryption="AES256",
        )
    except Exception as exc:
        logger.error("S3 resume upload failed (%s).", _error_code(exc))
        raise S3StorageError("Resume storage is temporarily unavailable.") from None

    return {
        "object_key": object_key,
        "content_type": normalized_type,
        "file_size": len(body),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }


def download_resume_file(object_key):
    bucket = _bucket_name()
    key = _validated_key(object_key)
    try:
        response = _get_client().get_object(Bucket=bucket, Key=key)
        return response["Body"].read()
    except Exception as exc:
        if _error_code(exc) in {"NoSuchKey", "NotFound", "404"}:
            raise S3ObjectNotFound("Resume file was not found.") from None
        logger.error("S3 resume download failed (%s).", _error_code(exc))
        raise S3StorageError("Resume storage is temporarily unavailable.") from None


def delete_resume_file(object_key):
    bucket = _bucket_name()
    key = _validated_key(object_key)
    try:
        _get_client().delete_object(Bucket=bucket, Key=key)
    except Exception as exc:
        logger.error("S3 resume delete failed (%s).", _error_code(exc))
        raise S3StorageError("Resume storage is temporarily unavailable.") from None


def generate_presigned_download_url(object_key, expires_in=300):
    return _presign("get_object", object_key, expires_in)


def generate_presigned_upload_url(object_key, expires_in=300):
    return _presign("put_object", object_key, expires_in, ContentType="application/pdf")


def _presign(operation, object_key, expires_in, **parameters):
    bucket = _bucket_name()
    key = _validated_key(object_key)
    if not isinstance(expires_in, int) or not 1 <= expires_in <= 3600:
        raise ValueError("Presigned URL expiry must be between 1 and 3600 seconds.")
    try:
        return _get_client().generate_presigned_url(
            operation,
            Params={"Bucket": bucket, "Key": key, **parameters},
            ExpiresIn=expires_in,
        )
    except Exception as exc:
        logger.error("S3 presigned URL generation failed (%s).", _error_code(exc))
        raise S3StorageError("Resume storage is temporarily unavailable.") from None


def _error_code(exc):
    response = getattr(exc, "response", None)
    if isinstance(response, dict):
        error = response.get("Error") or {}
        if isinstance(error, dict):
            code = error.get("Code")
            if code:
                return str(code)[:40]
    return type(exc).__name__[:40]
