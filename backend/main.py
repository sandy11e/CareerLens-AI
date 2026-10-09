import os
import uuid
import shutil
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Body, Header, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import GROQ_API_KEY, GROQ_MODEL, PORT
from database import (
    connect_db, get_db, save_evaluation, get_evaluations_by_user,
    create_user, authenticate_user, get_user_by_token,
    save_chat_message, get_chat_history, clear_chat_history,
    save_full_evaluation, get_user_evaluations, get_user_evaluation_detail, delete_user_evaluation
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

# Enable CORS for local Vite development and deployed Vercel frontends
ALLOWED_ORIGINS = [
    "https://devlyzer-ai.vercel.app",
    "https://careerlens-ai.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.url.path}: {exc}", exc_info=True)
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Backend processing error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# In-memory sessions cache for quick access
active_sessions: Dict[str, Dict[str, Any]] = {}

def _keep_alive_ping_worker():
    """Background daemon that pings the Render backend every 10 minutes to prevent sleep."""
    import time
    time.sleep(60)  # Wait 1 minute after boot
    render_url = os.getenv("RENDER_EXTERNAL_URL") or "https://devlyzer-ai.onrender.com"
    while True:
        try:
            import requests
            resp = requests.get(f"{render_url}/api/health", timeout=25)
            logger.info(f"10-Minute Keep-Alive Heartbeat sent to {render_url} (HTTP {resp.status_code})")
        except Exception as e:
            logger.warning(f"Keep-alive ping note: {e}")
        time.sleep(600)  # Exactly every 10 minutes

@app.on_event("startup")
def startup_event():
    logger.info("Initializing Devlyzer AI backend...")
    connect_db()
    import threading
    threading.Thread(target=_keep_alive_ping_worker, daemon=True).start()

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
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts PDF resume upload, extracts text with layout preservation,
    and returns session identifier + preliminary document stats.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    session_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{session_id}.pdf"

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        extracted_text, metadata = extract_text_from_pdf(str(file_path))
        
        if not extracted_text or metadata.get("is_scanned_or_empty"):
            raise HTTPException(
                status_code=422,
                detail="Unable to extract text from this PDF. Please ensure it is not a scanned image without OCR."
            )

        active_sessions[session_id] = {
            "session_id": session_id,
            "filename": file.filename,
            "raw_text": extracted_text,
            "metadata": metadata,
            "uploaded_at": datetime.utcnow().isoformat()
        }

        return {
            "session_id": session_id,
            "filename": file.filename,
            "metadata": metadata,
            "preview_text": extracted_text[:350] + ("..." if len(extracted_text) > 350 else ""),
            "message": "Resume uploaded and text extracted successfully."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


@app.post("/api/resume/analyze")
async def analyze_resume(session_id: str = Form(...)):
    """
    Runs precision structured extraction (Groq LLM) + ATS score calculator + Job matching.
    """
    session = active_sessions.get(session_id)
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

        # Store analysis back in session
        session["analysis"] = result
        return result
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

    # 1. Process Resume if provided
    if file and getattr(file, "filename", None):
        file_path = UPLOAD_DIR / f"{current_session_id}.pdf"
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            raw_text, metadata = extract_text_from_pdf(str(file_path))
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            raw_text = ""
            metadata = {"error": str(e)}
    elif session_id and session_id in active_sessions:
        raw_text = active_sessions[session_id].get("raw_text", "")
        metadata = active_sessions[session_id].get("metadata", {})

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
    github_error = None
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
            else:
                github_error = (
                    f"Could not load GitHub profile for '{effective_github}'. "
                    "Check the username or profile URL. If it is correct, the backend may have "
                    "hit GitHub's unauthenticated API rate limit; configure GITHUB_TOKEN and retry."
                )
        except Exception as e:
            logger.warning(f"Failed to fetch GitHub for {effective_github}: {e}")
            github_error = f"GitHub data could not be loaded: {e}"

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
        "evaluation_id": str(uuid.uuid4()),
        "created_at": datetime.utcnow().isoformat(),
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
        "github_error": github_error,
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

    # Resolve user_id if token provided
    user_id = "guest"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        user = get_user_by_token(token)
        if user:
            user_id = user["id"]

    # Save complete 360° evaluation record to MongoDB tagged with user_id
    save_full_evaluation(user_id=user_id, record=response_payload)

    # Cache for chat copilot & custom JD matchers
    active_sessions[response_payload["evaluation_id"]] = {
        "analysis": response_payload
    }
    active_sessions["latest"] = {
        "analysis": response_payload
    }

    return response_payload


# ----------------- CUSTOM JOB DESCRIPTION MATCHING ENDPOINT -----------------

@app.post("/api/jd/match")
async def match_custom_job_description(
    evaluation_id: Optional[str] = Form("latest"),
    jd_text: Optional[str] = Form(None),
    jd_file: Optional[UploadFile] = File(None)
):
    """
    Matches the candidate's existing evaluated profile against a custom Job Description
    provided as text or a PDF document.
    """
    eval_id = evaluation_id or "latest"
    session_data = active_sessions.get(eval_id) or active_sessions.get("latest") or {}
    context = session_data.get("analysis", {})
    if not context:
        raise HTTPException(status_code=404, detail="No evaluation found. Please evaluate a profile or upload a resume first.")

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

        return {
            "success": True,
            "custom_jd_match": match_result
        }
    except Exception as e:
        logger.error(f"Failed to match candidate against custom JD: {e}")
        raise HTTPException(status_code=500, detail=f"JD match analysis failed: {str(e)}")

class DynamicRoadmapRequest(BaseModel):
    evaluation_id: Optional[str] = "latest"
    target_role: str

@app.post("/api/roadmap/generate")
def generate_custom_role_roadmap(payload: DynamicRoadmapRequest):
    eval_id = payload.evaluation_id or "latest"
    session_data = active_sessions.get(eval_id) or active_sessions.get("latest") or {}
    context = session_data.get("analysis", {})
    if not context:
        raise HTTPException(status_code=404, detail="No evaluation found. Please evaluate profile first.")
    
    new_roadmap = generate_personalized_roadmap(context, target_role=payload.target_role)
    context["roadmap"] = new_roadmap
    context["target_role"] = payload.target_role
    return new_roadmap

@app.get("/api/roadmap/{evaluation_id}")
def get_evaluation_roadmap(evaluation_id: str = "latest"):
    session_data = active_sessions.get(evaluation_id) or active_sessions.get("latest") or {}
    context = session_data.get("analysis", {})
    if not context:
        raise HTTPException(status_code=404, detail="No evaluation found. Please evaluate profile first.")
    
    if "roadmap" in context and context["roadmap"]:
        return context["roadmap"]
    
    roadmap = generate_personalized_roadmap(context)
    context["roadmap"] = roadmap
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

    eval_id = payload.evaluation_id or "latest"
    session_data = active_sessions.get(eval_id) or active_sessions.get("latest") or {}
    context = session_data.get("analysis", {})

    # Extract user identity from auth token
    user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        user = get_user_by_token(token)

    # Use authenticated user id or fallback to eval_id
    user_id = user["id"] if user else (eval_id or "guest")

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
    updated_history = get_chat_history(user_id, limit=50)

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
    user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        user = get_user_by_token(token)

    user_id = user["id"] if user else (evaluation_id or "guest")
    messages = get_chat_history(user_id, limit=50, evaluation_id=evaluation_id)
    return {
        "user_id": user_id,
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
    user = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        user = get_user_by_token(token)

    user_id = user["id"] if user else (evaluation_id or "guest")
    success = clear_chat_history(user_id, evaluation_id=evaluation_id)
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
    user_id = "guest"
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
        user = get_user_by_token(token)
        if user:
            user_id = user["id"]

    analysis = get_user_evaluation_detail(user_id=user_id, evaluation_id=evaluation_id)
    if not analysis:
        # Fallback to in-memory active_sessions if exists
        sess = active_sessions.get(evaluation_id)
        if sess and sess.get("analysis"):
            analysis = sess["analysis"]

    if not analysis:
        raise HTTPException(status_code=404, detail="Evaluation report not found.")

    # Re-cache in active_sessions so copilot chat & custom JD matching work on this restored report
    active_sessions[evaluation_id] = {"analysis": analysis}
    active_sessions["latest"] = {"analysis": analysis}

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
def get_evaluations_legacy(github: str):
    return get_evaluations_by_user(github)

@app.get("/devlens-evaluate/{github}/{leetcode}")
def devlens_legacy(github: str, leetcode: str):
    return evaluate_unified_profile(github_username=github, leetcode_username=leetcode)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
