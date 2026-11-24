import io
import unittest
from unittest.mock import Mock, patch

from services import s3_storage as storage

PDF = b"%PDF-1.7\nunit test PDF bytes"
KEY = "resumes/" + ("a" * 64) + "/" + ("b" * 32) + ".pdf"


class S3StorageTests(unittest.TestCase):
    def setUp(self):
        self.client = Mock()
        self.client_patch = patch.object(storage, "_get_client", return_value=self.client)
        self.client_patch.start()
        self.bucket_patch = patch.object(storage, "S3_RESUME_BUCKET", "private-test-bucket")
        self.bucket_patch.start()
        self.addCleanup(self.client_patch.stop)
        self.addCleanup(self.bucket_patch.stop)

    def test_upload_uses_private_bucket_and_returns_metadata(self):
        result = storage.upload_resume_file("user-1", PDF, "application/pdf")
        call = self.client.put_object.call_args.kwargs
        self.assertEqual(call["Bucket"], "private-test-bucket")
        self.assertEqual(call["Body"], PDF)
        self.assertEqual(call["ContentType"], "application/pdf")
        self.assertEqual(call["ServerSideEncryption"], "AES256")
        self.assertEqual(result["file_size"], len(PDF))
        self.assertEqual(result["content_type"], "application/pdf")
        self.assertTrue(result["object_key"].startswith("resumes/"))
        self.assertTrue(result["uploaded_at"])

    def test_keys_are_unique_for_same_owner(self):
        first = storage.upload_resume_file("user-1", PDF)["object_key"]
        second = storage.upload_resume_file("user-1", PDF)["object_key"]
        self.assertNotEqual(first, second)

    def test_download_returns_object_bytes(self):
        self.client.get_object.return_value = {"Body": io.BytesIO(PDF)}
        self.assertEqual(storage.download_resume_file(KEY), PDF)
        self.client.get_object.assert_called_once_with(Bucket="private-test-bucket", Key=KEY)

    def test_delete_targets_bucket_and_key(self):
        storage.delete_resume_file(KEY)
        self.client.delete_object.assert_called_once_with(Bucket="private-test-bucket", Key=KEY)

    def test_presigned_get_and_put_urls(self):
        self.client.generate_presigned_url.side_effect = ["get-url", "put-url"]
        self.assertEqual(storage.generate_presigned_download_url(KEY), "get-url")
        self.assertEqual(storage.generate_presigned_upload_url(KEY), "put-url")
        calls = self.client.generate_presigned_url.call_args_list
        self.assertEqual(calls[0].args[0], "get_object")
        self.assertEqual(calls[1].args[0], "put_object")
        self.assertEqual(calls[1].kwargs["Params"]["ContentType"], "application/pdf")

    def test_missing_bucket_is_controlled(self):
        with patch.object(storage, "S3_RESUME_BUCKET", " "):
            with self.assertRaises(storage.S3ConfigurationError):
                storage.upload_resume_file("user-1", PDF)

    def test_invalid_pdf_and_object_key_are_rejected(self):
        with self.assertRaises(storage.InvalidResumeFile):
            storage.upload_resume_file("user-1", b"not a pdf")
        with self.assertRaises(storage.S3StorageError):
            storage.download_resume_file("../private.pdf")

    def test_aws_failures_do_not_leak_provider_messages(self):
        self.client.put_object.side_effect = RuntimeError("secret endpoint and credential detail")
        with self.assertRaises(storage.S3StorageError) as raised:
            storage.upload_resume_file("user-1", PDF)
        self.assertNotIn("credential", str(raised.exception))


    def test_client_uses_configured_region(self):
        import sys
        import types

        fake_boto3 = Mock()
        fake_boto3.client.return_value = self.client
        fake_botocore = types.ModuleType("botocore")
        fake_config_module = types.ModuleType("botocore.config")
        fake_config_module.Config = Mock(return_value="sdk-config")
        fake_botocore.config = fake_config_module
        self.client_patch.stop()
        with patch.object(storage, "_s3_client", None), \
             patch.object(storage, "AWS_REGION", "ap-southeast-2"), \
             patch.dict(sys.modules, {"boto3": fake_boto3, "botocore": fake_botocore, "botocore.config": fake_config_module}):
            storage._get_client()
        fake_boto3.client.assert_called_once_with("s3", region_name="ap-southeast-2", config="sdk-config")

    def test_resume_metadata_is_persisted_and_retained(self):
        import database

        with patch.object(database, "_storage", return_value=None):
            database.memory_store["resumes"].pop(("test-owner", "test-resume"), None)
            database.save_resume_session(
                "test-owner", "test-resume", "plain resume text", {"page_count": 1},
                filename="cv.pdf", s3_object_key=KEY, content_type="application/pdf",
                file_size=len(PDF), uploaded_at="2026-01-01T00:00:00+00:00",
            )
            saved = database.save_resume_session(
                "test-owner", "test-resume", "plain resume text", {"page_count": 1},
                analysis={"score": 80},
            )
        self.assertEqual(saved["s3_object_key"], KEY)
        self.assertEqual(saved["content_type"], "application/pdf")
        self.assertEqual(saved["file_size"], len(PDF))
        self.assertEqual(saved["uploaded_at"], "2026-01-01T00:00:00+00:00")
        self.assertEqual(saved["filename"], "cv.pdf")
        self.assertEqual(saved["analysis"], {"score": 80})
        database.memory_store["resumes"].pop(("test-owner", "test-resume"), None)

    def test_missing_s3_object_is_identified(self):
        error = RuntimeError("missing")
        error.response = {"Error": {"Code": "NoSuchKey"}}
        self.client.get_object.side_effect = error
        with self.assertRaises(storage.S3ObjectNotFound):
            storage.download_resume_file(KEY)


if __name__ == "__main__":
    unittest.main()
