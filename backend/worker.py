"""SQS-triggered evaluation worker Lambda entry point."""

import asyncio
import json
import logging

import database
from main import _evaluate_profile_core
from services.resume_parser import extract_text_from_pdf
from services.s3_storage import download_resume_file

logger = logging.getLogger("careerlens.evaluation_worker")
MAX_JOB_ATTEMPTS = 3


def _process_job(job_id):
    job = database.get_evaluation_job_by_id(job_id)
    if not job:
        return "unknown"
    if job.get("status") == "completed":
        return "completed"
    if job.get("status") == "failed":
        return "failed"

    claimed = database.claim_evaluation_job(job_id, max_attempts=MAX_JOB_ATTEMPTS)
    if not claimed:
        current = database.get_evaluation_job_by_id(job_id)
        if not current:
            return "unknown"
        if current.get("status") == "completed":
            return "completed"
        if current.get("status") == "failed":
            return "failed"
        return "retry"

    owner_id = claimed["user_id"]
    session_id = claimed["resume_session_id"]
    try:
        existing_result = database.get_user_evaluation_detail(owner_id, job_id)
        if existing_result:
            database.update_evaluation_job(
                job_id,
                {"status": "completed", "failure_code": None,
                 "result_evaluation_id": job_id, "lease_expires_at": None},
                user_id=owner_id,
            )
            return "completed"

        resume = database.get_resume_session(session_id, owner_id)
        if not resume or not resume.get("s3_object_key"):
            raise ValueError("Owner-scoped resume is unavailable.")
        pdf_bytes = download_resume_file(resume["s3_object_key"])
        raw_text, metadata = extract_text_from_pdf(pdf_bytes)
        if not raw_text or metadata.get("is_scanned_or_empty"):
            raise ValueError("Resume text extraction failed.")

        result = asyncio.run(_evaluate_profile_core(
            owner_id=owner_id,
            current_session_id=session_id,
            github_username=claimed["github_username"],
            leetcode_username=claimed["leetcode_username"],
            target_role=claimed.get("target_role"),
            raw_text=raw_text,
            jd_text=claimed.get("jd_text"),
            evaluation_id=job_id,
        ))
        database.save_full_evaluation(owner_id, result)
        database.update_evaluation_job(
            job_id,
            {"status": "completed", "failure_code": None,
             "result_evaluation_id": job_id, "lease_expires_at": None},
            user_id=owner_id,
        )
        return "completed"
    except Exception as exc:
        current = database.get_evaluation_job_by_id(job_id) or claimed
        attempts = current.get("attempts", claimed.get("attempts", 1))
        terminal = attempts >= MAX_JOB_ATTEMPTS
        database.update_evaluation_job(
            job_id,
            {
                "status": "failed" if terminal else "pending",
                "failure_code": "evaluation_failed",
                "lease_expires_at": None,
            },
            user_id=owner_id,
        )
        logger.error("Evaluation job %s failed (%s).", job_id, type(exc).__name__)
        raise


def handler(event, context):
    """Return SQS partial batch failures; configure ReportBatchItemFailures."""
    failures = []
    for record in event.get("Records", []):
        message_id = record.get("messageId")
        try:
            body = json.loads(record.get("body") or "{}")
            if not isinstance(body, dict) or set(body) != {"job_id"}:
                raise ValueError("Invalid evaluation queue message.")
            job_id = body.get("job_id")
            if not isinstance(job_id, str) or len(job_id) != 36:
                raise ValueError("Invalid evaluation job identifier.")
            outcome = _process_job(job_id)
            if outcome == "retry":
                raise RuntimeError("Evaluation job is still active or exhausted retries.")
        except Exception as exc:
            logger.error("Evaluation queue record failed (%s).", type(exc).__name__)
            if message_id:
                failures.append({"itemIdentifier": message_id})
    return {"batchItemFailures": failures}
