
import uuid

from database import (
    connect_db,
    get_db,
    create_user,
    authenticate_user,
    save_full_evaluation,
    get_user_evaluations,
    get_user_evaluation_detail,
    delete_user_evaluation,
    save_chat_message,
    get_chat_history,
    clear_chat_history,
)

# Connect to Atlas
connect_db()
db = get_db()

if db is None:
    raise RuntimeError("MongoDB is not connected. Aborting tests.")

print("\nMongoDB Atlas integration tests\n")

# Unique temporary test data
suffix = uuid.uuid4().hex[:10]
email = f"atlas_test_{suffix}@example.com"
password = "TemporaryTestPassword123!"
evaluation_id = f"test-eval-{suffix}"
user_id = None

try:
    # 1. USER REGISTRATION AND LOGIN
    result = create_user("Atlas Test User", email, password)
    user_id = result["user"]["id"]

    # Confirm user exists in MongoDB
    stored_user = db.users.find_one({"email": email})
    assert stored_user is not None

    # Authenticate using stored credentials
    login = authenticate_user(email, password)
    assert login["user"]["email"] == email

    print("PASS: User registration and login persisted in Atlas")

    # 2. EVALUATION SAVE AND RETRIEVAL
    evaluation = {
        "evaluation_id": evaluation_id,
        "candidate_info": {"name": "Atlas Test Candidate"},
        "headline": "Test Engineer",
        "target_role": "Software Engineer",
        "holistic_score": 85,
        "resume_overall_score": 80,
        "readiness_category": "Interview Ready",
    }

    save_full_evaluation(user_id, evaluation)

    records = get_user_evaluations(user_id)
    assert any(item["id"] == evaluation_id for item in records)

    detail = get_user_evaluation_detail(user_id, evaluation_id)
    assert detail is not None

    print("PASS: Evaluation saved and retrieved from Atlas")

    # 3. CONVERSATION HISTORY
    save_chat_message(
        user_id,
        "user",
        "Testing MongoDB Atlas persistence",
        evaluation_id,
    )

    messages = get_chat_history(user_id, evaluation_id=evaluation_id)
    assert any(
        message["content"] == "Testing MongoDB Atlas persistence"
        for message in messages
    )

    print("PASS: Conversation history saved and retrieved from Atlas")

finally:
    # Clean up temporary test records
    if user_id:
        db.conversations.delete_many({"user_id": user_id})
        db.evaluations.delete_many({"id": evaluation_id})
        db.users.delete_one({"email": email})

    print("\nTemporary test records cleaned up.")

print("\nAll three integration tests completed successfully!")
