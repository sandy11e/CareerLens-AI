import requests
import logging

logger = logging.getLogger("careerlens.leetcode")
LEETCODE_URL = "https://leetcode.com/graphql"

def get_leetcode_profile(username: str):
    clean_user = username.strip().replace("https://leetcode.com/", "").replace("https://leetcode.com/u/", "").replace("/", "")
    
    query = """
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            username
            profile {
                ranking
                userAvatar
                reputation
            }
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                }
                totalSubmissionNum {
                    difficulty
                    count
                }
            }
        }
    }
    """

    variables = {"username": clean_user}

    try:
        response = requests.post(
            LEETCODE_URL,
            json={"query": query, "variables": variables},
            timeout=10
        )
        if response.status_code != 200:
            logger.warning(f"LeetCode GraphQL returned status {response.status_code}")
            return None
        return response.json()
    except Exception as e:
        logger.error(f"Error querying LeetCode for {clean_user}: {e}")
        return None

def extract_leetcode_features(username: str):
    if not username or not username.strip():
        return None

    data = get_leetcode_profile(username)

    if not data or not data.get("data") or not data["data"].get("matchedUser"):
        return None

    user = data["data"]["matchedUser"]

    ac_stats = (user.get("submitStats") or {}).get("acSubmissionNum") or []
    total_stats = (user.get("submitStats") or {}).get("totalSubmissionNum") or []

    difficulty_map = {item["difficulty"]: item["count"] for item in ac_stats if isinstance(item, dict) and "difficulty" in item}
    total_map = {item["difficulty"]: item["count"] for item in total_stats if isinstance(item, dict) and "difficulty" in item}

    easy = difficulty_map.get("Easy", 0)
    medium = difficulty_map.get("Medium", 0)
    hard = difficulty_map.get("Hard", 0)

    total_solved = easy + medium + hard
    total_submissions = sum(total_map.values())

    acceptance_rate = (
        round((total_solved / total_submissions) * 100, 2)
        if total_submissions > 0 else 0.0
    )

    ranking = (user.get("profile") or {}).get("ranking", 0)
    avatar = (user.get("profile") or {}).get("userAvatar", "")

    return {
        "username": user.get("username", username),
        "avatar_url": avatar,
        "easy": easy,
        "medium": medium,
        "hard": hard,
        "total_solved": total_solved,
        "total_submissions": total_submissions,
        "acceptance_rate": acceptance_rate,
        "ranking": ranking
    }
