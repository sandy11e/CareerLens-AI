import logging
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from services.job_database import jobs

logger = logging.getLogger("careerlens.matcher")

def match_candidate_to_jobs(candidate_skills: List[str], candidate_summary: str = "") -> List[Dict[str, Any]]:
    """
    Computes hybrid match score:
    - 60% skill overlap
    - 40% TF-IDF semantic description similarity
    """
    normalized_cand_skills = [s.strip().lower() for s in candidate_skills if s]
    
    # Prepare text for TF-IDF
    cand_doc = f"{' '.join(candidate_skills)} {candidate_summary}".lower()
    job_docs = [f"{j['title']} {' '.join(j['skills_required'])} {j['description']}".lower() for j in jobs]
    
    # Calculate TF-IDF cosine similarities
    tfidf_scores = [0.0] * len(jobs)
    try:
        all_docs = [cand_doc] + job_docs
        vectorizer = TfidfVectorizer(stop_words='english', max_features=500)
        tfidf_matrix = vectorizer.fit_transform(all_docs)
        cand_vector = tfidf_matrix[0:1]
        job_vectors = tfidf_matrix[1:]
        sims = cosine_similarity(cand_vector, job_vectors)[0]
        tfidf_scores = [round(float(s * 100), 1) for s in sims]
    except Exception as e:
        logger.warning(f"TF-IDF similarity calculation error: {e}")

    results = []

    for idx, job in enumerate(jobs):
        required = job.get("skills_required", [])
        matched = []
        missing = []

        for req in required:
            req_lower = req.lower()
            if any(req_lower == cs or req_lower in cs or cs in req_lower for cs in normalized_cand_skills):
                matched.append(req)
            else:
                missing.append(req)

        # Skill fit percentage
        skill_fit = round((len(matched) / len(required) * 100), 1) if required else 0
        semantic_fit = tfidf_scores[idx] if idx < len(tfidf_scores) else skill_fit

        # Weighted composite fit
        composite_score = round(0.65 * skill_fit + 0.35 * semantic_fit, 1)

        # Actionable advice
        action_tip = (
            f"Focus on acquiring {', '.join(missing[:2])} to significantly boost eligibility."
            if missing else "Strong skill alignment! Highlight your production deployments and metrics."
        )

        results.append({
            "id": job.get("id", f"job-{idx}"),
            "title": job["title"],
            "category": job.get("category", "Engineering"),
            "salary_range": job.get("salary_range", "Competitive"),
            "experience_level": job.get("experience_level", "Mid-Level"),
            "description": job["description"].strip(),
            "fit_score": min(max(composite_score, 0), 100),
            "skill_fit_score": skill_fit,
            "semantic_score": semantic_fit,
            "matched_skills": matched,
            "missing_skills": missing,
            "action_tip": action_tip
        })

    results.sort(key=lambda x: x["fit_score"], reverse=True)
    return results
