from typing import Dict, Any, List

def cross_verify_candidate(resume_data: Dict[str, Any], github_data: Dict[str, Any] = None, leetcode_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Cross-verifies claims made on the resume against real-world engineering
    footprints from GitHub and LeetCode.
    """
    resume_skills = [s.strip().lower() for s in resume_data.get("all_skills", []) if s]
    
    # 1. Extract GitHub signals
    github_languages = []
    github_repos_summary = []
    if github_data and github_data.get("repos"):
        for repo in github_data["repos"]:
            lang = repo.get("language")
            if lang:
                github_languages.append(lang.lower())
            github_repos_summary.append({
                "name": repo.get("name"),
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "description": repo.get("description", "")
            })

    unique_gh_langs = list(set(github_languages))

    # 2. Extract LeetCode signals
    leetcode_solved = 0
    if leetcode_data:
        leetcode_solved = leetcode_data.get("total_solved", 0)

    # 3. Categorize Skills: Verified vs Unverified vs Bonus
    verified = []
    unverified = []
    bonus_skills = []

    for sk in resume_skills:
        # Check against GitHub languages or repo descriptions
        matched_repo = None
        if github_data and github_data.get("repos"):
            for repo in github_data["repos"]:
                r_lang = (repo.get("language") or "").lower()
                r_name = (repo.get("name") or "").lower()
                r_desc = (repo.get("description") or "").lower()
                if sk in r_lang or sk in r_name or sk in r_desc:
                    matched_repo = repo.get("name")
                    break

        # Check against DSA/Algorithms
        if sk in ["dsa", "algorithms", "data structures", "problem solving", "competitive programming"]:
            if leetcode_solved > 50:
                verified.append({
                    "skill": sk.title(),
                    "proof_type": "LeetCode Verification",
                    "evidence": f"Backed by {leetcode_solved} verified LeetCode problem solutions."
                })
                continue

        if matched_repo:
            verified.append({
                "skill": sk.title(),
                "proof_type": "GitHub Repository Proof",
                "evidence": f"Demonstrated in active repository '{matched_repo}'."
            })
        else:
            unverified.append({
                "skill": sk.title(),
                "note": "Mentioned on resume without corresponding public repo or code samples."
            })

    # Find bonus skills present on GitHub but missing from Resume
    for gh_lang in unique_gh_langs:
        if not any(gh_lang == rs or gh_lang in rs for rs in resume_skills):
            bonus_skills.append(gh_lang.title())

    # 4. Calculate Portfolio Credibility & Trust Score
    total_claims = len(resume_skills) if resume_skills else 1
    verified_count = len(verified)
    
    base_trust = 50
    ratio_score = (verified_count / total_claims) * 35 if total_claims > 0 else 0
    gh_bonus = 10 if (github_data and github_data.get("public_repos", 0) > 3) else 0
    lc_bonus = 10 if (leetcode_solved > 40) else 0

    trust_score = round(min(base_trust + ratio_score + gh_bonus + lc_bonus, 98), 1)

    return {
        "trust_score": trust_score,
        "verified_skills_count": verified_count,
        "unverified_skills_count": len(unverified),
        "verified_skills": verified,
        "unverified_skills": unverified[:8],
        "omitted_github_strengths": bonus_skills[:6],
        "dsa_verified": leetcode_solved > 30,
        "summary": (
            f"Portfolio Trust Score: {trust_score}%. {verified_count} skills verified with concrete code artifacts."
            + (f" Found {len(bonus_skills)} high-value languages on GitHub not yet highlighted on resume!" if bonus_skills else "")
        )
    }
