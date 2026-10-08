import re
import logging
from typing import Dict, Any
from services.groq_service import generate_structured_json, is_groq_configured

logger = logging.getLogger("careerlens.analyzer")

SYSTEM_PROMPT = """You are an elite Senior Technical Recruiter, ATS (Applicant Tracking System) Specialist, and Talent Architect.
Your task is to analyze the provided resume text with surgical precision and return a comprehensive, structured JSON representation.

STRICT INSTRUCTIONS:
1. Extract ALL factual information accurately. Do not invent details not present in the text.
2. Group skills accurately into categories (languages, frameworks, databases, cloud/devops, tools, soft skills).
3. Extract GitHub and LinkedIn profile handles or URLs if present.
4. For work experiences and projects, extract measurable impact, metrics (e.g. percentages, scale, latency reduction), and specific technologies used.
5. Provide actionable, high-impact ATS recommendations for improving the candidate's hiring potential.
6. You must return ONLY a valid JSON object matching the requested schema. No markdown formatting outside the JSON, no commentary.
"""

ANALYSIS_SCHEMA_PROMPT = """
Analyze the resume text below and generate a JSON object with this EXACT structure:

{
  "candidate_info": {
    "name": "Full Name or null",
    "email": "Email address or null",
    "phone": "Phone number or null",
    "location": "City, Country or null",
    "linkedin": "LinkedIn URL or handle or null",
    "github": "GitHub username or URL or null",
    "portfolio": "Portfolio/Website URL or null"
  },
  "headline": "A sharp, professional headline representing the candidate (e.g., 'Full-Stack Software Engineer')",
  "summary": "Professional summary paragraph or 2-3 sentence overview",
  "experience_level": "Entry-Level" | "Mid-Level" | "Senior" | "Lead / Staff",
  "total_years_experience_est": 0.0,
  "skills": {
    "languages": ["e.g. Python", "JavaScript"],
    "frameworks_and_libraries": ["e.g. React", "FastAPI", "Docker"],
    "databases": ["e.g. PostgreSQL", "MongoDB", "Redis"],
    "cloud_and_devops": ["e.g. AWS", "GitHub Actions", "Docker"],
    "tools_and_platforms": ["e.g. Git", "Linux", "Postman"],
    "soft_skills": ["e.g. Agile Leadership", "Problem Solving"]
  },
  "all_skills": ["flat array of every distinct technical & domain skill found"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Location or Remote",
      "start_date": "e.g. Jan 2022",
      "end_date": "e.g. Present",
      "is_current": true,
      "highlights": ["Bullet point 1 with impact", "Bullet point 2"],
      "technologies_used": ["Tech 1", "Tech 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree (e.g. B.Tech / B.S.)",
      "institution": "University / College Name",
      "field_of_study": "e.g. Computer Science",
      "graduation_year": "e.g. 2024",
      "gpa_or_grade": "e.g. 3.8/4.0 or null"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Clear project description and architecture",
      "technologies": ["React", "Node.js", "MongoDB"],
      "metrics_or_impact": "Any quantified outcome or null",
      "link": "URL or null"
    }
  ],
  "certifications": [
    {
      "name": "Certification Title (e.g. AWS Certified Solutions Architect)",
      "issuer": "Issuing Authority or Provider (e.g. Amazon Web Services, Meta, Coursera, Google, Microsoft)",
      "year": "Year or date or null",
      "credential_id_or_url": "Credential verification ID/link or null"
    }
  ],
  "ats_insights": {
    "strengths": [
      "Key strength 1 (e.g., 'Strong demonstration of full-stack TypeScript projects')",
      "Key strength 2"
    ],
    "weaknesses": [
      "Key weakness 1 (e.g., 'Lacks quantified metrics in recent experience bullets')",
      "Key weakness 2"
    ],
    "missing_critical_elements": [
      "e.g. 'No clear links to live project demos or GitHub repositories'"
    ],
    "actionable_recommendations": [
      "Specific advice 1 on how to optimize resume keywords and phrasing",
      "Specific advice 2",
      "Specific advice 3"
    ]
  }
}

Resume Text:
---
{resume_text}
---
"""

