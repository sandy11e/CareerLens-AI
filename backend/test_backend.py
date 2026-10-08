import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

print("Testing backend imports...")
try:
    import fastapi
    import uvicorn
    import pdfplumber
    import pypdf
    import sklearn
    import pymongo
    import requests
    from config import GROQ_MODEL, PORT
    from database import connect_db, memory_store
    from services.resume_parser import clean_extracted_text
    from services.score_calculator import calculate_ats_breakdown
    from services.job_database import jobs
    from services.job_matcher import match_candidate_to_jobs
    from services.scoring_engine import calculate_final_readiness
    from services.cross_verifier import cross_verify_candidate
    from services.groq_service import is_groq_configured
    print("[SUCCESS] All core backend services and modules imported successfully!")
    print(f"[STATUS] Groq configured: {is_groq_configured()}")
    print(f"[STATUS] Job database has {len(jobs)} active tech roles")
    
    # Test sample calculation
    dummy_skills = ["Python", "FastAPI", "React", "Docker", "SQL"]
    dummy_text = "Experienced Software Engineer with Python, FastAPI, and React development experience. Improved API throughput by 35%."
    res = calculate_ats_breakdown(dummy_text, {"all_skills": dummy_skills, "candidate_info": {"email": "test@test.com"}})
    print(f"[TEST] ATS Score Calculator test score: {res['overall_score']}")
    
    matched = match_candidate_to_jobs(dummy_skills, dummy_text)
    print(f"[TEST] Job Matcher top match: {matched[0]['title']} ({matched[0]['fit_score']}%)")

except Exception as e:
    print(f"[ERROR] Import or execution error: {e}")
    sys.exit(1)
