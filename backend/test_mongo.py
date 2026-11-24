
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")

if not mongo_uri:
    raise ValueError("MONGO_URI not found in .env")

client = MongoClient(mongo_uri, serverSelectionTimeoutMS=10000)

try:
    client.admin.command("ping")
    print("Successfully connected to MongoDB Atlas!")
    print("Database connection is working.")
except Exception as error:
    print("MongoDB connection failed:", error)
finally:
    client.close()
