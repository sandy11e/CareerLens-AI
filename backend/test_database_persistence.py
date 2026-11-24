import copy
import sys
import types
import unittest
from unittest.mock import Mock, patch

import database


class FakeCollection:
    def __init__(self, documents=None, fail_writes=False):
        self.documents = documents if documents is not None else []
        self.fail_writes = fail_writes
        self.last_query = None

    def create_index(self, *_args, **_kwargs):
        return "index"

    def find_one(self, query, _projection=None, sort=None):
        self.last_query = query
        matches = [
            item for item in self.documents
            if all(item.get(key) == value for key, value in query.items())
        ]
        if sort:
            matches.sort(key=lambda item: item.get(sort[0][0], ""), reverse=sort[0][1] < 0)
        return matches[0].copy() if matches else None

    def replace_one(self, query, replacement, upsert=False):
        if self.fail_writes:
            raise OSError("simulated database outage")
        for index, item in enumerate(self.documents):
            if all(item.get(key) == value for key, value in query.items()):
                self.documents[index] = replacement.copy()
                return types.SimpleNamespace(matched_count=1)
        if upsert:
            self.documents.append(replacement.copy())
        return types.SimpleNamespace(matched_count=0)

    def update_one(self, query, update):
        for item in self.documents:
            if all(item.get(key) == value for key, value in query.items()):
                for key, value in update["$set"].items():
                    target = item
                    parts = key.split(".")
                    for part in parts[:-1]:
                        target = target.setdefault(part, {})
                    target[parts[-1]] = value
                return types.SimpleNamespace(matched_count=1)
        return types.SimpleNamespace(matched_count=0)

    def delete_one(self, query):
        before = len(self.documents)
        self.documents[:] = [
            item for item in self.documents
            if not all(item.get(key) == value for key, value in query.items())
        ]
        return types.SimpleNamespace(deleted_count=before - len(self.documents))

    def delete_many(self, query):
        return self.delete_one(query)

    def insert_one(self, document):
        if self.fail_writes:
            raise OSError("simulated database outage")
        self.documents.append(document.copy())

    def find(self, query, _projection=None):
        self.last_query = query
        results = [
            item.copy() for item in self.documents
            if all(item.get(key) == value for key, value in query.items())
        ]
        return FakeCursor(results)


class FakeCursor:
    def __init__(self, items):
        self.items = items

    def sort(self, key, direction):
        self.items.sort(key=lambda item: item.get(key, ""), reverse=direction < 0)
        return self

    def limit(self, count):
        self.items = self.items[:count]
        return self

    def __iter__(self):
        return iter(self.items)


class FakeDatabase:
    def __init__(self, fail_evaluation_writes=False):
        self.users = FakeCollection()
        self.resumes = FakeCollection()
        self.evaluations = FakeCollection(fail_writes=fail_evaluation_writes)
        self.conversations = FakeCollection()


