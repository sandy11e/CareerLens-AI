import uuid
import hashlib
import shutil
import logging
from datetime import datetime
import os
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Body, Header, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from mangum import Mangum

from config import CORS_ALLOWED_ORIGINS, GROQ_API_KEY, GROQ_MODEL, PORT
from services.evaluation_queue import EvaluationQueueUnavailable, enqueue_evaluation_job
from services.s3_storage import (
    InvalidResumeFile, S3ObjectNotFound, S3StorageError,
    delete_resume_file, upload_resume_file,
)
from database import (
    DatabaseUnavailable, get_db,
    create_user, authenticate_user, get_user_by_token,
    save_chat_message, get_chat_history, clear_chat_history,
    save_full_evaluation, get_user_evaluations, get_user_evaluation_detail,
    delete_user_evaluation, get_resume_session, save_resume_session,
    create_evaluation_job as persist_evaluation_job, get_evaluation_job,
    update_evaluation_job, get_evaluation_job_by_idempotency_key,
    update_evaluation_context
)
from services.groq_service import is_groq_configured
from services.resume_parser import extract_text_from_pdf
from services.resume_analyzer import analyze_resume_precisely
from services.score_calculator import calculate_ats_breakdown
from services.job_matcher import match_candidate_to_jobs
from services.github_service import extract_github_raw
from services.leetcode_service import extract_leetcode_features
from services.feature_engine import extract_engineering_features
from services.scoring_engine import (
    calculate_engineering_score,
    calculate_dsa_score,
    calculate_collaboration_score,
    calculate_consistency_score,
    calculate_final_readiness
)
from services.cross_verifier import cross_verify_candidate
from services.chat_engine import generate_copilot_response
from services.roadmap_engine import generate_personalized_roadmap
from services.jd_matcher import match_candidate_to_custom_jd

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("careerlens.main")

app = FastAPI(
    title="Devlyzer AI - Unified Talent Intelligence API",
    description="360° Developer Profile Evaluation, High-Precision ATS Resume Extraction, Semantic Job Matching & AI Career Copilot.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(CORS_ALLOWED_ORIGINS),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
    expose_headers=["Content-Length"],
)

@app.exception_handler(DatabaseUnavailable)
async def database_unavailable_handler(request: Request, exc: DatabaseUnavailable):
    logger.error("Database unavailable while handling %s", request.url.path)
    return JSONResponse(status_code=503, content={"detail": "Database service is temporarily unavailable."})

@app.exception_handler(S3ObjectNotFound)
async def s3_object_not_found_handler(request: Request, exc: S3ObjectNotFound):
    return JSONResponse(status_code=404, content={"detail": "Resume file was not found."})

@app.exception_handler(S3StorageError)
async def s3_storage_error_handler(request: Request, exc: S3StorageError):
    logger.error("Resume storage unavailable while handling %s", request.url.path)
    return JSONResponse(status_code=503, content={"detail": "Resume storage is temporarily unavailable."})

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled application error on %s (%s).", request.url.path, type(exc).__name__)
    return JSONResponse(
        status_code=500,
        content={"detail": "Backend processing error."},
    )

UPLOAD_DIR = (
    Path("/tmp/careerlens-uploads")
    if os.getenv("AWS_LAMBDA_FUNCTION_NAME")
    else Path(__file__).resolve().parent / "uploads"
)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_RESUME_BYTES = 6 * 1024 * 1024

