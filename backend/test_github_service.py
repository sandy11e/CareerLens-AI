import unittest
from unittest.mock import patch

from services.github_service import get_github_profile, normalize_github_username


class GithubUsernameNormalizationTests(unittest.TestCase):
    def test_normalizes_usernames_and_profile_urls(self):
        examples = (
            ("octocat", "octocat"),
            ("@octocat", "octocat"),
            ("https://github.com/octocat/", "octocat"),
            ("https://github.com/octocat?tab=repositories", "octocat"),
            ("github.com/octocat", "octocat"),
            ("www.github.com/octocat/repos", "octocat"),
        )

        for supplied, expected in examples:
            with self.subTest(supplied=supplied):
                self.assertEqual(normalize_github_username(supplied), expected)

    @patch("services.github_service.requests.get")
    def test_profile_lookup_uses_normalized_username(self, mock_get):
        response = mock_get.return_value
        response.status_code = 200
        response.headers = {}
        response.json.return_value = {"login": "octocat"}

        profile = get_github_profile("https://github.com/octocat?tab=repositories")

        self.assertEqual(profile["login"], "octocat")
        self.assertEqual(mock_get.call_args.args[0], "https://api.github.com/users/octocat")


if __name__ == "__main__":
    unittest.main()