class DatabasePersistenceTests(unittest.TestCase):
    def setUp(self):
        self.fake_db = FakeDatabase()
        self.get_db_patch = patch.object(database, "get_db", return_value=self.fake_db)
        self.get_db_patch.start()
        self.original_evaluations = copy.deepcopy(database.memory_store["evaluations"])
        self.original_resumes = copy.deepcopy(database.memory_store["resumes"])
        self.original_conversations = copy.deepcopy(database.memory_store["conversations"])

    def tearDown(self):
        self.get_db_patch.stop()
        database.memory_store["evaluations"] = self.original_evaluations
        database.memory_store["resumes"] = self.original_resumes
        database.memory_store["conversations"] = self.original_conversations

    def test_user_can_read_own_evaluation_but_not_another_users(self):
        database.save_full_evaluation("user-a", {"evaluation_id": "eval-a", "value": 1})
        self.assertEqual(
            database.get_user_evaluation_detail("user-a", "eval-a")["value"], 1
        )
        self.assertIsNone(database.get_user_evaluation_detail("user-b", "eval-a"))

    def test_invalid_evaluation_and_missing_identity_do_not_bypass_ownership(self):
        database.save_full_evaluation("user-a", {"evaluation_id": "eval-a"})
        self.assertIsNone(database.get_user_evaluation_detail("user-a", "missing"))
        self.assertIsNone(database.get_user_evaluation_detail("", "eval-a"))
        self.assertIsNone(database.get_user_evaluation_detail(None, "eval-a"))

    def test_evaluation_query_always_contains_owner(self):
        database.save_full_evaluation("user-a", {"evaluation_id": "eval-a"})
        database.get_user_evaluation_detail("user-b", "eval-a")
        self.assertEqual(
            self.fake_db.evaluations.last_query,
            {"id": "eval-a", "user_id": "user-b"},
        )

    def test_latest_evaluation_is_scoped_to_user(self):
        database.save_full_evaluation("user-a", {"evaluation_id": "eval-a", "created_at": "2025-01-01"})
        database.save_full_evaluation("user-b", {"evaluation_id": "eval-b", "created_at": "2026-01-01"})
        self.assertEqual(
            database.get_user_evaluation_detail("user-a", "latest")["evaluation_id"],
            "eval-a",
        )

    def test_resume_session_is_persisted_and_owner_scoped(self):
        database.save_resume_session(
            "user-a", "resume-a", "resume text", {"page_count": 2}, "cv.pdf"
        )
        own = database.get_resume_session("resume-a", "user-a")
        self.assertEqual(own["raw_text"], "resume text")
        self.assertIsNone(database.get_resume_session("resume-a", "user-b"))
        self.assertNotIn("pdf_bytes", own)

    def test_evaluation_context_and_chat_are_user_scoped(self):
        database.save_full_evaluation("user-a", {"evaluation_id": "eval-a"})
        database.update_evaluation_context("user-a", "eval-a", {"roadmap": {"steps": []}})
        own = database.get_user_evaluation_detail("user-a", "eval-a")
        self.assertEqual(own["roadmap"], {"steps": []})
        self.assertIsNone(database.get_user_evaluation_detail("user-b", "eval-a"))

        database.save_chat_message("user-a", "user", "hello", "eval-a")
        self.assertEqual(len(database.get_chat_history("user-a", evaluation_id="eval-a")), 1)
        self.assertEqual(database.get_chat_history("user-b", evaluation_id="eval-a"), [])

    def test_mongodb_write_failure_raises_instead_of_reporting_success(self):
        failing_db = FakeDatabase(fail_evaluation_writes=True)
        self.get_db_patch.stop()
        self.get_db_patch = patch.object(database, "get_db", return_value=failing_db)
        self.get_db_patch.start()
        before = len(database.memory_store["evaluations"])
        with self.assertRaises(database.DatabaseUnavailable):
            database.save_full_evaluation("user-a", {"evaluation_id": "eval-a"})
        self.assertEqual(len(database.memory_store["evaluations"]), before)


class ConnectionLifecycleTests(unittest.TestCase):
    def setUp(self):
        self.originals = {
            "client": database.client,
            "db": database.db,
            "attempted": database._connection_attempted,
            "error": database._last_connection_error,
            "retry_after": database._retry_after,
            "uri": database.MONGO_URI,
            "production": database._production,
        }
        database.client = None
        database.db = None
        database._connection_attempted = False
        database._last_connection_error = None
        database._retry_after = 0.0
        database.MONGO_URI = "mongodb://unit-test.invalid"
        database._production = False

    def tearDown(self):
        database.client = self.originals["client"]
        database.db = self.originals["db"]
        database._connection_attempted = self.originals["attempted"]
        database._last_connection_error = self.originals["error"]
        database._retry_after = self.originals["retry_after"]
        database.MONGO_URI = self.originals["uri"]
        database._production = self.originals["production"]

    def test_connection_is_created_once_and_reused(self):
        fake_db = FakeDatabase()
        fake_client = Mock()
        fake_client.admin.command.return_value = {"ok": 1}
        fake_client.get_database.return_value = fake_db
        mongo_module = types.SimpleNamespace(MongoClient=Mock(return_value=fake_client))
        with patch.dict(sys.modules, {"pymongo": mongo_module}):
            first = database.connect_db()
            second = database.connect_db()
        self.assertIs(first, fake_db)
        self.assertIs(second, fake_db)
        mongo_module.MongoClient.assert_called_once()
        fake_client.close.assert_not_called()

    def test_production_missing_uri_fails_without_memory_fallback(self):
        database.MONGO_URI = ""
        database._production = True
        with self.assertRaises(database.DatabaseUnavailable):
            database.connect_db()

    def test_production_connection_failure_fails_closed(self):
        database._production = True
        mongo_module = types.SimpleNamespace(MongoClient=Mock(side_effect=OSError("unavailable")))
        with patch.dict(sys.modules, {"pymongo": mongo_module}):
            with self.assertRaises(database.DatabaseUnavailable):
                database.connect_db()
        self.assertIsNone(database.db)
        self.assertIsNone(database.client)

    def test_production_connection_failure_is_throttled(self):
        database._production = True
        factory = Mock(side_effect=OSError("unavailable"))
        mongo_module = types.SimpleNamespace(MongoClient=factory)
        with patch.dict(sys.modules, {"pymongo": mongo_module}):
            with self.assertRaises(database.DatabaseUnavailable):
                database.connect_db()
            with self.assertRaises(database.DatabaseUnavailable):
                database.connect_db()
        factory.assert_called_once()


if __name__ == "__main__":
    unittest.main()
