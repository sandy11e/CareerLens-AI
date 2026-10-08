import logging
from typing import Dict, Any, List
from services.groq_service import generate_structured_json, is_groq_configured
from services.job_database import jobs

logger = logging.getLogger("careerlens.roadmap")

ROADMAP_PROMPT = """You are a Principal Engineering Director and Elite Career Strategist.
Create a hyper-personalized, 4-stage career roadmap specifically designed for this candidate to achieve their target role: "{target_job}".

CANDIDATE CONTEXT:
- Candidate Name: {name}
- Current Profile: {headline}
- Extracted Skills: {skills}
- TARGET GOAL / ROLE: {target_job}
- Missing Skill Gaps for this Role: {missing_skills}
- Unverified Claims: {unverified_skills}
- GitHub Footprint: {repo_count} public repositories
- LeetCode DSA: {solved_count} problems solved (Easy: {easy}, Med: {med}, Hard: {hard})
- ATS Score: {ats_score}/100

STRICT INSTRUCTIONS:
- Tailor EVERY stage, task, project, and interview tip specifically toward excelling as a "{target_job}".
- Stage 1: Weeks 1-2 (Resume & Profile optimizations for {target_job}).
- Stage 2: Weeks 3-5 (Skill Gap Sprint & Building Proof-of-Work for {target_job}).
- Stage 3: Weeks 6-8 (System Architecture, Testing, & Polish for {target_job}).
- Stage 4: Weeks 9-10 (Targeted Applications & Technical Interview Preparation for {target_job}).
- Each stage must have 3-4 concrete actionable tasks with unique checkbox IDs (e.g., "t1_1", "t1_2", "t2_1", etc.).
- Propose an impressive Portfolio Project Blueprint with modern architecture and tech stack that will wow hiring managers for "{target_job}".
- Return ONLY valid JSON matching the exact schema below:

{{
  "target_role": "{target_job}",
  "estimated_weeks": 10,
  "summary": "1-2 sentence high-impact summary of how this roadmap bridges the candidate's gaps to land a {target_job} role",
  "project_blueprint": {{
    "title": "Project Title",
    "description": "What to build and why recruiters for {target_job} will love it",
    "tech_stack": ["Tech1", "Tech2", "Tech3"],
    "key_features": ["Feature 1 with metric", "Feature 2"],
    "github_setup_tip": "Advice on README, CI/CD, and live deployment"
  }},
  "leetcode_curriculum": {{
    "current_level": "Beginner" | "Intermediate" | "Advanced",
    "weekly_goal": "e.g. 5 Mediums per week",
    "recommended_patterns": [
      {{ "pattern": "Pattern Name (e.g. Sliding Window)", "why": "Why it matters in interviews for {target_job}", "sample_problems": ["Problem 1", "Problem 2"] }}
    ]
  }},
  "stages": [
    {{
      "stage_number": 1,
      "title": "Stage Title",
      "timeframe": "Weeks 1-2",
      "objective": "Clear goal",
      "tasks": [
        {{ "id": "t1_1", "text": "Task description", "category": "Resume" | "Code" | "DSA" | "Application" }}
      ]
    }}
  ]
}}
"""

