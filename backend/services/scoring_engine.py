from datetime import datetime
from services.feature_engine import calculate_activity_score

def calculate_engineering_score(features):
    score = (
        0.20 * features["language_entropy"] +
        0.20 * features["project_depth"] +
        0.20 * features["popularity_score"] +
        0.15 * features["activity_score"] +
        0.15 * features["documentation_score"] +
        0.10 * features["professional_signal"]
    )
    return round(score, 1)

def calculate_hard_ratio(easy, medium, hard):
    total = easy + medium + hard
    if total == 0:
        return 0.0
    hard_ratio = hard / total
    normalized = min(hard_ratio / 0.25, 1.0)
    return round(normalized * 100, 1)

def calculate_volume_score(total_solved):
    normalized = min(total_solved / 250, 1.0)
    return round(normalized * 100, 1)

def calculate_acceptance_score(rate):
    normalized = min(rate / 70.0, 1.0)
    return round(normalized * 100, 1)

def calculate_ranking_score(ranking):
    if ranking <= 0:
        return 0.0
    normalized = min(100000.0 / ranking, 1.0)
    return round(normalized * 100, 1)

def calculate_dsa_score(data):
    easy = data.get("easy", 0)
    medium = data.get("medium", 0)
    hard = data.get("hard", 0)
    total_solved = data.get("total_solved", 0)
    acceptance = data.get("acceptance_rate", 0)
    ranking = data.get("ranking", 0)

    hard_score = calculate_hard_ratio(easy, medium, hard)
    volume_score = calculate_volume_score(total_solved)
    acceptance_score = calculate_acceptance_score(acceptance)
    ranking_score = calculate_ranking_score(ranking)

    final_score = (
        0.30 * hard_score +
        0.25 * volume_score +
        0.20 * acceptance_score +
        0.25 * ranking_score
    )

    return {
        "hard_score": hard_score,
        "volume_score": volume_score,
        "acceptance_score": acceptance_score,
        "ranking_score": ranking_score,
        "dsa_score": round(final_score, 1)
    }

def calculate_collaboration_score(raw_github_data):
    repos = raw_github_data.get("repos", [])
    followers = raw_github_data.get("followers", 0)
    repo_count = raw_github_data.get("public_repos", 0)

    network_score = round(min(followers / 100.0, 1.0) * 100, 1)
    total_forks = sum(repo.get("forks_count", 0) for repo in repos)
    fork_score = round(min(total_forks / 40.0, 1.0) * 100, 1)
    total_issues = sum(repo.get("open_issues_count", 0) for repo in repos)
    issue_score = round(min(total_issues / 20.0, 1.0) * 100, 1)
    repo_scale_score = round(min(repo_count / 15.0, 1.0) * 100, 1)

    final_score = (
        0.30 * network_score +
        0.25 * fork_score +
        0.20 * issue_score +
        0.25 * repo_scale_score
    )

    return {
        "network_score": network_score,
        "fork_score": fork_score,
        "issue_score": issue_score,
        "repo_scale_score": repo_scale_score,
        "collaboration_score": round(final_score, 1)
    }

def calculate_consistency_score(github_raw, leetcode_data):
    repos = github_raw.get("repos", [])
    activity_score = calculate_activity_score(repos)

    creation_months = set()
    for repo in repos:
        created_at = repo.get("created_at")
        if created_at:
            try:
                dt = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ")
                creation_months.add((dt.year, dt.month))
            except Exception:
                pass
    repo_spread_score = round(min(len(creation_months) / 10.0, 1.0) * 100, 1)

    total_solved = leetcode_data.get("total_solved", 0) if leetcode_data else 0
    acceptance_rate = leetcode_data.get("acceptance_rate", 50) if leetcode_data else 50
    intensity = round(min((total_solved / 150.0), 1.0) * 100, 1)
    acceptance_stability = round(min(acceptance_rate / 65.0, 1.0) * 100, 1)

    final_score = (
        0.35 * activity_score +
        0.25 * repo_spread_score +
        0.25 * intensity +
        0.15 * acceptance_stability
    )

    return {
        "activity_score": activity_score,
        "repo_spread_score": repo_spread_score,
        "submission_intensity": intensity,
        "acceptance_stability": acceptance_stability,
        "consistency_score": round(final_score, 1)
    }

def calculate_final_readiness(engineering, dsa, consistency, collaboration):
    final_score = (
        0.30 * engineering +
        0.30 * dsa +
        0.20 * consistency +
        0.20 * collaboration
    )

    if final_score >= 85:
        category = "Tier-1 / High-Growth Product Ready"
    elif final_score >= 70:
        category = "Interview & Production Ready"
    elif final_score >= 55:
        category = "Active Growth Candidate"
    else:
        category = "Foundational Stage"

    return {
        "final_score": round(final_score, 1),
        "category": category
    }
