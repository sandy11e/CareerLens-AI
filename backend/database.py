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
    "users": {},  # email -> user_dict
    "conversations": {}  # user_id -> list of messages
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
            db.conversations.create_index([("user_id", 1), ("timestamp", 1)])
            db.evaluations.create_index([("user_id", 1), ("created_at", -1)])
            db.evaluations.create_index("id", unique=True)
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

def save_full_evaluation(user_id: str, record: dict):
    """
    Persist the complete multi-signal candidate analysis in MongoDB tagged with user_id.
    """
    eval_id = record.get("evaluation_id") or str(uuid.uuid4())
    cand_info = record.get("candidate_info") or {}
    now_iso = datetime.utcnow().isoformat()

    doc = {
        "id": eval_id,
        "user_id": user_id,
        "candidate_name": cand_info.get("name") or record.get("candidate_name") or "Candidate",
        "headline": record.get("headline", "Software Developer"),
        "github_username": cand_info.get("github") or record.get("github_signals", {}).get("login", ""),
        "leetcode_username": record.get("leetcode_signals", {}).get("username", ""),
        "target_role": record.get("target_role", "Software Engineer"),
        "holistic_score": record.get("holistic_score", 0),
        "resume_overall_score": record.get("resume_overall_score", 0),
        "readiness_category": record.get("readiness_category", "Interview Ready"),
        "full_analysis": record,
        "created_at": record.get("created_at") or now_iso
    }

    if db is not None:
        try:
            # Upsert by id
            db.evaluations.replace_one({"id": eval_id}, doc, upsert=True)
            return doc
        except Exception as e:
            logger.error(f"Error saving full evaluation to MongoDB: {e}")

    # Fallback to memory
    memory_store["evaluations"] = [e for e in memory_store["evaluations"] if e.get("id") != eval_id]
    memory_store["evaluations"].append(doc)
    return doc

def get_user_evaluations(user_id: str, limit: int = 30):
    """
    Retrieve audit history summaries for a specific user.
    """
    if not user_id:
        return []
    if db is not None:
        try:
            return list(db.evaluations.find(
                {"user_id": user_id},
                {
                    "_id": 0,
                    "id": 1,
                    "candidate_name": 1,
                    "headline": 1,
                    "github_username": 1,
                    "leetcode_username": 1,
                    "target_role": 1,
                    "holistic_score": 1,
                    "resume_overall_score": 1,
                    "readiness_category": 1,
                    "created_at": 1
                }
            ).sort("created_at", -1).limit(limit))
        except Exception as e:
            logger.error(f"Error reading user evaluations from MongoDB: {e}")

    # Fallback to memory
    res = [
        {
            "id": e.get("id"),
            "candidate_name": e.get("candidate_name"),
            "headline": e.get("headline"),
            "github_username": e.get("github_username"),
            "leetcode_username": e.get("leetcode_username"),
            "target_role": e.get("target_role"),
            "holistic_score": e.get("holistic_score"),
            "resume_overall_score": e.get("resume_overall_score"),
            "readiness_category": e.get("readiness_category"),
            "created_at": e.get("created_at")
        }
        for e in memory_store["evaluations"]
        if e.get("user_id") == user_id
    ]
    res.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
    return res[:limit]

def get_user_evaluation_detail(user_id: str, evaluation_id: str):
    """
    Retrieve complete full_analysis payload for a specific evaluation.
    """
    if db is not None:
        try:
            doc = db.evaluations.find_one(
                {"$or": [
                    {"id": evaluation_id, "user_id": user_id},
                    {"id": evaluation_id} # fallback if guest or admin
                ]},
                {"_id": 0}
            )
            if doc:
                return doc.get("full_analysis") or doc
        except Exception as e:
            logger.error(f"Error fetching evaluation detail: {e}")

    for e in memory_store["evaluations"]:
        if e.get("id") == evaluation_id:
            return e.get("full_analysis") or e
    return None

def delete_user_evaluation(user_id: str, evaluation_id: str):
    """
    Delete an evaluation from a user's audit history.
    """
    if db is not None:
        try:
            res = db.evaluations.delete_one({"id": evaluation_id, "user_id": user_id})
            return res.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting evaluation: {e}")

    before = len(memory_store["evaluations"])
    memory_store["evaluations"] = [e for e in memory_store["evaluations"] if not (e.get("id") == evaluation_id and e.get("user_id") == user_id)]
    return len(memory_store["evaluations"]) < before

def save_evaluation(record: dict):
    """Legacy helper for backward compatibility."""
    return save_full_evaluation(user_id=record.get("user_id", "guest"), record=record)

def get_evaluations_by_user(identifier: str):
    """Legacy helper for backward compatibility."""
    return get_user_evaluations(user_id=identifier)


# ----------------- Conversation History Persistence ----------------- #

def save_chat_message(user_id: str, role: str, content: str, evaluation_id: str = None):
    msg = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "role": role,
        "content": content,
        "evaluation_id": evaluation_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    if db is not None:
        try:
            db.conversations.insert_one(msg.copy())
        except Exception as e:
            logger.error(f"Error saving chat message to MongoDB: {e}")
            memory_store.setdefault("conversations", {}).setdefault(user_id, []).append(msg)
    else:
        memory_store.setdefault("conversations", {}).setdefault(user_id, []).append(msg)
    return msg

def get_chat_history(user_id: str, limit: int = 50):
    if not user_id:
        return []
    if db is not None:
        try:
            msgs = list(db.conversations.find(
                {"user_id": user_id},
                {"_id": 0}
            ).sort("timestamp", 1).limit(limit))
            return msgs
        except Exception as e:
            logger.error(f"Error reading chat history from MongoDB: {e}")
    
    return memory_store.get("conversations", {}).get(user_id, [])[-limit:]

def clear_chat_history(user_id: str):
    if not user_id:
        return False
    if db is not None:
        try:
            db.conversations.delete_many({"user_id": user_id})
        except Exception as e:
            logger.error(f"Error clearing chat history in MongoDB: {e}")
    if "conversations" in memory_store and user_id in memory_store["conversations"]:
        memory_store["conversations"][user_id] = []
    return True