def generate_personalized_roadmap(candidate_context: Dict[str, Any], target_role: str = None) -> Dict[str, Any]:
    """
    Generates a personalized, interactive career roadmap tailored to the candidate's chosen target role.
    """
    cand_info = candidate_context.get("candidate_info", {})
    name = cand_info.get("name", "Candidate")
    headline = candidate_context.get("headline", "Software Engineer")
    candidate_skills = candidate_context.get("all_skills", [])
    skills_str = ", ".join(candidate_skills[:10])

    # Determine effective target role
    effective_target_job = (
        target_role.strip() if target_role and target_role.strip()
        else candidate_context.get("target_role")
        or (candidate_context.get("job_matches", [{}])[0].get("title") if candidate_context.get("job_matches") else "Full Stack Software Engineer")
    )

    # Calculate missing skills for target role
    missing_skills = []
    normalized_skills = [s.lower() for s in candidate_skills]
    for j in jobs:
        if j["title"].lower() == effective_target_job.lower() or effective_target_job.lower() in j["title"].lower():
            for req in j.get("skills_required", []):
                if req.lower() not in normalized_skills:
                    missing_skills.append(req)
            break

    if not missing_skills:
        missing_skills = ["Docker", "Kubernetes", "CI/CD", "TypeScript", "System Design"]

    missing_str = ", ".join(missing_skills[:4])

    cross_ver = candidate_context.get("cross_verification", {})
    unverified = ", ".join([u["skill"] for u in cross_ver.get("unverified_skills", [])[:3]])
    
    gh = candidate_context.get("github_signals") or {}
    lc = candidate_context.get("leetcode_signals") or {}
    ats_score = candidate_context.get("scores", {}).get("ats_compatibility", 70)

    if is_groq_configured():
        try:
            prompt = ROADMAP_PROMPT.format(
                name=name,
                headline=headline,
                skills=skills_str,
                target_job=effective_target_job,
                missing_skills=missing_str,
                unverified_skills=unverified,
                repo_count=gh.get("public_repos", 0),
                solved_count=lc.get("total_solved", 0),
                easy=lc.get("easy", 0),
                med=lc.get("medium", 0),
                hard=lc.get("hard", 0),
                ats_score=ats_score
            )
            result = generate_structured_json(prompt, system_prompt="You are an elite career architect. Return valid JSON only.")
            result["is_ai_generated"] = True
            result["target_role"] = effective_target_job
            return result
        except Exception as e:
            logger.error(f"Groq roadmap generation error: {e}. Falling back to dynamic heuristic.")

    # High-quality dynamic fallback roadmap
    return generate_fallback_roadmap(name, effective_target_job, missing_str, unverified, lc.get("total_solved", 0))


