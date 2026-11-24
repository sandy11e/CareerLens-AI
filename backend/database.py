"""MongoDB persistence with process-scoped connection reuse.

Local development without MongoDB retains the historical in-memory behavior.
Production (including Lambda) fails closed when MongoDB is unavailable.
"""

import hashlib
import logging
import os
import secrets
import threading
import time
import uuid
from datetime import datetime, timedelta, timezone

from config import APP_ENV, MONGO_URI

logger = logging.getLogger("careerlens.database")

client = None
db = None
_connection_lock = threading.Lock()
_evaluation_jobs_lock = threading.Lock()
_connection_attempted = False
_last_connection_error = None
_retry_after = 0.0
_RETRY_DELAY_SECONDS = 5.0
_production = APP_ENV in {"prod", "production"} or bool(
    os.getenv("AWS_LAMBDA_FUNCTION_NAME")
)

# Kept only for local development when MongoDB is not configured or its initial
# connection cannot be established. Tests should inject a mock db instead.
memory_store = {
    "evaluations": [],
    "resumes": {},
    "users": {},
    "conversations": {},
    "evaluation_jobs": {},
}


class DatabaseUnavailable(RuntimeError):
    """Raised when durable MongoDB access is required but unavailable."""


def _now():
    return datetime.now(timezone.utc).isoformat()


def _ensure_indexes(database):
    database.users.create_index("email", unique=True)
    database.users.create_index("token", unique=True, sparse=True)
    database.evaluations.create_index([("user_id", 1), ("created_at", -1)])
    database.evaluations.create_index([("user_id", 1), ("id", 1)], unique=True)
    database.conversations.create_index(
        [("user_id", 1), ("evaluation_id", 1), ("timestamp", 1)]
    )
    database.resumes.create_index([("user_id", 1), ("id", 1)], unique=True)
    database.resumes.create_index([("user_id", 1), ("updated_at", -1)])
    evaluation_jobs = getattr(database, "evaluation_jobs", None)
    if evaluation_jobs is not None:
        evaluation_jobs.create_index("id", unique=True)
        evaluation_jobs.create_index([("user_id", 1), ("created_at", -1)])
        evaluation_jobs.create_index(
            [("user_id", 1), ("idempotency_key", 1)], unique=True,
            partialFilterExpression={"idempotency_key": {"$type": "string"}},
        )


def connect_db():
    """Lazily connect once per process and reuse the MongoClient on warm calls.

    Returns the database in connected mode. Returns None only for local
    development's legacy memory mode. Production failures raise
    DatabaseUnavailable without including connection details in the message.
    """
    global client, db, _connection_attempted, _last_connection_error, _retry_after
    if db is not None:
        return db

    with _connection_lock:
        if db is not None:
            return db

        if not MONGO_URI:
            _connection_attempted = True
            _last_connection_error = "MONGO_URI is not configured"
            if _production:
                raise DatabaseUnavailable("Database service is unavailable.")
            logger.warning(
                "MONGO_URI is not configured; using the local development memory store."
            )
            return None

        if _connection_attempted and _last_connection_error and not _production:
            return None
        if _production and time.monotonic() < _retry_after:
            raise DatabaseUnavailable("Database service is temporarily unavailable.")

        candidate = None
        try:
            from pymongo import MongoClient

            candidate = MongoClient(
                MONGO_URI,
                serverSelectionTimeoutMS=3000,
                connectTimeoutMS=3000,
                socketTimeoutMS=5000,
                maxPoolSize=20,
                minPoolSize=0,
                retryWrites=True,
            )
            candidate.admin.command("ping")
            database = candidate.get_database("careerlens_ai")
            _ensure_indexes(database)
            client = candidate
            db = database
            _connection_attempted = True
            _last_connection_error = None
            logger.info("Connected to MongoDB.")
            return db
        except Exception as exc:
            if candidate is not None:
                try:
                    candidate.close()
                except Exception:
                    pass
            client = None
            db = None
            _connection_attempted = True
            _last_connection_error = type(exc).__name__
            if _production:
                _retry_after = time.monotonic() + _RETRY_DELAY_SECONDS
                logger.error("MongoDB connection failed (%s).", type(exc).__name__)
                raise DatabaseUnavailable("Database service is unavailable.") from exc
            logger.warning(
                "MongoDB connection failed (%s); using the local development memory store.",
                type(exc).__name__,
            )
            return None


def get_db():
    """Return the connected database, initializing it on first use."""
    return connect_db()


def _storage():
    return get_db()