async def _persist_resume_upload(file: UploadFile, session_id: str, owner_id: str):
    """Parse, upload, and persist owner-scoped resume metadata with compensation."""
    if getattr(file, "size", None) is not None and file.size > MAX_RESUME_BYTES:
        raise HTTPException(status_code=413, detail="Resume exceeds the 6 MiB upload limit.")
    file_bytes = await file.read(MAX_RESUME_BYTES + 1)
    if len(file_bytes) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=413, detail="Resume exceeds the 6 MiB upload limit.")
    try:
        raw_text, metadata = extract_text_from_pdf(file_bytes)
    except Exception:
        logger.warning("Resume PDF parsing failed.")
        raise HTTPException(status_code=422, detail="Unable to process this PDF.") from None
    if not raw_text or metadata.get("is_scanned_or_empty"):
        raise HTTPException(
            status_code=422,
            detail="Unable to extract text from this PDF. Please ensure it is not a scanned image without OCR.",
        )

    stored = upload_resume_file(owner_id, file_bytes, file.content_type)
    try:
        save_resume_session(
            user_id=owner_id,
            session_id=session_id,
            raw_text=raw_text,
            metadata=metadata,
            filename=file.filename or "resume.pdf",
            s3_object_key=stored["object_key"],
            content_type=stored["content_type"],
            file_size=stored["file_size"],
            uploaded_at=stored["uploaded_at"],
        )
    except Exception:
        try:
            delete_resume_file(stored["object_key"])
        except S3StorageError:
            logger.error("Resume object cleanup failed after metadata persistence error.")
        raise
    return raw_text, metadata, stored


def _authenticated_user(authorization: Optional[str], required: bool = False):
    token = None
    if authorization:
        if not authorization.startswith("Bearer "):
            if required:
                raise HTTPException(status_code=401, detail="Authentication required.")
        else:
            token = authorization.split("Bearer ", 1)[1].strip()
    if not token:
        if required:
            raise HTTPException(status_code=401, detail="Authentication required.")
        return None
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")
    return user


def _resume_owner(session_id: str, authorization: Optional[str]):
    user = _authenticated_user(authorization)
    return user["id"] if user else f"anonymous:{session_id}"


