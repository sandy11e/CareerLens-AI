import logging
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from services.groq_service import generate_structured_json, is_groq_configured

logger = logging.getLogger("careerlens.jd_matcher")

JD_MATCH_PROMPT = """You are a Principal Talent Acquisition Architect and ATS Scoring Director.
Match the candidate's verified profile against the provided Job Description (JD).

JOB DESCRIPTION:
\"\"\"{jd_text}\"\"\"

CANDIDATE'S VERIFIED PROFILE:
- Name: {candidate_name}
- Headline: {headline}
- Extracted Skills: {candidate_skills}
- Summary & Bio: {candidate_summary}
- Work Experience Summary: {experience_summary}

STRICT INSTRUCTIONS:
1. Extract the actual Job Title and Company (if mentioned) from the JD.
2. Determine which technical skills and competencies from the JD match the candidate's skills.
3. Determine which essential skills required by the JD are MISSING from the candidate's profile (skill gaps).
4. Calculate realistic compatibility scores (0-100%):
   - fit_score (overall match)
   - skill_fit_score (% of required technical skills candidate has)
   - semantic_fit_score (content & experience relevance)
5. Provide 2-3 key strengths why the candidate stands out for this role.
6. Provide 3 concrete, high-impact ATS Resume Optimization Tips for this exact JD (e.g. specific keywords or metrics to add).
7. Provide 3 realistic Technical Interview Questions that an interviewer would ask for this specific role.
8. Provide a 1-2 sentence executive verdict.

Return ONLY a valid JSON object matching the schema below:
{{
  "job_title": "Extracted Job Title",
  "company_name": "Company Name or null",
  "seniority": "Junior" | "Mid-Level" | "Senior" | "Lead" | "Staff",
  "fit_score": 82,
  "skill_fit_score": 85,
  "semantic_fit_score": 78,
  "matched_skills": ["Skill1", "Skill2"],
  "missing_skills": ["MissingSkill1", "MissingSkill2"],
  "key_strengths": ["Strength 1", "Strength 2"],
  "ats_resume_optimizations": [
    "Tip 1: Include keyword X with quantified metric",
    "Tip 2: Highlight experience with Y"
  ],
  "interview_questions": [
    "Question 1 based on JD requirements",
    "Question 2",
    "Question 3"
  ],
  "verdict": "Clear summary assessment of candidate eligibility."
}}
"""

def _sanitize_jd_result(res: Dict[str, Any], default_title: str = "Target Role") -> Dict[str, Any]:
    """Ensures consistent types and structure for the custom JD match result."""
    def _parse_score(val, default=70):
        try:
            if isinstance(val, (int, float)):
                return min(max(int(round(val)), 5), 100)
            if isinstance(val, str):
                cleaned = "".join(c for c in val if c.isdigit() or c == ".")
                if cleaned:
                    return min(max(int(round(float(cleaned))), 5), 100)
        except Exception:
            pass
        return default

    fit_score = _parse_score(res.get("fit_score"), 72)
    skill_fit_score = _parse_score(res.get("skill_fit_score"), 75)
    semantic_fit_score = _parse_score(res.get("semantic_fit_score"), 70)

    matched_skills = [str(s).strip() for s in res.get("matched_skills", []) if str(s).strip()]
    missing_skills = [str(s).strip() for s in res.get("missing_skills", []) if str(s).strip()]
    key_strengths = [str(s).strip() for s in res.get("key_strengths", []) if str(s).strip()]
    ats_tips = [str(s).strip() for s in res.get("ats_resume_optimizations", []) if str(s).strip()]
    questions = [str(s).strip() for s in res.get("interview_questions", []) if str(s).strip()]

    job_title = str(res.get("job_title") or "").strip()
    if not job_title or job_title.lower() in ["extracted job title", "null", "none"]:
        job_title = default_title

    company_name = res.get("company_name")
    if company_name and str(company_name).lower() in ["null", "none", "unknown", "n/a"]:
        company_name = None

    seniority = str(res.get("seniority") or "Mid-Level").strip()
    verdict = str(res.get("verdict") or f"Candidate profile presents a strong {fit_score}% alignment for this position.").strip()

    return {
        "job_title": job_title,
        "company_name": company_name,
        "seniority": seniority,
        "fit_score": fit_score,
        "skill_fit_score": skill_fit_score,
        "semantic_fit_score": semantic_fit_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "key_strengths": key_strengths,
        "ats_resume_optimizations": ats_tips,
        "interview_questions": questions,
        "verdict": verdict
    }

