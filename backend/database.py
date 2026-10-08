import logging
import hashlib
import secrets
import uuid
from datetime import datetime
from config import MONGO_URI

logger = logging.getLogger("careerlens.database")

client = None
db = None

# In-memory store fallback when MongoDB is not connected
memory_store = {
    "evaluations": [],
    "resumes": {},
    "users": {}  # email -> user_dict
}

def connect_db():
    global client, db
    if not MONGO_URI:
        logger.info("MONGO_URI not configured. Using in-memory store for evaluations and users.")
        return

    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500)
        # Test connection
        client.admin.command('ping')
        db = client.get_database("careerlens_ai")
        # Ensure unique index on email
        try:
            db.users.create_index("email", unique=True)
        except Exception:
            pass
        logger.info("Successfully connected to MongoDB.")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB ({e}). Falling back to in-memory store.")
        client = None
        db = None

def get_db():
    return db

# ----------------- User Authentication & Hashing ----------------- #

def _hash_password(password: str) -> str:
    """Hash password using cryptographically secure PBKDF2-HMAC-SHA256."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${key.hex()}"

def _verify_password(password: str, hashed_str: str) -> bool:
    """Verify password against salt$hash string."""
    try:
        salt, expected_hash = hashed_str.split("$", 1)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(key.hex(), expected_hash)
    except Exception:
        return False

def create_user(name: str, email: str, password: str) -> dict:
    """Register a new user in MongoDB or memory store."""
    email_clean = email.strip().lower()
    name_clean = name.strip()
    
    # Check if user exists
    existing = get_user_by_email(email_clean)
    if existing:
        raise ValueError("An account with this email address already exists.")

    user_id = str(uuid.uuid4())
    token = secrets.token_urlsafe(32)
    pwd_hash = _hash_password(password)
    created_at = datetime.utcnow().isoformat()

    user_record = {
        "id": user_id,
        "name": name_clean,
        "email": email_clean,
        "password_hash": pwd_hash,
        "token": token,
        "created_at": created_at,
        "last_login": created_at
    }

    if db is not None:
        try:
            db.users.insert_one(user_record.copy())
        except Exception as e:
            logger.error(f"Failed to persist user to MongoDB: {e}")
            # Fall back to memory
            memory_store["users"][email_clean] = user_record
    else:
        memory_store["users"][email_clean] = user_record

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": name_clean,
            "email": email_clean,
            "created_at": created_at
        }
    }

def authenticate_user(email: str, password: str) -> dict:
    """Authenticate existing user and return session token."""
    email_clean = email.strip().lower()
    user = get_user_by_email(email_clean)
    if not user:
        raise ValueError("Invalid email or password.")

    if not _verify_password(password, user.get("password_hash", "")):
        raise ValueError("Invalid email or password.")

    token = secrets.token_urlsafe(32)
    now = datetime.utcnow().isoformat()

    if db is not None:
        try:
            db.users.update_one(
                {"email": email_clean},
                {"$set": {"token": token, "last_login": now}}
            )
        except Exception as e:
            logger.error(f"Failed to update user token in MongoDB: {e}")
    
    if email_clean in memory_store["users"]:
        memory_store["users"][email_clean]["token"] = token
        memory_store["users"][email_clean]["last_login"] = now

    return {
        "token": token,
        "user": {
            "id": user.get("id"),
            "name": user.get("name"),
            "email": email_clean,
            "created_at": user.get("created_at")
        }
    }

def get_user_by_email(email: str):
    email_clean = email.strip().lower()
    if db is not None:
        try:
            user = db.users.find_one({"email": email_clean}, {"_id": 0})
            if user:
                return user
        except Exception as e:
            logger.error(f"Error reading user from MongoDB: {e}")
    return memory_store["users"].get(email_clean)

def get_user_by_token(token: str):
    if not token:
        return None
    if db is not None:
        try:
            user = db.users.find_one({"token": token}, {"_id": 0, "password_hash": 0})
            if user:
                return user
        except Exception as e:
            logger.error(f"Error querying user by token from MongoDB: {e}")
    
    for u in memory_store["users"].values():
        if u.get("token") == token:
            safe = u.copy()
            safe.pop("password_hash", None)
            return safe
    return None

# ----------------- Evaluation Persistence ----------------- #

def save_evaluation(record: dict):
    if db is not None:
        try:
            return db.evaluations.insert_one(record)
        except Exception as e:
            logger.error(f"Error saving to MongoDB: {e}")
    # Fallback to memory
    memory_store["evaluations"].append(record)
    return True

def get_evaluations_by_user(identifier: str):
    if db is not None:
        try:
            return list(db.evaluations.find(
                {"$or": [
                    {"github_username": identifier},
                    {"candidate_name": identifier},
                    {"id": identifier}
                ]},
                {"_id": 0}
            ).sort("created_at", -1))
        except Exception as e:
            logger.error(f"Error reading from MongoDB: {e}")
    # Fallback
    return [
        rec for rec in memory_store["evaluations"]
        if rec.get("github_username") == identifier or rec.get("candidate_name") == identifier
    ]
