"""SQS publisher for asynchronous evaluation jobs."""

import json
import logging

from config import AWS_REGION, EVALUATION_QUEUE_URL

logger = logging.getLogger("careerlens.evaluation_queue")


class EvaluationQueueUnavailable(RuntimeError):
    """Queue configuration or service is unavailable."""


def enqueue_evaluation_job(job_id: str):
    queue_url = (EVALUATION_QUEUE_URL or "").strip()
    if not queue_url:
        raise EvaluationQueueUnavailable("Evaluation queue is not configured.")
    try:
        import boto3
        from botocore.config import Config

        client = boto3.client(
            "sqs",
            region_name=AWS_REGION,
            config=Config(connect_timeout=5, read_timeout=10,
                          retries={"max_attempts": 3, "mode": "standard"}),
        )
        client.send_message(QueueUrl=queue_url, MessageBody=json.dumps({"job_id": job_id}))
    except EvaluationQueueUnavailable:
        raise
    except Exception as exc:
        logger.error("Unable to enqueue evaluation job (%s).", type(exc).__name__)
        raise EvaluationQueueUnavailable("Evaluation queue is temporarily unavailable.") from None