def generate_fallback_roadmap(name: str, target_job: str, missing_skills: str, unverified: str, lc_count: int) -> Dict[str, Any]:
    missing_list = [s.strip() for s in missing_skills.split(",") if s.strip()] or ["Docker", "TypeScript", "PostgreSQL"]
    primary_missing = missing_list[0] if missing_list else "Cloud Architecture"
    
    return {
        "target_role": target_job,
        "estimated_weeks": 8,
        "summary": f"Targeted roadmap to accelerate {name}'s transition into a high-impact {target_job} role by closing skill gaps ({', '.join(missing_list[:3])}) and establishing verified portfolio proof.",
        "is_ai_generated": False,
        "project_blueprint": {
            "title": f"Production-Grade {target_job} Showcase System",
            "description": f"Architect and deploy a high-concurrency microservice utilizing {', '.join(missing_list[:3])} with automated CI/CD and comprehensive test coverage.",
            "tech_stack": missing_list[:4] + ["FastAPI / Node.js", "Docker", "GitHub Actions"],
            "key_features": [
                "End-to-end containerized deployment with Docker and automated GitHub Actions CI/CD",
                "Sub-50ms query latency backed by Redis caching and connection pooling",
                "Interactive live Swagger/OpenAPI documentation and Prometheus health metrics"
            ],
            "github_setup_tip": "Include a video demonstration GIF, benchmark performance graphs, and an architecture diagram in your repository README."
        },
        "leetcode_curriculum": {
            "current_level": "Intermediate" if lc_count > 60 else "Foundational",
            "weekly_goal": "4-5 Mediums per week with pattern mastery",
            "recommended_patterns": [
                {
                    "pattern": "Two Pointers & Sliding Window",
                    "why": "Fundamental for string & array optimization questions in tier-1 company rounds",
                    "sample_problems": ["Longest Substring Without Repeating Characters", "Minimum Window Substring"]
                },
                {
                    "pattern": "Graph Traversal (BFS & DFS)",
                    "why": "Critical for dependency trees and network routing questions",
                    "sample_problems": ["Number of Islands", "Course Schedule", "Clone Graph"]
                },
                {
                    "pattern": "Dynamic Programming & Memoization",
                    "why": "Tests optimal substructure and state-space reduction",
                    "sample_problems": ["Coin Change", "Longest Increasing Subsequence"]
                }
            ]
        },
        "stages": [
            {
                "stage_number": 1,
                "title": f"Resume & Profile Optimization for {target_job}",
                "timeframe": "Weeks 1-2",
                "objective": f"Eliminate ATS red flags and optimize profile keywords for {target_job} recruiters",
                "tasks": [
                    { "id": "t1_1", "text": f"Rewrite work experience bullets tailored to {target_job} using the XYZ formula: Accomplished [X] measured by [Y] by doing [Z].", "category": "Resume" },
                    { "id": "t1_2", "text": "Add live deployment URLs and GitHub repository links directly to projects on your resume.", "category": "Resume" },
                    { "id": "t1_3", "text": f"Audit GitHub profile: Pin repositories demonstrating {primary_missing} and write detailed READMEs.", "category": "Code" },
                    { "id": "t1_4", "text": "Solve 8 core Two-Pointer & Sliding Window problems on LeetCode to establish daily practice consistency.", "category": "DSA" }
                ]
            },
            {
                "stage_number": 2,
                "title": f"Skill Gap Sprint: {primary_missing} Proof-of-Work",
                "timeframe": "Weeks 3-4",
                "objective": f"Turn {primary_missing} into verified production code aligned with {target_job} requirements",
                "tasks": [
                    { "id": "t2_1", "text": f"Build the core service modules for the {target_job} portfolio project incorporating {primary_missing}.", "category": "Code" },
                    { "id": "t2_2", "text": "Containerize the application with Docker and write a multi-stage Dockerfile for production optimization.", "category": "Code" },
                    { "id": "t2_3", "text": "Configure automated testing and CI/CD pipelines via GitHub Actions to run on every commit.", "category": "Code" },
                    { "id": "t2_4", "text": "Complete 10 Medium BFS/DFS graph problems on LeetCode.", "category": "DSA" }
                ]
            },
            {
                "stage_number": 3,
                "title": f"System Architecture & Deployment for {target_job}",
                "timeframe": "Weeks 5-6",
                "objective": "Deploy project live and integrate benchmark telemetry",
                "tasks": [
                    { "id": "t3_1", "text": "Deploy project live to AWS / Render / Vercel with a custom domain or active endpoint.", "category": "Code" },
                    { "id": "t3_2", "text": "Record a 60-second video demo walkthrough and embed it at the top of your GitHub README.", "category": "Code" },
                    { "id": "t3_3", "text": "Solve 8 Tree & Dynamic Programming Medium problems on LeetCode.", "category": "DSA" },
                    { "id": "t3_4", "text": "Conduct a mock system design interview covering caching, indexing, and horizontal scaling.", "category": "Application" }
                ]
            },
            {
                "stage_number": 4,
                "title": f"Targeted Hiring Pipeline & Interview Execution",
                "timeframe": "Weeks 7-8",
                "objective": f"Target high-probability {target_job} postings with tailored portfolio submissions",
                "tasks": [
                    { "id": "t4_1", "text": f"Submit customized applications to 15 companies hiring for {target_job} featuring your verified project link.", "category": "Application" },
                    { "id": "t4_2", "text": f"Reach out directly to engineering managers on LinkedIn with an elevator pitch tailored to {target_job}.", "category": "Application" },
                    { "id": "t4_3", "text": "Participate in 2 weekly LeetCode virtual contests to practice time-pressured problem solving.", "category": "DSA" },
                    { "id": "t4_4", "text": "Prepare behavioral stories around technical trade-offs, bug triage, and team collaboration.", "category": "Application" }
                ]
            }
        ]
    }
