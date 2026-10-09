import requests
import logging
from urllib.parse import unquote, urlsplit
from config import GITHUB_TOKEN

logger = logging.getLogger("careerlens.github")
GITHUB_API = "https://api.github.com/users/"

def normalize_github_username(username: str) -> str:
    value = username.strip()
    if not value:
        return ""

    if value.startswith("@"):
        value = value[1:]

    if "://" in value:
        parsed = urlsplit(value)
        if parsed.netloc.lower() in {"github.com", "www.github.com"}:
            value = parsed.path
    elif value.lower().startswith(("github.com/", "www.github.com/")):
        value = value.split("/", 1)[1]

    value = unquote(value).strip("/")
    value = value.split("/", 1)[0].split("?", 1)[0].split("#", 1)[0]
    return value.lstrip("@").strip()

def get_headers():
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    return headers

def get_github_profile(username: str):
    clean_user = normalize_github_username(username)
    url = f"{GITHUB_API}{clean_user}"
    try:
        response = requests.get(url, headers=get_headers(), timeout=10)
        if response.status_code != 200:
            logger.warning(
                "GitHub user %s lookup returned %s (rate-limit remaining: %s)",
                clean_user,
                response.status_code,
                response.headers.get("X-RateLimit-Remaining", "unknown"),
            )
            return None
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching GitHub profile {clean_user}: {e}")
        return None

def get_user_repos(username: str):
    clean_user = normalize_github_username(username)
    url = f"{GITHUB_API}{clean_user}/repos?per_page=100&sort=pushed"
    try:
        response = requests.get(url, headers=get_headers(), timeout=10)
        if response.status_code != 200:
            logger.warning(
                "GitHub repositories for %s lookup returned %s (rate-limit remaining: %s)",
                clean_user,
                response.status_code,
                response.headers.get("X-RateLimit-Remaining", "unknown"),
            )
            return []
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching repos for {clean_user}: {e}")
        return []

def extract_github_raw(username: str):
    if not username or not username.strip():
        return None

    profile = get_github_profile(username)
    if not profile:
        return None

    repos = get_user_repos(username)

    return {
        "username": profile.get("login", username),
        "name": profile.get("name"),
        "bio": profile.get("bio"),
        "avatar_url": profile.get("avatar_url"),
        "html_url": profile.get("html_url"),
        "public_repos": profile.get("public_repos", 0),
        "followers": profile.get("followers", 0),
        "following": profile.get("following", 0),
        "created_at": profile.get("created_at"),
        "repos": repos
    }
