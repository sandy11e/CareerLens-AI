import logging
from config import MONGO_URI

logger = logging.getLogger("careerlens.database")

client = None
db = None

# In-memory store fallback when MongoDB is not connected
memory_store = {
    "evaluations": [],
    "resumes": {}
}

def connect_db():
    global client, db
    if not MONGO_URI:
        logger.info("MONGO_URI not configured. Using in-memory store for evaluations.")
        return

    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2500)
        # Test connection
        client.admin.command('ping')
        db = client.get_database("careerlens_ai")
        logger.info("Successfully connected to MongoDB.")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB ({e}). Falling back to in-memory store.")
        client = None
        db = None

def get_db():
    return db

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
