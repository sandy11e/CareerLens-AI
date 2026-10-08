import re
from typing import Dict, Any, List

KEY_SECTIONS = ["education", "experience", "skills", "projects", "certifications", "summary"]
ATS_KEYWORDS = {
    "technical_acronyms": ["API", "REST", "SQL", "CI/CD", "JSON", "AWS", "GCP", "AZURE", "ML", "AI", "NLP", "HTTP", "CSS", "HTML", "SDK", "OAuth"],
    "action_verbs": ["developed", "designed", "implemented", "managed", "led", "created", "built", "architected", "optimized", "deployed", "spearheaded", "engineered", "refactored", "orchestrated", "automated"],
    "metrics_indicators": [r"\d+%", r"\$\d+", r"\d+\s*(users|clients|requests|qps|ms|seconds|minutes|hours|days|x|fold)"]
}

TRENDING_SKILLS = [
    "python", "javascript", "typescript", "react", "next.js", "node.js",
    "docker", "kubernetes", "aws", "fastapi", "golang", "rust",
    "sql", "postgresql", "mongodb", "redis", "ci/cd", "graphql", "machine learning", "ai", "llm"
]

def calculate_ats_breakdown(resume_text: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    text_lower = resume_text.lower()
    
    # 1. ATS Compatibility (0 - 100)
    ats_score = 45
    # Section presence
    sections_found = sum(1 for sec in KEY_SECTIONS if re.search(rf"\b{sec}\b", text_lower))
    ats_score += min(sections_found * 6, 30)
    
    # Technical acronyms
    tech_count = sum(1 for kw in ATS_KEYWORDS["technical_acronyms"] if kw.lower() in text_lower)
    ats_score += min(tech_count * 2, 15)
    
    # Contact info presence
    cand_info = parsed_data.get("candidate_info", {})
    if cand_info.get("email"):
        ats_score += 5
    if cand_info.get("phone"):
        ats_score += 5
    
    ats_score = min(max(ats_score, 10), 100)

    # 2. Content Quality (Action verbs, structure)
    quality_score = 40
    verb_count = sum(1 for v in ATS_KEYWORDS["action_verbs"] if re.search(rf"\b{v}\b", text_lower))
    quality_score += min(verb_count * 3, 30)
    
    # Metric indicators (percentages, numbers, scale)
    metric_count = 0
    for pat in ATS_KEYWORDS["metrics_indicators"]:
        metric_count += len(re.findall(pat, text_lower))
    quality_score += min(metric_count * 5, 20)
    if "•" in resume_text or "-" in resume_text:
        quality_score += 10
    quality_score = min(max(quality_score, 10), 100)

    # 3. Market Relevance
    relevance_score = 40
    skills_list = [s.lower() for s in parsed_data.get("all_skills", [])]
    trending_matches = sum(1 for t in TRENDING_SKILLS if any(t in s for s in skills_list))
    relevance_score += min(trending_matches * 5, 45)
    if any(yr in text_lower for yr in ["2024", "2025", "2026", "present"]):
        relevance_score += 15
    relevance_score = min(max(relevance_score, 10), 100)

    # 4. Experience Depth
    exp_score = 50
    experiences = parsed_data.get("experience", [])
    if isinstance(experiences, list) and len(experiences) > 0:
        exp_score += min(len(experiences) * 12, 35)
        # Check if bullets have detail
        has_deep_bullets = any(len(exp.get("highlights", [])) >= 2 for exp in experiences if isinstance(exp, dict))
        if has_deep_bullets:
            exp_score += 15
    exp_score = min(max(exp_score, 10), 100)

    # 5. Education Credibility
    edu_score = 50
    education = parsed_data.get("education", [])
    if isinstance(education, list) and len(education) > 0:
        edu_score += 25
        text_edu = str(education).lower()
        if any(deg in text_edu for deg in ["bachelor", "master", "phd", "b.tech", "b.s.", "m.s."]):
            edu_score += 15
        if any(stem in text_edu for stem in ["computer science", "engineering", "information technology", "data"]):
            edu_score += 10
    edu_score = min(max(edu_score, 10), 100)

    # 6. Formatting & Layout
    format_score = 60
    word_count = len(resume_text.split())
    if 250 <= word_count <= 1000:
        format_score += 25
    elif word_count < 200:
        format_score -= 20
    
    if cand_info.get("linkedin") or cand_info.get("github"):
        format_score += 15
    format_score = min(max(format_score, 10), 100)

    # Weighted Overall Score
    overall_score = round(
        0.25 * ats_score +
        0.20 * quality_score +
        0.20 * relevance_score +
        0.15 * exp_score +
        0.10 * edu_score +
        0.10 * format_score,
        1
    )

    # Generate targeted recommendations based on weaknesses
    recs: List[Dict[str, str]] = []
    if ats_score < 75:
        recs.append({
            "category": "ATS Optimization",
            "priority": "High",
            "tip": "Incorporate standard ATS headings (Summary, Experience, Education, Technical Skills) to ensure automated scanners parse your sections effortlessly."
        })
    if quality_score < 75:
        recs.append({
            "category": "Impact Metrics",
            "priority": "High",
            "tip": "Quantify your achievements using the XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'. Example: 'Reduced query latency by 42% by indexing MongoDB collections'."
        })
    if relevance_score < 75:
        recs.append({
            "category": "Skill Relevance",
            "priority": "Medium",
            "tip": "Add contemporary production tooling (e.g. Docker, CI/CD, TypeScript, Cloud Providers) aligned with modern job postings."
        })
    if not cand_info.get("github"):
        recs.append({
            "category": "Proof of Work",
            "priority": "Medium",
            "tip": "Include a direct link to your active GitHub profile with pinned repositories showcasing clean READMEs and test coverage."
        })

    return {
        "overall_score": overall_score,
        "scores": {
            "ats_compatibility": ats_score,
            "content_quality": quality_score,
            "market_relevance": relevance_score,
            "experience_depth": exp_score,
            "education_rating": edu_score,
            "formatting_structure": format_score
        },
        "recommendations": recs
    }