def _operation_failed(operation, exc):
    logger.error("MongoDB operation %s failed (%s).", operation, type(exc).__name__)
    raise DatabaseUnavailable("Database operation failed.") from exc


def _require_user(user_id):
    if not user_id:
        raise ValueError("A user identity is required.")


def _hash_password(password: str) -> str:
    """Hash password using cryptographically secure PBKDF2-HMAC-SHA256."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${key.hex()}"


def _verify_password(password: str, hashed_str: str) -> bool:
    try:
        salt, expected_hash = hashed_str.split("$", 1)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(key.hex(), expected_hash)
    except Exception:
        return False


def create_user(name: str, email: str, password: str) -> dict:
    email_clean = email.strip().lower()
    name_clean = name.strip()
    if get_user_by_email(email_clean):
        raise ValueError("An account with this email address already exists.")

    user_id = str(uuid.uuid4())
    token = secrets.token_urlsafe(32)
    created_at = _now()
    record = {
        "id": user_id,
        "name": name_clean,
        "email": email_clean,
        "password_hash": _hash_password(password),
        "token": token,
        "created_at": created_at,
        "last_login": created_at,
    }
    database = _storage()
    if database is not None:
        try:
            database.users.insert_one(record.copy())
        except Exception as exc:
            _operation_failed("create user", exc)
    else:
        memory_store["users"][email_clean] = record

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": name_clean,
            "email": email_clean,
            "created_at": created_at,
        },
    }


def authenticate_user(email: str, password: str) -> dict:
    email_clean = email.strip().lower()
    user = get_user_by_email(email_clean)
    if not user or not _verify_password(password, user.get("password_hash", "")):
        raise ValueError("Invalid email or password.")

    token = secrets.token_urlsafe(32)
    now = _now()
    database = _storage()
    if database is not None:
        try:
            result = database.users.update_one(
                {"email": email_clean},
                {"$set": {"token": token, "last_login": now}},
            )
            if not result.matched_count:
                raise DatabaseUnavailable("Database operation failed.")
        except DatabaseUnavailable:
            raise
        except Exception as exc:
            _operation_failed("update login", exc)
    else:
        memory_store["users"][email_clean]["token"] = token
        memory_store["users"][email_clean]["last_login"] = now

    return {
        "token": token,
        "user": {
            "id": user.get("id"),
            "name": user.get("name"),
            "email": email_clean,
            "created_at": user.get("created_at"),
        },
    }


def get_user_by_email(email: str):
    email_clean = email.strip().lower()
    database = _storage()
    if database is not None:
        try:
            return database.users.find_one({"email": email_clean}, {"_id": 0})
        except Exception as exc:
            _operation_failed("get user by email", exc)
    return memory_store["users"].get(email_clean)


def get_user_by_token(token: str):
    if not token:
        return None
    database = _storage()
    if database is not None:
        try:
            return database.users.find_one(
                {"token": token}, {"_id": 0, "password_hash": 0}
            )
        except Exception as exc:
            _operation_failed("get user by token", exc)
    for user in memory_store["users"].values():
        if user.get("token") == token:
            safe = user.copy()
            safe.pop("password_hash", None)
            return safe
    return None


def save_resume_session(
    user_id: str,
    session_id: str,
    raw_text: str,
    metadata: dict,
    filename: str = "",
    s3_object_key: str = None,
    analysis: dict = None,
    content_type: str = None,
    file_size: int = None,
    uploaded_at: str = None,
):
    _require_user(user_id)
    now = _now()
    existing = get_resume_session(session_id, user_id) or {}
    doc = {
        "id": session_id,
        "user_id": user_id,
        "filename": filename or existing.get("filename", ""),
        "raw_text": raw_text,
        "metadata": metadata or {},
        "s3_object_key": s3_object_key or existing.get("s3_object_key"),
        "content_type": content_type or existing.get("content_type"),
        "file_size": file_size if file_size is not None else existing.get("file_size"),
        "uploaded_at": uploaded_at or existing.get("uploaded_at"),
        "analysis": analysis if analysis is not None else existing.get("analysis"),
        "created_at": existing.get("created_at", now),
        "updated_at": now,
    }
    database = _storage()
    if database is not None:
        try:
            database.resumes.replace_one(
                {"id": session_id, "user_id": user_id}, doc, upsert=True
            )
        except Exception as exc:
            _operation_failed("save resume session", exc)
    else:
        memory_store["resumes"][(user_id, session_id)] = doc
    return doc


def get_resume_session(session_id: str, user_id: str):
    if not session_id or not user_id:
        return None
    database = _storage()
    if database is not None:
        try:
            return database.resumes.find_one(
                {"id": session_id, "user_id": user_id}, {"_id": 0}
            )
        except Exception as exc:
            _operation_failed("get resume session", exc)
    return memory_store["resumes"].get((user_id, session_id))


def create_evaluation_job(job: dict):
    """Persist a new owner-scoped evaluation job before queue submission."""
    user_id = job.get("user_id")
    job_id = job.get("id")
    _require_user(user_id)
    if not job_id:
        raise ValueError("An evaluation job ID is required.")
    doc = dict(job)
    now = _now()
    doc.setdefault("status", "pending")
    doc.setdefault("attempts", 0)
    doc.setdefault("created_at", now)
    doc.setdefault("updated_at", now)
    database = _storage()
    if database is not None:
        try:
            database.evaluation_jobs.insert_one(doc.copy())
        except Exception as exc:
            if doc.get("idempotency_key") and type(exc).__name__ == "DuplicateKeyError":
                existing = database.evaluation_jobs.find_one(
                    {"user_id": user_id, "idempotency_key": doc["idempotency_key"]},
                    {"_id": 0},
                )
                if existing:
                    return existing
            _operation_failed("create evaluation job", exc)
    else:
        with _evaluation_jobs_lock:
            if doc.get("idempotency_key"):
                existing = next((
                    saved.copy() for saved in memory_store["evaluation_jobs"].values()
                    if saved.get("user_id") == user_id
                    and saved.get("idempotency_key") == doc["idempotency_key"]
                ), None)
                if existing:
                    return existing
            if job_id in memory_store["evaluation_jobs"]:
                raise ValueError("Evaluation job ID already exists.")
            memory_store["evaluation_jobs"][job_id] = doc.copy()
    return doc


def get_evaluation_job(user_id: str, job_id: str):
    if not user_id or not job_id:
        return None
    database = _storage()
    if database is not None:
        try:
            return database.evaluation_jobs.find_one(
                {"id": job_id, "user_id": user_id}, {"_id": 0}
            )
        except Exception as exc:
            _operation_failed("get evaluation job", exc)
    with _evaluation_jobs_lock:
        job = memory_store["evaluation_jobs"].get(job_id)
        return job.copy() if job and job.get("user_id") == user_id else None


def get_evaluation_job_by_id(job_id: str):
    """Internal worker lookup; never use this for an HTTP response."""
    if not job_id:
        return None
    database = _storage()
    if database is not None:
        try:
            return database.evaluation_jobs.find_one({"id": job_id}, {"_id": 0})
        except Exception as exc:
            _operation_failed("get evaluation job for worker", exc)
    with _evaluation_jobs_lock:
        job = memory_store["evaluation_jobs"].get(job_id)
        return job.copy() if job else None


def get_evaluation_job_by_idempotency_key(user_id: str, idempotency_key: str):
    if not user_id or not idempotency_key:
        return None
    database = _storage()
    if database is not None:
        try:
            return database.evaluation_jobs.find_one(
                {"user_id": user_id, "idempotency_key": idempotency_key}, {"_id": 0}
            )
        except Exception as exc:
            _operation_failed("get evaluation job idempotency key", exc)
    with _evaluation_jobs_lock:
        return next((job.copy() for job in memory_store["evaluation_jobs"].values()
                     if job.get("user_id") == user_id
                     and job.get("idempotency_key") == idempotency_key), None)

def update_evaluation_job(job_id: str, updates: dict, user_id: str = None):
    if not job_id or not updates:
        return False
    values = dict(updates)
    values["updated_at"] = _now()
    query = {"id": job_id}
    if user_id:
        query["user_id"] = user_id
    database = _storage()
    if database is not None:
        try:
            result = database.evaluation_jobs.update_one(query, {"$set": values})
            return result.matched_count > 0
        except Exception as exc:
            _operation_failed("update evaluation job", exc)
    with _evaluation_jobs_lock:
        job = memory_store["evaluation_jobs"].get(job_id)
        if not job or (user_id and job.get("user_id") != user_id):
            return False
        job.update(values)
        return True


def claim_evaluation_job(job_id: str, max_attempts: int = 3, lease_seconds: int = 1200):
    """Atomically claim pending or expired jobs, incrementing the attempt count."""
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()
    lease_iso = (now + timedelta(seconds=lease_seconds)).isoformat()
    database = _storage()
    if database is not None:
        try:
            from pymongo import ReturnDocument

            database.evaluation_jobs.update_one(
                {
                    "id": job_id,
                    "attempts": {"$gte": max_attempts},
                    "$or": [
                        {"status": "pending"},
                        {"status": "processing", "lease_expires_at": {"$lte": now_iso}},
                    ],
                },
                {"$set": {"status": "failed", "failure_code": "evaluation_failed",
                          "lease_expires_at": None, "updated_at": now_iso}},
            )
            return database.evaluation_jobs.find_one_and_update(
                {
                    "id": job_id,
                    "attempts": {"$lt": max_attempts},
                    "$or": [
                        {"status": "pending"},
                        {"status": "processing", "lease_expires_at": {"$lte": now_iso}},
                    ],
                },
                {
                    "$set": {
                        "status": "processing",
                        "started_at": now_iso,
                        "lease_expires_at": lease_iso,
                        "updated_at": now_iso,
                    },
                    "$inc": {"attempts": 1},
                },
                return_document=ReturnDocument.AFTER,
            )
        except Exception as exc:
            _operation_failed("claim evaluation job", exc)
    with _evaluation_jobs_lock:
        job = memory_store["evaluation_jobs"].get(job_id)
        if not job:
            return None
        expired = (
            job.get("status") == "processing"
            and job.get("lease_expires_at", "") <= now_iso
        )
        eligible = job.get("status") == "pending" or expired
        if not eligible:
            return None
        if job.get("attempts", 0) >= max_attempts:
            job.update({"status": "failed", "failure_code": "evaluation_failed",
                        "lease_expires_at": None, "updated_at": now_iso})
            return None
        job.update({
            "status": "processing",
            "started_at": now_iso,
            "lease_expires_at": lease_iso,
            "updated_at": now_iso,
            "attempts": job.get("attempts", 0) + 1,
        })
        return job.copy()

def save_full_evaluation(user_id: str, record: dict):
    _require_user(user_id)
    eval_id = record.get("evaluation_id") or str(uuid.uuid4())
    candidate = record.get("candidate_info") or {}
    doc = {
        "id": eval_id,
        "user_id": user_id,
        "candidate_name": candidate.get("name") or record.get("candidate_name") or "Candidate",
        "headline": record.get("headline", "Software Developer"),
        "github_username": candidate.get("github") or (record.get("github_signals") or {}).get("username") or "",
        "leetcode_username": (record.get("leetcode_signals") or {}).get("username", ""),
        "target_role": record.get("target_role", "Software Engineer"),
        "holistic_score": record.get("holistic_score", 0),
        "resume_overall_score": record.get("resume_overall_score", 0),
        "readiness_category": record.get("readiness_category", "Interview Ready"),
        "full_analysis": record,
        "resume_session_id": record.get("resume_session_id"),
        "created_at": record.get("created_at") or _now(),
        "updated_at": _now(),
    }
    database = _storage()
    if database is not None:
        try:
            database.evaluations.replace_one(
                {"id": eval_id, "user_id": user_id}, doc, upsert=True
            )
        except Exception as exc:
            _operation_failed("save evaluation", exc)
    else:
        memory_store["evaluations"] = [
            item for item in memory_store["evaluations"]
            if not (item.get("id") == eval_id and item.get("user_id") == user_id)
        ]
        memory_store["evaluations"].append(doc)
    return doc


def get_user_evaluations(user_id: str, limit: int = 30):
    if not user_id:
        return []
    database = _storage()
    if database is not None:
        try:
            return list(database.evaluations.find(
                {"user_id": user_id},
                {
                    "_id": 0, "id": 1, "candidate_name": 1, "headline": 1,
                    "github_username": 1, "leetcode_username": 1, "target_role": 1,
                    "holistic_score": 1, "resume_overall_score": 1,
                    "readiness_category": 1, "created_at": 1,
                },
            ).sort("created_at", -1).limit(limit))
        except Exception as exc:
            _operation_failed("list evaluations", exc)
    records = [
        {key: item.get(key) for key in (
            "id", "candidate_name", "headline", "github_username",
            "leetcode_username", "target_role", "holistic_score",
            "resume_overall_score", "readiness_category", "created_at",
        )}
        for item in memory_store["evaluations"] if item.get("user_id") == user_id
    ]
    records.sort(key=lambda item: str(item.get("created_at", "")), reverse=True)
    return records[:limit]


def get_user_evaluation_detail(user_id: str, evaluation_id: str):
    """Fetch only an evaluation owned by user_id; blank identities never match."""
    if not user_id or not evaluation_id:
        return None
    database = _storage()
    if database is not None:
        try:
            query = {"user_id": user_id}
            if evaluation_id == "latest":
                doc = database.evaluations.find_one(query, {"_id": 0}, sort=[("created_at", -1)])
            else:
                doc = database.evaluations.find_one(
                    {"id": evaluation_id, "user_id": user_id}, {"_id": 0}
                )
            return (doc.get("full_analysis") or doc) if doc else None
        except Exception as exc:
            _operation_failed("get evaluation detail", exc)
    owned = [
        item for item in memory_store["evaluations"] if item.get("user_id") == user_id
    ]
    if evaluation_id == "latest":
        owned.sort(key=lambda item: str(item.get("created_at", "")), reverse=True)
        doc = owned[0] if owned else None
    else:
        doc = next((item for item in owned if item.get("id") == evaluation_id), None)
    return (doc.get("full_analysis") or doc) if doc else None


def update_evaluation_context(user_id: str, evaluation_id: str, updates: dict):
    if not user_id or not evaluation_id or evaluation_id == "latest":
        return None
    database = _storage()
    if database is not None:
        try:
            set_values = {f"full_analysis.{key}": value for key, value in updates.items()}
            set_values["updated_at"] = _now()
            if "target_role" in updates:
                set_values["target_role"] = updates["target_role"]
            result = database.evaluations.update_one(
                {"id": evaluation_id, "user_id": user_id}, {"$set": set_values}
            )
            return result.matched_count > 0
        except Exception as exc:
            _operation_failed("update evaluation context", exc)
    for item in memory_store["evaluations"]:
        if item.get("id") == evaluation_id and item.get("user_id") == user_id:
            analysis = item.setdefault("full_analysis", {})
            analysis.update(updates)
            if "target_role" in updates:
                item["target_role"] = updates["target_role"]
            item["updated_at"] = _now()
            return True
    return False


def delete_user_evaluation(user_id: str, evaluation_id: str):
    if not user_id or not evaluation_id:
        return False
    database = _storage()
    if database is not None:
        try:
            result = database.evaluations.delete_one(
                {"id": evaluation_id, "user_id": user_id}
            )
            return result.deleted_count > 0
        except Exception as exc:
            _operation_failed("delete evaluation", exc)
    before = len(memory_store["evaluations"])
    memory_store["evaluations"] = [
        item for item in memory_store["evaluations"]
        if not (item.get("id") == evaluation_id and item.get("user_id") == user_id)
    ]
    return len(memory_store["evaluations"]) < before


def save_evaluation(record: dict):
    return save_full_evaluation(user_id=record.get("user_id", "guest"), record=record)


def get_evaluations_by_user(identifier: str):
    return get_user_evaluations(user_id=identifier)


def save_chat_message(user_id: str, role: str, content: str, evaluation_id: str = None):
    _require_user(user_id)
    message = {
        "id": str(uuid.uuid4()), "user_id": user_id, "role": role,
        "content": content, "evaluation_id": evaluation_id, "timestamp": _now(),
    }
    database = _storage()
    if database is not None:
        try:
            database.conversations.insert_one(message.copy())
        except Exception as exc:
            _operation_failed("save chat message", exc)
    else:
        memory_store["conversations"].setdefault(user_id, []).append(message)
    return message


def get_chat_history(user_id: str, limit: int = 50, evaluation_id: str = None):
    if not user_id:
        return []
    query = {"user_id": user_id}
    if evaluation_id:
        query["evaluation_id"] = evaluation_id
    database = _storage()
    if database is not None:
        try:
            return list(database.conversations.find(query, {"_id": 0})
                        .sort("timestamp", 1).limit(limit))
        except Exception as exc:
            _operation_failed("get chat history", exc)
    messages = memory_store["conversations"].get(user_id, [])
    if evaluation_id:
        messages = [item for item in messages if item.get("evaluation_id") == evaluation_id]
    return messages[-limit:]


def clear_chat_history(user_id: str, evaluation_id: str = None):
    if not user_id:
        return False
    query = {"user_id": user_id}
    if evaluation_id:
        query["evaluation_id"] = evaluation_id
    database = _storage()
    if database is not None:
        try:
            database.conversations.delete_many(query)
        except Exception as exc:
            _operation_failed("clear chat history", exc)
    messages = memory_store["conversations"].get(user_id, [])
    if evaluation_id:
        memory_store["conversations"][user_id] = [
            item for item in messages if item.get("evaluation_id") != evaluation_id
        ]
    else:
        memory_store["conversations"][user_id] = []
    return True