def match_candidate_to_custom_jd(candidate_context: Dict[str, Any], jd_text: str) -> Dict[str, Any]:
    """
    Evaluates candidate's resume and verified signals against a custom Job Description (text or PDF).
    """
    cand_info = candidate_context.get("candidate_info", {})
    candidate_name = cand_info.get("name", "Candidate")
    headline = candidate_context.get("headline", "Software Engineer")
    candidate_skills = candidate_context.get("all_skills", [])
    candidate_summary = candidate_context.get("summary", "")
    
    exp_list = candidate_context.get("experience", [])
    exp_summary = "; ".join([
        f"{e.get('title')} at {e.get('company')} ({', '.join(e.get('technologies_used', []))})"
        for e in exp_list[:4]
    ]) if exp_list else "Software development experience"

    truncated_jd = jd_text[:4500].strip()

    # Step 1: Attempt LLM-driven deep matching via Groq
    if is_groq_configured():
        try:
            prompt = (
                JD_MATCH_PROMPT
                .replace("{jd_text}", truncated_jd)
                .replace("{candidate_name}", candidate_name)
                .replace("{headline}", headline)
                .replace("{candidate_skills}", ", ".join(candidate_skills[:30]))
                .replace("{candidate_summary}", candidate_summary[:500])
                .replace("{experience_summary}", exp_summary[:500])
            )
            llm_result = generate_structured_json(prompt)
            if llm_result and "fit_score" in llm_result:
                return _sanitize_jd_result(llm_result, default_title=headline)
        except Exception as e:
            logger.warning(f"Groq custom JD match failed, falling back to deterministic: {e}")

    # Step 2: Deterministic TF-IDF & Keyword Fallback
    deterministic_res = _deterministic_jd_match(candidate_skills, candidate_summary, truncated_jd)
    return _sanitize_jd_result(deterministic_res, default_title=headline)


def _deterministic_jd_match(candidate_skills: List[str], candidate_summary: str, jd_text: str) -> Dict[str, Any]:
    """Deterministic fallback using TF-IDF and keyword intersection."""
    norm_cand_skills = {s.lower().strip() for s in candidate_skills if s}
    jd_lower = jd_text.lower()

    # Common tech keywords to look for in JD
    common_keywords = [
        "python", "javascript", "typescript", "react", "node.js", "next.js", "angular", "vue",
        "java", "c++", "c#", "golang", "rust", "sql", "postgresql", "mysql", "mongodb", "redis",
        "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "terraform", "graphql", "rest api",
        "microservices", "system design", "git", "linux", "html", "css", "tailwind", "fastapi",
        "django", "flask", "spring boot", "kafka", "spark", "hadoop", "machine learning", "deep learning",
        "nlp", "pytorch", "tensorflow", "devops", "agile", "scrum", "unit testing"
    ]

    jd_required_skills = []
    for kw in common_keywords:
        if kw in jd_lower:
            jd_required_skills.append(kw.title())

    # Include candidate skills explicitly cited in the JD
    for cs in candidate_skills:
        if cs and cs.lower() in jd_lower and cs.title() not in jd_required_skills:
            jd_required_skills.append(cs.title())

    matched = []
    missing = []
    for skill in jd_required_skills:
        if skill.lower() in norm_cand_skills or any(skill.lower() in cs for cs in norm_cand_skills):
            matched.append(skill)
        else:
            missing.append(skill)

    # TF-IDF Cosine Similarity
    semantic_score = 65.0
    try:
        cand_doc = f"{' '.join(candidate_skills)} {candidate_summary}".lower()
        docs = [cand_doc, jd_lower]
        vect = TfidfVectorizer(stop_words='english', max_features=300)
        mat = vect.fit_transform(docs)
        sim = cosine_similarity(mat[0:1], mat[1:2])[0][0]
        semantic_score = round(float(sim * 100), 1)
    except Exception as e:
        logger.warning(f"Deterministic TF-IDF error: {e}")

    skill_score = round((len(matched) / len(jd_required_skills) * 100), 1) if jd_required_skills else 70.0
    fit_score = round(0.6 * skill_score + 0.4 * semantic_score, 1)

    # Extract first line or headline as job title
    job_title = "Target Role"
    first_lines = [l.strip() for l in jd_text.split('\n') if l.strip()]
    for line in first_lines[:5]:
        lower_line = line.lower()
        if any(prefix in lower_line for prefix in ["job title:", "title:", "role:", "position:"]):
            parts = line.split(":", 1)
            if len(parts) > 1 and parts[1].strip():
                job_title = parts[1].strip()[:60]
                break
        elif 3 < len(line) < 50 and not any(kw in lower_line for kw in ["about", "responsibilities", "requirements", "company", "description"]):
            job_title = line[:50]
            break

    return {
        "job_title": job_title,
        "company_name": None,
        "seniority": "Mid-Level",
        "fit_score": min(max(round(fit_score), 10), 100),
        "skill_fit_score": min(max(round(skill_score), 10), 100),
        "semantic_fit_score": min(max(round(semantic_score), 10), 100),
        "matched_skills": matched,
        "missing_skills": missing,
        "key_strengths": [
            f"Demonstrated proficiency in {', '.join(matched[:3]) if matched else 'core software engineering'}."
        ] + ([f"Hands-on background matching responsibilities outlined in the job description."] if len(matched) >= 2 else []),
        "ats_resume_optimizations": [
            f"Add explicit mentions of missing required skills: {', '.join(missing[:3]) if missing else 'industry standard tools'}." if missing else "Ensure all technical skills are listed in standard ATS-friendly syntax.",
            "Include quantifiable impact metrics (e.g. % performance increase, latency reduction) in your experience bullets.",
            "Mirror key phrases and competencies from this job description in your resume summary."
        ],
        "interview_questions": [
            f"How have you applied {matched[0] if matched else 'your primary stack'} to solve challenging production issues?",
            f"What is your approach to learning and adopting {missing[0] if missing else 'new technologies'} in a fast-paced environment?",
            "Explain an architectural trade-off you made in your recent projects."
        ],
        "verdict": f"Candidate demonstrates a {round(fit_score)}% alignment with this position. Addressing missing skill gaps will make you a prime candidate."
    }
