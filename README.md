# 🌟 Devlyzer AI — 360° Career Intelligence & ATS Proof-of-Work Platform

**Devlyzer AI** unifies **Resume Intelligence** with **Live Developer Signal Verification** into a single, high-performance career assessment and job-matching platform.

---

## ⚡ What was Unified & Built

1. **High-Precision Resume Extraction**:
   - Built with `pdfplumber` layout-aware parsing and `pypdf` fallback.
   - Extracts candidate contact credentials, categorized skills, work history, education, projects, and achievements.
   - Powered by **Groq (`llama-3.3-70b-versatile`)** with structured JSON enforcement (`response_format={"type": "json_object"}`).
   - Includes a deterministic heuristic fallback so the app works even before your API key is provided.

2. **6-Metric ATS Compatibility Audit**:
   - ATS Parsing Compatibility (0-100)
   - Content & Impact Quality (Action verbs & quantifiable metrics)
   - Market Skill Relevance (Trending stack alignment)
   - Experience Depth (Roles & bullet depth)
   - Education Credibility (Degrees & STEM alignment)
   - Formatting & Layout (Word count, links, structure)

3. **Live Developer Signals (GitHub + LeetCode)**:
   - **GitHub**: Repository depth, language entropy, commit activity, stars, followers, and documentation score.
   - **LeetCode**: Problem solved breakdown (Easy / Medium / Hard), acceptance rate, global ranking, and DSA readiness tier.

4. **Cross-Verification Matrix (Claims vs. Live Proof)**:
   - Matches claimed resume skills with real GitHub repositories and LeetCode solved problems.
   - Computes a **Portfolio Trust Score (0-100%)**.
   - Discovers **Unclaimed Strengths** in your GitHub code that were omitted from your resume!

5. **Semantic Job Matching & Skill Gap Analysis**:
   - Hybrid match scoring (Skill overlap + TF-IDF semantic description alignment).
   - Shows match percentage, salary range, matched skills (green badges), and missing skill gaps (amber badges).
   - Generates personalized action tips to help bridge eligibility gaps.

6. **Interactive AI Career Copilot**:
   - Grounded conversational assistant with complete 360° visibility over your resume, GitHub repos, LeetCode stats, and target jobs.
   - Powered by Groq's high-speed inference.

7. **Frontend Architecture & UX**:
   - Custom dark-mode design system with glassmorphic cards and glows.
   - Multi-stage loading progress pipeline (PDF parsing $\rightarrow$ Groq AI extraction $\rightarrow$ ATS audit $\rightarrow$ Dev verification $\rightarrow$ Synthesis).
   - Error handling alerts with troubleshooting tips and retry buttons.
   - Confetti celebration upon evaluation completion.

---

## 🚀 Quick Start Guide

### 1. Add your Groq API Key
Open [`backend/.env`](file:///c:/Users/PRANESH/OneDrive/Desktop/CareerLens%20AI/backend/.env) and insert your free Groq API key:
```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```
*(Get a free key in 30 seconds at [console.groq.com/keys](https://console.groq.com/keys))*

### 2. Start the Backend API
```powershell
cd backend
python -m uvicorn main:app --reload --port 8000
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Start the Frontend
In a new terminal window:
```powershell
cd frontend
npm run dev
```
Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Architecture

```text
CareerLens AI/
├── backend/
│   ├── .env                       # Put your GROQ_API_KEY here
│   ├── .env.example
│   ├── config.py                  # Environment config
│   ├── database.py                # MongoDB with in-memory fallback
│   ├── main.py                    # Unified FastAPI application
│   ├── requirements.txt
│   ├── services/
│   │   ├── groq_service.py        # Groq client (structured JSON & streaming)
│   │   ├── resume_parser.py       # High-precision PDF text extraction
│   │   ├── resume_analyzer.py     # Deep precision extraction via Groq
│   │   ├── score_calculator.py    # 6-Metric ATS & resume scoring engine
│   │   ├── cross_verifier.py      # Claims vs. GitHub/LeetCode proof
│   │   ├── job_database.py        # 10+ curated modern tech positions
│   │   ├── job_matcher.py         # TF-IDF + skill overlap job matcher
│   │   ├── github_service.py      # GitHub profile & repository analytics
│   │   ├── leetcode_service.py    # LeetCode GraphQL stats extractor
│   │   ├── feature_engine.py      # Engineering features & metrics
│   │   ├── scoring_engine.py      # Engineering & DSA readiness tier
│   │   └── chat_engine.py         # AI Career Copilot grounded in 360 profile
│   └── uploads/                   # Stored resume documents
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # Unified app state, tabs & notifications
│       ├── api.js                 # Axios API client with progress tracking
│       ├── index.css              # Custom dark-mode glassmorphic design system
│       └── components/
│           ├── Navbar.jsx         # Header navigation & Groq status badge
│           ├── HeroUpload.jsx     # Dropzone, GitHub/LeetCode inputs & Demo profile
│           ├── LoadingProgress.jsx# Multi-step animated progress pipeline
│           ├── ErrorAlert.jsx     # Resilient error state with retry actions
│           ├── OverviewSection.jsx# 360° Readiness Quotient & 4 core pillars
│           ├── ResumeSection.jsx  # ATS audit, categorized skills & experience
│           ├── DevSignalsSection.jsx # GitHub engineering & LeetCode DSA cards
│           ├── CrossVerificationSection.jsx # Proof matrix & omitted strengths
│           ├── JobMatchesSection.jsx # Semantic job matches & skill gaps
│           ├── CopilotChat.jsx    # Real-time Groq career copilot chat
│           ├── ScoreGauge.jsx     # Circular SVG score gauge
│           └── Icons.jsx          # Custom SVG icon components
│
├── Devlyzer-AI/                   # Preserved original reference project
└── resume-ai/                     # Preserved original reference project
```
