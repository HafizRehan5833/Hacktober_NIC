# SkillBridge AI — Autonomous Career Mentor Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Model: Gemma 4](https://img.shields.io/badge/Model-Gemma%204%20(26B)-orange.svg)](https://ai.google.dev/gemma)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![Frontend: Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-black.svg)](https://nextjs.org/)
[![Database: None (Stateless)](https://img.shields.io/badge/Database-None%20(Stateless)-lightgrey.svg)](#-architecture--privacy-guarantee)

> 🌐 **Live Deployments:**
> - **Frontend Web App:** [https://jobfrontend-ten.vercel.app](https://jobfrontend-ten.vercel.app/)
> - **Backend API:** [https://backendjob-xi.vercel.app](https://backendjob-xi.vercel.app/)

**SkillBridge AI** is an intelligent, privacy-focused career acceleration platform built for the **Hacktoberfest Open-Source AI and Gemma 4 challenges**. It empowers developers, students, and job seekers with instant CV analysis, skill-gap detection, customized weekly roadmaps, portfolio project blueprints, and real-time job openings via RapidAPI.

---

## 💡 What the Application Does

SkillBridge AI functions as an end-to-end career guidance engine:

1. **AI Career Mentor (`POST /chat/chat`)**: An interactive career advisor powered by Google's **Gemma 4** model (`gemma-4-26b-a4b-it`) via the Gemini API, equipped with function calling to dynamically resolve career inquiries.
2. **CV & Resume Analyzer**: Directly uploads PDF/TXT resumes in-memory, extracting skills, verifying educational degrees, and calculating structural completeness scores without storing documents.
3. **Skill-Gap Analysis**: Evaluates current abilities against requirements for target roles (e.g., *AI Engineer*, *Backend Developer*) to pinpoint high-priority missing technologies.
4. **Interactive Learning Roadmaps**: Generates customizable weekly curriculum plans (4 to 16 weeks) complete with exercises, weekly deliverables, and capstone milestones.
5. **Real-Time Job Finder**: Queries verified, live job vacancies through RapidAPI (JSearch) with natural query handling for regional city aliases (e.g., *LHR, FSD, ISB, KHI, PK*).
6. **Portfolio Project Generator**: Recommends architecture specifications, tech stacks, and step-by-step milestones for standout portfolio projects.
7. **ATS Resume Checker**: Analyzes resumes for ATS compatibility, action verbs, measurable outcomes, and formatting recommendations.

---

## 🔒 Architecture & Privacy Guarantee

- **100% Stateless**: Zero database footprint. No PostgreSQL, MongoDB, SQLite, or Redis.
- **No Data Retention**: Resumes, profiles, and chat conversations are processed strictly in-memory during request execution and are never saved to disk or server databases.

---

## 🤖 AI Model & External Services

- **Core AI Model**: **Google Gemma 4 (`gemma-4-26b-a4b-it`)** accessed via Google Gemini API.
  - Features autonomous fallback reasoning to ensure fast and reliable responses even during upstream API degradation.
- **Live Job Intel**: **RapidAPI (JSearch)** for verified employment listings and salary benchmarks.
- **Document Processing**: In-memory PDF text extraction powered by `pypdf`.

---

## 🚀 How to Run the Application

### Prerequisites
- **Python**: `3.10+` (tested with Python 3.11 & 3.13)
- **Node.js**: `v18.17+` or `v20+` (tested with v22+)
- **Package Managers**: `uv` (recommended for Python) and `npm`

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/Hacktober_fest.git
cd Hacktober_fest
```

---

### Step 2: Backend Setup (FastAPI)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and configure your API keys:
   ```ini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemma-4-26b-a4b-it
   RAPIDAPI_KEY=your_rapidapi_key_here
   RAPIDAPI_HOST=jsearch.p.rapidapi.com
   ```

4. Install dependencies and start the backend:
   ```bash
   # Using uv (fastest):
   uv sync
   uv run uvicorn main:app --reload --port 8000
   ```
   *The backend will be running at [http://127.0.0.1:8000](http://127.0.0.1:8000). Interactive Swagger docs are available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).*

---

### Step 3: Frontend Setup (Next.js 16)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env.local` file (optional, defaults to `http://127.0.0.1:8000`):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   *The web client will be running at [http://localhost:3000](http://localhost:3000).*

---

### Step 4: Running Tests

To run the backend test suite:
```bash
cd backend
uv run pytest -v
```

---

## 📄 License

This project is open-source and licensed under the **[MIT License](LICENSE)**.

```
MIT License
Copyright (c) 2026 SkillBridge AI Contributors
```

*(External models such as Gemma 4 are governed by Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms)).*
