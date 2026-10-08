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
PORT = int(os.getenv("PORT", 8000))