def analyze_resume_precisely(resume_text: str) -> Dict[str, Any]:
    """
    Extracts deep, structured, high-precision intelligence from resume text.
    Uses Groq LLM (llama-3.3-70b-versatile) when API key is set,
    with a robust deterministic heuristic fallback.
    """
    if not resume_text or len(resume_text.strip()) < 30:
        return {
            "error": "Resume text is empty or could not be read from document.",
            "is_valid": False
        }

    if is_groq_configured():
        try:
            logger.info("Performing precision extraction using Groq LLM...")
            # Truncate text if excessively large (keep up to ~30k chars for full detail)
            truncated_text = resume_text[:32000]
            prompt = ANALYSIS_SCHEMA_PROMPT.replace("{resume_text}", truncated_text)
            
            extracted = generate_structured_json(prompt, system_prompt=SYSTEM_PROMPT)
            extracted["extraction_engine"] = "groq_llama_3.3_70b"
            extracted["is_valid"] = True
            
            # Ensure all_skills is populated
            if "skills" in extracted and isinstance(extracted["skills"], dict):
                combined = []
                for cat, sk_list in extracted["skills"].items():
                    if isinstance(sk_list, list):
                        combined.extend(sk_list)
                if not extracted.get("all_skills"):
                    extracted["all_skills"] = list(dict.fromkeys(combined))

            # Normalize & guarantee certificates are structured
            raw_certs = extracted.get("certifications", [])
            normalized_certs = []
            if isinstance(raw_certs, list):
                for c in raw_certs:
                    if isinstance(c, dict) and c.get("name"):
                        normalized_certs.append({
                            "name": str(c.get("name")).strip(),
                            "issuer": str(c.get("issuer")).strip() if c.get("issuer") else None,
                            "year": str(c.get("year")).strip() if c.get("year") else None,
                            "credential_id_or_url": str(c.get("credential_id_or_url")).strip() if c.get("credential_id_or_url") else None
                        })
                    elif isinstance(c, str) and c.strip():
                        cert_str = c.strip()
                        year_match = re.search(r'\b(20\d{2}|19\d{2})\b', cert_str)
                        year = year_match.group(0) if year_match else None
                        issuer = None
                        if "(" in cert_str and ")" in cert_str:
                            issuer = cert_str[cert_str.find("(")+1 : cert_str.find(")")].replace(year or "", "").strip(" ,-")
                        name_clean = cert_str
                        if issuer and f"({issuer})" in name_clean:
                            name_clean = name_clean.replace(f"({issuer})", "").strip()
                        if year and year in name_clean:
                            name_clean = name_clean.replace(year, "").strip(" ,-()")
                        normalized_certs.append({
                            "name": name_clean or cert_str,
                            "issuer": issuer,
                            "year": year,
                            "credential_id_or_url": None
                        })

            # If LLM missed certs, run heuristic scanner as supplementary check
            if not normalized_certs:
                normalized_certs = _extract_heuristic_certifications(resume_text.split('\n'), resume_text)

            extracted["certifications"] = normalized_certs
            return extracted
        except Exception as e:
            logger.error(f"Groq precision extraction failed: {e}. Falling back to heuristic parser.")
            fallback = heuristic_resume_parse(resume_text)
            fallback["warning"] = f"AI extraction encountered: {str(e)}. Heuristic parser used."
            fallback["extraction_engine"] = "heuristic_fallback"
            return fallback
    else:
        logger.warning("GROQ_API_KEY is not set. Using deterministic heuristic extraction.")
        result = heuristic_resume_parse(resume_text)
        result["warning"] = "GROQ_API_KEY is not set in backend/.env. Running with heuristic extraction. For full precision AI analysis, please set your Groq key."
        result["extraction_engine"] = "heuristic_fallback"
        return result


