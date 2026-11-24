import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from current backend dir
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip()
MONGO_URI = os.getenv("MONGO_URI", "").strip()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2").strip()
EVALUATION_QUEUE_URL = os.getenv("EVALUATION_QUEUE_URL", "").strip()
CORS_ALLOWED_ORIGINS = tuple(
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
)
S3_RESUME_BUCKET = os.getenv(
    "S3_RESUME_BUCKET", "careerlens-ai-resumes-unique-suffix"
).strip()
APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
PORT = int(os.getenv("PORT", 8000))