def _owned_evaluation(evaluation_id: str, authorization: Optional[str]):
    user = _authenticated_user(authorization, required=True)
    analysis = get_user_evaluation_detail(user["id"], evaluation_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Evaluation report not found.")
    return user, analysis, analysis.get("evaluation_id") or evaluation_id

@app.get("/")
def root():
    return {
        "service": "Devlyzer AI",
        "status": "operational",
        "version": "2.0.0",
        "groq_configured": is_groq_configured(),
        "groq_model": GROQ_MODEL,
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    db = get_db()
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "groq_active": is_groq_configured(),
        "groq_model": GROQ_MODEL,
        "mongodb_connected": db is not None,
        "features": [
            "Precision Resume Parsing & Extraction",
            "ATS 6-Metric Breakdown",
            "GitHub Repository & Engineering Scoring",
            "LeetCode DSA Analysis",
            "360° Cross-Verification Engine",
            "Hybrid Semantic Job Matching",
            "Career Copilot Chat"
        ]
    }

# ----------------- AUTHENTICATION ENDPOINTS -----------------

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
def register(payload: RegisterRequest):
    if not payload.name or not payload.name.strip():
        raise HTTPException(status_code=400, detail="Name is required.")
    if not payload.email or not payload.email.strip() or "@" not in payload.email:
        raise HTTPException(status_code=400, detail="Valid email address is required.")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    try:
        return create_user(payload.name, payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DatabaseUnavailable:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user account.")

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    if not payload.email or not payload.email.strip() or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    try:
        return authenticate_user(payload.email, payload.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except DatabaseUnavailable:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login service error.")

@app.get("/api/auth/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token.")
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid.")
    return {"user": user}

# ----------------- RESUME ENDPOINTS -----------------

@app.post("/api/resume/upload")
async def upload_resume(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None),
):
    """
    Accepts PDF resume upload, extracts text with layout preservation,
    and returns session identifier + preliminary document stats.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    session_id = str(uuid.uuid4())
    owner_id = _resume_owner(session_id, authorization)
    if file.content_type not in (None, "", "application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        extracted_text, metadata, _stored = await _persist_resume_upload(file, session_id, owner_id)
        return {
            "session_id": session_id,
            "filename": file.filename,
            "metadata": metadata,
            "preview_text": extracted_text[:350] + ("..." if len(extracted_text) > 350 else ""),
            "message": "Resume uploaded and text extracted successfully."
        }
    except InvalidResumeFile as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from None

@app.post("/api/resume/analyze")
async def analyze_resume(
    session_id: str = Form(...),
    authorization: Optional[str] = Header(None),
):
    """
    Runs precision structured extraction (Groq LLM) + ATS score calculator + Job matching.
    """
    owner_id = _resume_owner(session_id, authorization)
    session = get_resume_session(session_id, owner_id)
    if not session or not session.get("raw_text"):
        raise HTTPException(status_code=404, detail="Session not found. Please upload a resume first.")

    raw_text = session["raw_text"]

    try:
        # Step 1: Precision structured extraction
        extracted_profile = analyze_resume_precisely(raw_text)

        # Step 2: Deterministic ATS scoring
        ats_evaluation = calculate_ats_breakdown(raw_text, extracted_profile)

        # Step 3: Job matching against database
        all_skills = extracted_profile.get("all_skills", [])
        summary = extracted_profile.get("summary", "")
        job_matches = match_candidate_to_jobs(all_skills, summary)

        result = {
            "session_id": session_id,
            **extracted_profile,
            **ats_evaluation,
            "job_matches": job_matches[:8]
        }

        save_resume_session(
            user_id=owner_id,
            session_id=session_id,
            raw_text=raw_text,
            metadata=session.get("metadata", {}),
            filename=session.get("filename", ""),
            s3_object_key=session.get("s3_object_key"),
            analysis=result,
        )
        return result
    except DatabaseUnavailable:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ----------------- DEVELOPER SIGNALS (GITHUB & LEETCODE) -----------------

@app.get("/api/dev/github/{username}")
def evaluate_github(username: str):
    raw_data = extract_github_raw(username)
    if not raw_data:
        raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found or unreachable.")

    features = extract_engineering_features(raw_data)
    eng_score = calculate_engineering_score(features)
    collab = calculate_collaboration_score(raw_data)

    repositories = [
        {
            "name": repo.get("name"),
            "language": repo.get("language"),
            "stars": repo.get("stargazers_count", 0),
            "size": repo.get("size", 0),
            "description": repo.get("description"),
            "forks": repo.get("forks_count", 0),
            "updated_at": repo.get("pushed_at")
        }
        for repo in raw_data.get("repos", [])[:25]
    ]

    languages = list(set([r["language"] for r in repositories if r["language"]]))

    return {
        "username": username,
        "avatar_url": raw_data.get("avatar_url"),
        "public_repos": raw_data.get("public_repos"),
        "followers": raw_data.get("followers"),
        "engineering_score": eng_score,
        "engineering_features": features,
        "collaboration_score": collab["collaboration_score"],
        "collaboration_details": collab,
        "languages": languages,
        "top_repositories": repositories
    }

@app.get("/api/dev/leetcode/{username}")
def evaluate_leetcode(username: str):
    features = extract_leetcode_features(username)
    if not features:
        raise HTTPException(status_code=404, detail=f"LeetCode user '{username}' not found or profile is private.")

    dsa_metrics = calculate_dsa_score(features)
    return {
        **features,
        **dsa_metrics
    }


# ----------------- UNIFIED 360° EVALUATION ENDPOINT -----------------

class UnifiedEvalRequest(BaseModel):
    session_id: Optional[str] = None
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None

async def _evaluate_profile_core(
    *,
    owner_id: str,
    current_session_id: str,
    github_username: Optional[str],
    leetcode_username: Optional[str],
    target_role: Optional[str],
    raw_text: str,
    jd_text: Optional[str] = None,
    jd_file: Optional[UploadFile] = None,
    evaluation_id: Optional[str] = None,
):
    """Shared evaluation computation used by the sync route and SQS worker."""

    # Extract resume profile if text exists
    resume_analysis = {}
    ats_breakdown = {}
    if raw_text:
        resume_analysis = analyze_resume_precisely(raw_text)
        ats_breakdown = calculate_ats_breakdown(raw_text, resume_analysis)

    # Auto-detect GitHub username from resume if not provided
    effective_github = github_username
    cand_info_extracted = (resume_analysis or {}).get("candidate_info") or {}
    if not effective_github and cand_info_extracted.get("github"):
        effective_github = cand_info_extracted["github"]

    # 2. Evaluate GitHub Signals if available
    github_signals = None
    github_raw = None
    eng_score = 0
    collab_score = 0
    if effective_github:
        try:
            github_raw = extract_github_raw(effective_github)
            if github_raw:
                eng_feat = extract_engineering_features(github_raw)
                eng_score = calculate_engineering_score(eng_feat)
                collab_data = calculate_collaboration_score(github_raw)
                collab_score = collab_data["collaboration_score"]
                github_signals = {
                    "username": effective_github,
                    "avatar_url": github_raw.get("avatar_url"),
                    "public_repos": github_raw.get("public_repos"),
                    "followers": github_raw.get("followers"),
                    "engineering_score": eng_score,
                    "collaboration_score": collab_score,
                    "features": eng_feat,
                    "top_repos": [
                        {
                            "name": r.get("name"),
                            "html_url": r.get("html_url") or f"https://github.com/{effective_github}/{r.get('name')}",
                            "language": r.get("language") or "General",
                            "stars": r.get("stargazers_count", 0),
                            "forks": r.get("forks_count", 0),
                            "size": r.get("size", 0),
                            "description": r.get("description") or "Repository codebase",
                            "open_issues": r.get("open_issues_count", 0),
                            "updated_at": r.get("pushed_at") or r.get("updated_at")
                        }
                        for r in github_raw.get("repos", [])[:15]
                    ]
                }
        except Exception as e:
            logger.warning(f"Failed to fetch GitHub for {effective_github}: {e}")

    # 3. Evaluate LeetCode Signals if available
    leetcode_signals = None
    dsa_score = 0
    if leetcode_username:
        try:
            lc_feat = extract_leetcode_features(leetcode_username)
            if lc_feat:
                dsa_data = calculate_dsa_score(lc_feat)
                dsa_score = dsa_data["dsa_score"]
                leetcode_signals = {
                    **lc_feat,
                    **dsa_data
                }
        except Exception as e:
            logger.warning(f"Failed to fetch LeetCode for {leetcode_username}: {e}")

    # 4. Consistency & Overall Developer Readiness
    consistency_score = 0
    if github_raw and leetcode_signals:
        cons_data = calculate_consistency_score(github_raw, leetcode_signals)
        consistency_score = cons_data["consistency_score"]
    elif github_raw:
        consistency_score = round(eng_score * 0.85, 1)

    readiness = calculate_final_readiness(eng_score, dsa_score, consistency_score, collab_score)

    # 5. Cross-Verification Engine (claims vs proof)
    cross_verification = cross_verify_candidate(
        resume_data=resume_analysis,
        github_data=github_raw,
        leetcode_data=leetcode_signals
    )

    # 6. Job Matching
    candidate_skills = resume_analysis.get("all_skills", [])
    if github_signals and github_raw:
        for r in github_raw.get("repos", []):
            if r.get("language") and r["language"] not in candidate_skills:
                candidate_skills.append(r["language"])

    job_matches = match_candidate_to_jobs(
        candidate_skills=candidate_skills,
        candidate_summary=resume_analysis.get("summary", "")
    )

    # 7. Overall Holistic Score (360° Quotient)
    resume_overall = ats_breakdown.get("overall_score", 60)
    dev_overall = readiness.get("final_score", 0)

    if dev_overall > 0 and resume_overall > 0:
        holistic_score = round(0.45 * resume_overall + 0.40 * dev_overall + 0.15 * cross_verification.get("trust_score", 50), 1)
    elif resume_overall > 0:
        holistic_score = resume_overall
    else:
        holistic_score = dev_overall

    response_payload = {
        "evaluation_id": evaluation_id or str(uuid.uuid4()),
        "created_at": datetime.utcnow().isoformat(),
        "resume_session_id": current_session_id if raw_text else None,
        "candidate_info": resume_analysis.get("candidate_info", {
            "name": effective_github or leetcode_username or "Candidate",
            "github": effective_github
        }),
        "headline": resume_analysis.get("headline", "Software Developer"),
        "summary": resume_analysis.get("summary", ""),
        "experience_level": resume_analysis.get("experience_level", "Mid-Level"),
        "skills": resume_analysis.get("skills", {}),
        "all_skills": candidate_skills,
        "experience": resume_analysis.get("experience", []),
        "education": resume_analysis.get("education", []),
        "projects": resume_analysis.get("projects", []),
        "certifications": resume_analysis.get("certifications", []),
        "ats_insights": resume_analysis.get("ats_insights", {}),
        "scores": ats_breakdown.get("scores", {}),
        "resume_overall_score": resume_overall,
        "holistic_score": holistic_score,
        "readiness_category": readiness["category"],
        "developer_readiness": {
            "engineering_score": eng_score,
            "dsa_score": dsa_score,
            "consistency_score": consistency_score,
            "collaboration_score": collab_score,
            "final_score": dev_overall,
            "category": readiness["category"]
        },
        "github_signals": github_signals,
        "leetcode_signals": leetcode_signals,
        "target_role": target_role,
        "cross_verification": cross_verification,
        "job_matches": job_matches[:8],
        "recommendations": ats_breakdown.get("recommendations", [])
    }

    # 8. Custom Job Description (Text or PDF) Matching if provided
    effective_jd_text = ""
    if jd_file and jd_file.filename:
        filename_lower = jd_file.filename.lower()
        if filename_lower.endswith(".pdf"):
            jd_path = UPLOAD_DIR / f"jd_{uuid.uuid4()}.pdf"
            try:
                with open(jd_path, "wb") as buf:
                    shutil.copyfileobj(jd_file.file, buf)
                extracted_jd, _ = extract_text_from_pdf(str(jd_path))
                effective_jd_text = extracted_jd.strip()
            except Exception as e:
                logger.warning(f"Error parsing uploaded JD PDF: {e}")
        elif filename_lower.endswith(".txt"):
            try:
                content = await jd_file.read()
                effective_jd_text = content.decode("utf-8", errors="ignore").strip()
            except Exception as e:
                logger.warning(f"Error reading uploaded JD TXT: {e}")

    if not effective_jd_text and jd_text:
        effective_jd_text = jd_text.strip()

    if effective_jd_text and len(effective_jd_text) >= 20:
        try:
            custom_jd_result = match_candidate_to_custom_jd(response_payload, effective_jd_text)
            response_payload["custom_jd_match"] = custom_jd_result
            if not target_role and custom_jd_result.get("job_title"):
                target_role = custom_jd_result["job_title"]
                response_payload["target_role"] = target_role
        except Exception as e:
            logger.error(f"Error executing custom JD match: {e}")
            response_payload["custom_jd_match"] = None
    else:
        response_payload["custom_jd_match"] = None

    # Generate Personalized Career Roadmap for user's target role
    try:
        response_payload["roadmap"] = generate_personalized_roadmap(response_payload, target_role=target_role)
    except Exception as e:
        logger.error(f"Error generating roadmap: {e}")
        response_payload["roadmap"] = None

    return response_payload


@app.post("/api/evaluate/unified")
async def evaluate_unified_profile(
    session_id: Optional[str] = Form(None),
    github_username: Optional[str] = Form(None),
    leetcode_username: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None)
):
    """
    THE 360° TALENT EVALUATION:
    Combines Resume ATS Extraction + GitHub Engineering Metrics + LeetCode DSA Signals
    with the Cross-Verification Engine, Hybrid Job Matcher, and Custom JD Matcher.
    """
    if not github_username or not github_username.strip():
        raise HTTPException(status_code=400, detail="GitHub username is mandatory for developer signal verification.")
    if not leetcode_username or not leetcode_username.strip():
        raise HTTPException(status_code=400, detail="LeetCode username is mandatory for DSA readiness assessment.")

    raw_text = ""
    metadata = {}
    current_session_id = session_id or str(uuid.uuid4())
    owner_id = _resume_owner(current_session_id, authorization)

    # 1. Process Resume if provided
    if file and getattr(file, "filename", None):
        if not file.filename.lower().endswith(".pdf") or file.content_type not in (None, "", "application/pdf", "application/octet-stream"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        try:
            raw_text, metadata, _stored = await _persist_resume_upload(file, current_session_id, owner_id)
        except InvalidResumeFile as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from None
    elif session_id:
        resume_session = get_resume_session(session_id, owner_id)
        if not resume_session:
            raise HTTPException(status_code=404, detail="Resume session not found.")
        raw_text = resume_session.get("raw_text", "")
        metadata = resume_session.get("metadata", {})

    response_payload = await _evaluate_profile_core(
        owner_id=owner_id,
        current_session_id=current_session_id,
        github_username=github_username,
        leetcode_username=leetcode_username,
        target_role=target_role,
        raw_text=raw_text,
        jd_text=jd_text,
        jd_file=jd_file,
    )
    save_full_evaluation(user_id=owner_id, record=response_payload)
    return response_payload



class EvaluationJobRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=128)
    github_username: str = Field(min_length=1, max_length=100)
    leetcode_username: str = Field(min_length=1, max_length=100)
    target_role: Optional[str] = Field(default=None, max_length=200)
    jd_text: Optional[str] = Field(default=None, max_length=100000)


@app.post("/api/evaluations/jobs", status_code=202)
def submit_evaluation_job(
    payload: EvaluationJobRequest,
    authorization: Optional[str] = Header(None),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key"),
):
    """Persist and queue an evaluation without placing resume bytes on SQS."""
    user = _authenticated_user(authorization, required=True)
    if idempotency_key is not None and not 1 <= len(idempotency_key.strip()) <= 128:
        raise HTTPException(status_code=400, detail="Idempotency-Key must contain 1 to 128 characters.")
    hashed_idempotency_key = None
    if idempotency_key:
        key_material = "{}:{}".format(user["id"], idempotency_key.strip())
        hashed_idempotency_key = hashlib.sha256(key_material.encode("utf-8")).hexdigest()
        existing = get_evaluation_job_by_idempotency_key(user["id"], hashed_idempotency_key)
        if existing:
            existing_id = existing["id"]
            return {
                "job_id": existing_id,
                "evaluation_id": existing_id,
                "status": existing.get("status"),
                "status_url": f"/api/evaluations/jobs/{existing_id}",
                "result_url": f"/api/evaluations/{existing_id}",
            }
    github_username = payload.github_username.strip()
    leetcode_username = payload.leetcode_username.strip()
    if not github_username or not leetcode_username:
        raise HTTPException(status_code=400, detail="GitHub and LeetCode usernames are required.")
    resume = get_resume_session(payload.session_id, user["id"])
    if not resume or not resume.get("s3_object_key"):
        raise HTTPException(status_code=404, detail="Resume session not found.")

    job_id = str(uuid.uuid4())
    job = {
        "id": job_id,
        "user_id": user["id"],
        "resume_session_id": payload.session_id,
        "github_username": github_username,
        "leetcode_username": leetcode_username,
        "target_role": payload.target_role.strip() if payload.target_role else None,
        "jd_text": payload.jd_text.strip() if payload.jd_text else None,
        "status": "pending",
        "attempts": 0,
        "failure_code": None,
        "idempotency_key": hashed_idempotency_key,
    }
    persisted_job = persist_evaluation_job(job)
    job_id = persisted_job["id"]
    try:
        enqueue_evaluation_job(job_id)
    except EvaluationQueueUnavailable:
        update_evaluation_job(
            job_id, {"status": "failed", "failure_code": "queue_unavailable"}, user_id=user["id"]
        )
        raise HTTPException(
            status_code=503,
            detail="Evaluation service is temporarily unavailable.",
        ) from None

    return {
        "job_id": job_id,
        "evaluation_id": job_id,
        "status": "pending",
        "status_url": f"/api/evaluations/jobs/{job_id}",
        "result_url": f"/api/evaluations/{job_id}",
    }


@app.get("/api/evaluations/jobs/{job_id}")
def get_evaluation_job_status(
    job_id: str,
    authorization: Optional[str] = Header(None),
):
    user = _authenticated_user(authorization, required=True)
    job = get_evaluation_job(user["id"], job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Evaluation job not found.")
    return {
        "job_id": job_id,
        "evaluation_id": job_id,
        "status": job.get("status"),
        "attempts": job.get("attempts", 0),
        "created_at": job.get("created_at"),
        "updated_at": job.get("updated_at"),
        "failure_code": job.get("failure_code"),
        "result_url": f"/api/evaluations/{job_id}",
    }

# ----------------- CUSTOM JOB DESCRIPTION MATCHING ENDPOINT -----------------

@app.post("/api/jd/match")
async def match_custom_job_description(
    evaluation_id: Optional[str] = Form("latest"),
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None),
):
    """
    Matches the candidate's existing evaluated profile against a custom Job Description
    provided as text or a PDF document.
    """
    user, context, actual_eval_id = _owned_evaluation(evaluation_id or "latest", authorization)

    effective_jd_text = ""
    if jd_file and jd_file.filename:
        filename_lower = jd_file.filename.lower()
        if filename_lower.endswith(".pdf"):
            jd_path = UPLOAD_DIR / f"jd_{uuid.uuid4()}.pdf"
            try:
                with open(jd_path, "wb") as buf:
                    shutil.copyfileobj(jd_file.file, buf)
                extracted_text, _ = extract_text_from_pdf(str(jd_path))
                effective_jd_text = extracted_text.strip()
            except Exception as e:
                logger.error(f"Failed to parse JD PDF: {e}")
                raise HTTPException(status_code=422, detail=f"Failed to parse JD PDF: {str(e)}")
        elif filename_lower.endswith(".txt"):
            try:
                content = await jd_file.read()
                effective_jd_text = content.decode("utf-8", errors="ignore").strip()
            except Exception as e:
                raise HTTPException(status_code=422, detail=f"Failed to read TXT file: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported for Job Descriptions.")

    if not effective_jd_text and jd_text:
        effective_jd_text = jd_text.strip()

    if not effective_jd_text or len(effective_jd_text) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description is empty or too short. Please paste JD text or upload a readable JD PDF."
        )

    try:
        match_result = match_candidate_to_custom_jd(context, effective_jd_text)
        context["custom_jd_match"] = match_result
        if match_result.get("job_title"):
            context["target_role"] = match_result["job_title"]
        updates = {"custom_jd_match": match_result}
        if context.get("target_role"):
            updates["target_role"] = context["target_role"]
        update_evaluation_context(
            user["id"], actual_eval_id, updates,
        )

        return {
            "success": True,
            "custom_jd_match": match_result
        }
    except DatabaseUnavailable:
        raise
    except Exception as e:
        logger.error(f"Failed to match candidate against custom JD: {e}")
        raise HTTPException(status_code=500, detail=f"JD match analysis failed: {str(e)}")

class DynamicRoadmapRequest(BaseModel):
    evaluation_id: Optional[str] = "latest"
    target_role: str

@app.post("/api/roadmap/generate")
def generate_custom_role_roadmap(
    payload: DynamicRoadmapRequest,
    authorization: Optional[str] = Header(None),
):
    user, context, actual_eval_id = _owned_evaluation(payload.evaluation_id or "latest", authorization)
    new_roadmap = generate_personalized_roadmap(context, target_role=payload.target_role)
    context["roadmap"] = new_roadmap
    context["target_role"] = payload.target_role
    update_evaluation_context(user["id"], actual_eval_id, {"roadmap": new_roadmap, "target_role": payload.target_role})
    return new_roadmap

@app.get("/api/roadmap/{evaluation_id}")
def get_evaluation_roadmap(
    evaluation_id: str = "latest",
    authorization: Optional[str] = Header(None),
):
    user, context, actual_eval_id = _owned_evaluation(evaluation_id, authorization)
    
    if "roadmap" in context and context["roadmap"]:
        return context["roadmap"]
    
    roadmap = generate_personalized_roadmap(context)
    context["roadmap"] = roadmap
    update_evaluation_context(user["id"], actual_eval_id, {"roadmap": roadmap})
    return roadmap


# ----------------- AI COPILOT CHAT ENDPOINT -----------------

class ChatMessage(BaseModel):
    message: str
    evaluation_id: Optional[str] = "latest"
    history: Optional[List[Dict[str, str]]] = []

@app.post("/api/chat")
async def copilot_chat(
    payload: ChatMessage,
    authorization: Optional[str] = Header(None)
):
    """
    Conversational Career Copilot with user-isolated conversation memory in MongoDB.
    """
    msg = payload.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    user, context, eval_id = _owned_evaluation(payload.evaluation_id or "latest", authorization)
    user_id = user["id"]

    # Load stored conversation history for this specific user
    stored_msgs = get_chat_history(user_id, limit=30, evaluation_id=eval_id)
    chat_context = []
    for m in stored_msgs:
        chat_context.append({
            "role": m.get("role", "user"),
            "content": m.get("content", "")
        })

    # If database history was empty but client passed history, incorporate it
    if not chat_context and payload.history:
        chat_context = payload.history

    reply = generate_copilot_response(
        candidate_context=context,
        user_message=msg,
        chat_history=chat_context
    )

    # Save both user prompt and assistant reply in MongoDB under user_id
    save_chat_message(user_id=user_id, role="user", content=msg, evaluation_id=eval_id)
    save_chat_message(user_id=user_id, role="assistant", content=reply, evaluation_id=eval_id)

    # Return reply along with updated user-specific history
    updated_history = get_chat_history(user_id, limit=50, evaluation_id=eval_id)

    return {
        "reply": reply,
        "history": updated_history,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/chat/history")
async def fetch_chat_history(
    authorization: Optional[str] = Header(None),
    evaluation_id: Optional[str] = Query("latest")
):
    """
    Retrieve user-isolated conversation history from MongoDB.
    """
    user, _, actual_eval_id = _owned_evaluation(evaluation_id or "latest", authorization)
    messages = get_chat_history(user["id"], limit=50, evaluation_id=actual_eval_id)
    return {
        "user_id": user["id"],
        "history": messages
    }

@app.delete("/api/chat/history")
async def clear_user_chat_history(
    authorization: Optional[str] = Header(None),
    evaluation_id: Optional[str] = Query("latest")
):
    """
    Clear conversation history for the current user in MongoDB.
    """
    user, _, actual_eval_id = _owned_evaluation(evaluation_id or "latest", authorization)
    success = clear_chat_history(user["id"], evaluation_id=actual_eval_id)
    return {
        "success": success,
        "message": "Conversation history cleared successfully."
    }


# ----------------- FULL EVALUATION AUDIT HISTORY ENDPOINTS -----------------

@app.get("/api/evaluations/history")
async def fetch_evaluation_history(
    authorization: Optional[str] = Header(None)
):
    """
    Retrieve full audit history summary records for the authenticated user from MongoDB.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required to view evaluation history.")

    token = authorization.split("Bearer ", 1)[1].strip()
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")

    records = get_user_evaluations(user_id=user["id"], limit=50)
    return {
        "user_id": user["id"],
        "evaluations": records
    }

@app.get("/api/evaluations/{evaluation_id}")
async def fetch_evaluation_detail(
    evaluation_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Retrieve complete 360° analysis detail for a specific past evaluation to restore the dashboard.
    """
    user = _authenticated_user(authorization, required=True)
    analysis = get_user_evaluation_detail(user_id=user["id"], evaluation_id=evaluation_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Evaluation report not found.")

    return {
        "evaluation_id": evaluation_id,
        "analysis": analysis
    }

@app.delete("/api/evaluations/{evaluation_id}")
async def remove_user_evaluation(
    evaluation_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Delete a specific past evaluation from the user's history in MongoDB.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")

    token = authorization.split("Bearer ", 1)[1].strip()
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")

    deleted = delete_user_evaluation(user_id=user["id"], evaluation_id=evaluation_id)
    if deleted:
        clear_chat_history(user["id"], evaluation_id=evaluation_id)
    return {
        "success": deleted,
        "message": "Evaluation record deleted successfully." if deleted else "Evaluation not found or already deleted."
    }


# Backward compatibility endpoints for Devlyzer & Resume-AI components
@app.get("/evaluations/{github}")
def get_evaluations_legacy(github: str, authorization: Optional[str] = Header(None)):
    user = _authenticated_user(authorization, required=True)
    return get_user_evaluations(user_id=user["id"])

@app.get("/devlens-evaluate/{github}/{leetcode}")
def devlens_legacy(github: str, leetcode: str):
    return evaluate_unified_profile(github_username=github, leetcode_username=leetcode)


# AWS Lambda entry point. Mangum adapts API Gateway/Lambda events to ASGI.
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