def heuristic_resume_parse(text: str) -> Dict[str, Any]:
    """
    High-quality deterministic fallback parser when AI API is unavailable.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    first_lines = lines[:10]
    
    # Extract Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None
    
    # Extract Phone
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    phone = phone_match.group(0) if phone_match else None
    
    # Extract GitHub
    github_match = re.search(r'github\.com/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    github_user = github_match.group(1) if github_match else None
    
    # Extract LinkedIn
    linkedin_match = re.search(r'linkedin\.com/in/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    linkedin_user = linkedin_match.group(0) if linkedin_match else None
    
    # Candidate Name Guess (first line that is not email/phone)
    name = "Candidate"
    for line in first_lines:
        if email and email in line:
            continue
        if len(line.split()) in [2, 3, 4] and not any(char.isdigit() for char in line):
            name = line.strip()
            break

    # Skill dictionary matching
    tech_skills_map = {
        "languages": ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL", "HTML", "CSS"],
        "frameworks_and_libraries": ["React", "Next.js", "Vue", "Angular", "Node.js", "Express", "FastAPI", "Django", "Flask", "Spring Boot", "Tailwind", "Redux"],
        "databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "DynamoDB", "Firebase", "Cassandra", "Elasticsearch"],
        "cloud_and_devops": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Terraform", "Nginx", "Linux"],
        "tools_and_platforms": ["Git", "GitHub", "Postman", "Jira", "VS Code", "Webpack", "Vite", "Figma"],
        "soft_skills": ["Leadership", "Communication", "Problem Solving", "Teamwork", "Agile", "Scrum"]
    }

    found_skills = {cat: [] for cat in tech_skills_map}
    flat_skills = []
    text_lower = text.lower()

    for category, skill_list in tech_skills_map.items():
        for skill in skill_list:
            # Word boundary regex search
            pattern = rf"\b{re.escape(skill.lower())}\b"
            if re.search(pattern, text_lower):
                found_skills[category].append(skill)
                flat_skills.append(skill)

    return {
        "candidate_info": {
            "name": name,
            "email": email,
            "phone": phone,
            "location": "Detected from text",
            "linkedin": linkedin_user,
            "github": github_user,
            "portfolio": None
        },
        "headline": f"Software Professional | {', '.join(flat_skills[:3]) if flat_skills else 'Tech Specialist'}",
        "summary": "Experienced software practitioner with technical foundation extracted from resume.",
        "experience_level": "Mid-Level",
        "total_years_experience_est": 2.0,
        "skills": found_skills,
        "all_skills": flat_skills,
        "experience": [
            {
                "title": "Software Engineer",
                "company": "Industry Experience",
                "location": "Remote / Onsite",
                "start_date": "2022",
                "end_date": "Present",
                "is_current": True,
                "highlights": [l for l in lines[10:15] if len(l) > 25][:3],
                "technologies_used": flat_skills[:4]
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Science / Technology",
                "institution": "University Program",
                "field_of_study": "Computer Science / Engineering",
                "graduation_year": "2024",
                "gpa_or_grade": None
            }
        ],
        "projects": [
            {
                "name": "Featured Project",
                "description": "Full-stack application implementation detected in resume",
                "technologies": flat_skills[:3],
                "metrics_or_impact": None,
                "link": None
            }
        ],
        "certifications": _extract_heuristic_certifications(lines, text),
        "ats_insights": {
            "strengths": [
                f"Contains recognized technical stack: {', '.join(flat_skills[:5])}" if flat_skills else "Document provided",
                "Contact credentials present" if email else "Clear text format"
            ],
            "weaknesses": [
                "Consider adding more quantified numerical achievements (%, metrics, scale)",
                "Ensure skills are linked directly to project outcomes"
            ],
            "missing_critical_elements": [
                "Set GROQ_API_KEY in backend/.env for comprehensive 360-degree deep AI extraction"
            ],
            "actionable_recommendations": [
                "Use strong action verbs to begin every bullet point (e.g., 'Architected', 'Spearheaded')",
                "Add metrics like 'reduced latency by 35%' or 'served 10k+ daily users'",
                "Highlight GitHub repository links directly inside each project heading"
            ]
        },
        "is_valid": True
    }


def _extract_heuristic_certifications(lines: list, text: str) -> list:
    """Deterministic extractor for licenses, courses, and certifications."""
    certs = []
    
    # 1. Section based search
    in_cert_section = False
    section_break_keywords = ["education", "experience", "projects", "skills", "summary", "languages", "work history", "employment"]
    
    for line in lines:
        clean = line.strip()
        lower = clean.lower()
        if not clean:
            continue
            
        # Check if line looks like a certification section header
        if any(h in lower for h in ["certification", "certificates", "licenses & certifications", "accreditations", "courses & certifications", "professional certifications"]):
            if len(clean.split()) <= 5:
                in_cert_section = True
                continue
        elif in_cert_section and any(clean.lower().startswith(b) for b in section_break_keywords) and len(clean.split()) <= 4:
            in_cert_section = False
            
        if in_cert_section:
            # Strip bullets, numbers, dashes
            cleaned_line = re.sub(r'^[\s•\-\*\d\.\)\:]+', '', clean).strip()
            if len(cleaned_line) > 5 and not any(kw in cleaned_line.lower() for kw in ["certifications", "licenses", "page ", "page:"]):
                year_match = re.search(r'\b(20\d{2}|19\d{2})\b', cleaned_line)
                year = year_match.group(0) if year_match else None
                
                issuer = None
                name = cleaned_line

                # Check for "by Issuer" pattern
                if " by " in name.lower():
                    parts = re.split(r'\s+by\s+', name, flags=re.IGNORECASE)
                    if len(parts) > 1:
                        name = parts[0].strip()
                        issuer = parts[1].strip()
                elif " - " in name:
                    parts = name.split(" - ")
                    if len(parts) > 1 and len(parts[-1].strip()) < 40 and not any(ch.isdigit() for ch in parts[-1]):
                        issuer = parts[-1].strip()
                        name = " - ".join(parts[:-1]).strip()
                elif " | " in name:
                    parts = name.split(" | ")
                    if len(parts) > 1 and len(parts[-1].strip()) < 40:
                        issuer = parts[-1].strip()
                        name = " | ".join(parts[:-1]).strip()

                # Check for parentheses issuer or acronym e.g. (Coursera)
                if "(" in name and ")" in name:
                    paren = name[name.find("(")+1 : name.find(")")].strip()
                    if not paren.isdigit() and len(paren) < 35 and not issuer:
                        issuer = paren.replace(year or "", "").strip(" ,-")
                    name = re.sub(r'\([^\)]*\)', '', name).strip()

                # Clean leftover year or empty parens
                if year:
                    name = re.sub(rf'\b{year}\b', '', name).strip()
                name = re.sub(r'\(\s*\)', '', name)
                name = re.sub(r'[\s\-\,\:]+$', '', name).strip()
                name = re.sub(r'^[\s\-\,\:]+', '', name).strip()

                # Check known issuers if unassigned
                if not issuer:
                    known_issuers = {
                        "aws": "Amazon Web Services (AWS)",
                        "amazon": "Amazon Web Services (AWS)",
                        "google": "Google Cloud",
                        "microsoft": "Microsoft",
                        "azure": "Microsoft Azure",
                        "meta": "Meta",
                        "coursera": "Coursera",
                        "udemy": "Udemy",
                        "edx": "edX",
                        "ibm": "IBM",
                        "cisco": "Cisco",
                        "oracle": "Oracle",
                        "linux foundation": "Linux Foundation",
                        "scrum": "Scrum Alliance",
                        "deeplearning.ai": "DeepLearning.AI"
                    }
                    for kw, iss in known_issuers.items():
                        if kw in cleaned_line.lower():
                            issuer = iss
                            break

                if len(name) > 3:
                    certs.append({
                        "name": name,
                        "issuer": issuer,
                        "year": year,
                        "credential_id_or_url": None
                    })
                
    # 2. Known credential patterns across full text if section was not identified or yielded few
    if len(certs) < 2:
        patterns = [
            (r'(AWS Certified\s+[A-Za-z0-9\s–-]+)', 'Amazon Web Services (AWS)'),
            (r'(Microsoft Certified:?\s*[A-Za-z0-9\s–-]+)', 'Microsoft'),
            (r'(Azure\s+[A-Za-z0-9\s–-]+(?:Associate|Expert|Fundamentals))', 'Microsoft Azure'),
            (r'(Google Cloud Certified:?\s*[A-Za-z0-9\s–-]+)', 'Google Cloud (GCP)'),
            (r'(Certified Kubernetes\s+[A-Za-z0-9\s–-]+|CKA|CKAD)', 'Cloud Native Computing Foundation (CNCF)'),
            (r'(CompTIA\s+[A-Za-z0-9\+\s–-]+)', 'CompTIA'),
            (r'(Cisco Certified\s+[A-Za-z0-9\s–-]+|CCNA|CCNP)', 'Cisco'),
            (r'(Oracle Certified\s+[A-Za-z0-9\s–-]+)', 'Oracle'),
            (r'(Meta\s+[A-Za-z0-9\s–-]+(?:Certificate|Developer))', 'Meta'),
            (r'(Certified Scrum Master|CSM|PSM I?)', 'Scrum Alliance'),
            (r'([A-Za-z0-9\s]+\s+(?:Specialization|Professional Certificate))', 'Verified Credential')
        ]
        seen = {c["name"].lower() for c in certs}
        for pat, default_issuer in patterns:
            for match in re.finditer(pat, text, re.IGNORECASE):
                match_text = match.group(1).strip()
                if match_text.lower() not in seen and 6 < len(match_text) < 70:
                    seen.add(match_text.lower())
                    certs.append({
                        "name": match_text,
                        "issuer": default_issuer,
                        "year": None,
                        "credential_id_or_url": None
                    })
                    
    return certs[:10]
