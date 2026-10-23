# SkillBridge AI — Frontend Documentation

SkillBridge AI is a modern, responsive career acceleration platform for students, fresh graduates, and job seekers. The frontend connects to the stateless FastAPI backend powered by Gemma 4 and RapidAPI.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js `v18.17+` or `v20+` (tested with `v22.15.0`)
- SkillBridge AI FastAPI backend running on `http://127.0.0.1:8000`

### 2. Configure Environment Variables
Inside `frontend/`:
```bash
cp .env.example .env.local
```
Ensure the API base URL points to your FastAPI backend:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛠️ Architecture & Features

### Core Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Markdown Rendering:** `react-markdown` + `remark-gfm`
- **Stateless Communication:** Fetch API client (`src/lib/api.ts`)

### Integrated Features & Screens
1. **Welcome Dashboard:** Hero overview, live backend health check, prominent chat bar, instant career prompt cards, and quick feature access.
2. **AI Career Mentor:** Conversational interface connecting to `POST /chat/chat` with tool badges, multiline messages, auto-scroll, safe markdown, copy response, and conversation history memory during session.
3. **CV Analyzer:** Upload text/file, extract skills/degree, audit CV gaps, and auto-query matching RapidAPI job listings.
4. **Job Finder:** Natural language search handling Pakistani city aliases (FSD, LHR, ISB, KHI) and typos, displaying real listings with apply links.
5. **Skill-Gap Analysis:** Role-based gap auditing, readiness scoring, and handoff to the Learning Roadmap.
6. **Learning Roadmap:** 4 to 16-week interactive roadmap generator with session checklist, copy, print, and markdown export.
7. **Interview Preparation:** Technical & behavioral STAR questions with interactive mock answer evaluation.
8. **Portfolio Projects:** Production-ready capstone project blueprints with architecture, milestones, and README guides.
9. **Salary Explorer:** Real compensation benchmarks, percentiles, and limitations via RapidAPI.
10. **ATS Resume Checker:** Heuristic ATS compatibility score, keyword matching, and section completeness.
11. **Resume Writer:** Truthful, hallucination-free resume generator and raw text editor with export options.
12. **Career Progress:** Stateless goal and milestone tracker backed by browser-local storage.
