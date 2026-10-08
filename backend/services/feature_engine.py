import math
from collections import Counter
from datetime import datetime

def calculate_language_entropy(repos):
    languages = [repo.get("language") for repo in repos if repo.get("language")]
    if not languages:
        return 0.0

    total = len(languages)
    counts = Counter(languages)

    entropy = 0.0
    for lang, count in counts.items():
        p = count / total
        entropy -= p * math.log2(p)

    max_entropy = math.log2(len(counts)) if len(counts) > 1 else 1.0
    normalized_entropy = entropy / max_entropy if max_entropy != 0 else 0.0
    return round(normalized_entropy * 100, 2)

def calculate_project_depth(repos):
    sizes = [repo.get("size", 0) for repo in repos]
    if not sizes:
        return 0.0
    avg_size = sum(sizes) / len(sizes)
    normalized = min(avg_size / 5000, 1.0)
    return round(normalized * 100, 2)

def calculate_documentation_score(repos):
    if not repos:
        return 0.0
    score = sum(1 for repo in repos if repo.get("description"))
    return round((score / len(repos)) * 100, 2)

def calculate_popularity_score(repos):
    if not repos:
        return 0.0
    total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
    total_forks = sum(repo.get("forks_count", 0) for repo in repos)
    raw_score = total_stars * 2 + total_forks
    normalized = min(raw_score / 50, 1.0)
    return round(normalized * 100, 2)

def calculate_activity_score(repos):
    if not repos:
        return 0.0
    recent_count = 0
    now = datetime.utcnow()
    for repo in repos:
        pushed_at = repo.get("pushed_at")
        if pushed_at:
            try:
                pushed_date = datetime.strptime(pushed_at, "%Y-%m-%dT%H:%M:%SZ")
                days_diff = (now - pushed_date).days
                if days_diff < 45:
                    recent_count += 1
            except Exception:
                pass
    return round((recent_count / len(repos)) * 100, 2)

def calculate_professional_signal(repos):
    if not repos:
        return 0.0
    count = sum(1 for repo in repos if repo.get("has_pages") or repo.get("has_wiki") or repo.get("license"))
    return round((count / len(repos)) * 100, 2)

def extract_engineering_features(raw_data):
    repos = raw_data.get("repos", [])
    return {
        "language_entropy": calculate_language_entropy(repos),
        "project_depth": calculate_project_depth(repos),
        "documentation_score": calculate_documentation_score(repos),
        "popularity_score": calculate_popularity_score(repos),
        "activity_score": calculate_activity_score(repos),
        "professional_signal": calculate_professional_signal(repos),
    }
