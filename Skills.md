# Skills & Tools Reference — SkillBridge AI

SkillBridge AI features an integrated suite of specialized career mentorship tools, resume analysis utilities, and live job intelligence services. All tools operate in **100% stateless mode** without recording or persisting user resumes, profiles, or conversation transcripts to disk or database tables.

---

## 🛠️ Internal Career & AI Tools

| Tool Name | Domain | Description | Inputs | Key Output Attributes |
| :--- | :--- | :--- | :--- | :--- |
| **`analyze_cv`** | Resume Audit | Extracts detected technical skills, educational degrees, section completeness, and actionable improvements. | `cv_text` (str) | `detected_skills`, `detected_degree`, `completeness_score`, `key_improvements` |
| **`analyze_skill_gap`** | Career Intelligence | Compares current acquired skills against technical requirements for target roles (AI Engineer, Backend, etc.). | `current_skills` (list), `target_role` (str) | `readiness_score`, `skills_acquired`, `skills_to_learn`, `priority_skills` |
| **`create_learning_roadmap`**| Upskilling | Generates structured weekly learning schedules (4 to 16 weeks) with deliverables, exercises, and capstone milestones. | `target_role` (str), `skills_to_learn` (list), `duration_weeks` (int) | `weekly_schedule`, `deliverable`, `milestones`, `capstone_project` |
| **`career_guidance`** | Advisory | Recommends optimal career pathways and specializations based on educational background and personal interests. | `education` (str), `skills` (list), `interests` (list), `experience_level` (str) | `recommended_roles`, `career_pathways`, `industry_outlook` |
| **`match_jobs`** | Market Alignment | Calculates match percentage between candidate skills and real job requirements. | `skills` (list), `job_listings` (list) | `match_score`, `matched_skills`, `missing_skills` |
| **`generate_portfolio_project`**| Portfolio | Tailors production-grade capstone specifications with tech stacks, architecture design, and step-by-step milestones. | `target_role` (str), `skills` (list) | `project_title`, `tech_stack`, `architecture_overview`, `milestones` |
| **`check_ats_quality`** | Resume Audit | Analyzes resume structure for ATS compliance, action verbs, measurable metrics, and formatting cleanliness. | `cv_text` (str), `job_description` (str, optional) | `ats_score`, `formatting_feedback`, `missing_sections`, `action_verb_count` |
| **`prepare_interview`** | Interview Prep | Generates role-specific technical and behavioral STAR questions with answer benchmarks. | `target_role` (str), `experience_level` (str) | `technical_questions`, `behavioral_questions`, `key_points_to_cover` |
| **`track_career_progress`** | Milestone Tracking | Calculates completed milestones, roadmap progress percentages, and next actionable targets. | `completed_milestones` (list), `target_role` (str) | `progress_percentage`, `next_steps`, `strengths` |

---

## 🌐 External Real-Time Integrations (RapidAPI)

| Tool Name | Service Provider | Description | Stateless Features |
| :--- | :--- | :--- | :--- |
| **`search_jobs`** | RapidAPI (JSearch) | Queries real-time verified job postings across global locations, with support for regional aliases (e.g. LHR, FSD, ISB, KHI, PK). | Real listings only, verified direct apply URLs, zero hallucinated job openings. |
| **`search_jobs_by_company`** | RapidAPI (JSearch) | Discovers open engineering and tech vacancies at specific employers or organizations. | Live provider queries, zero database caching of jobs. |
| **`search_salaries`** | RapidAPI (JSearch) | Retrieves verified compensation percentiles and salary benchmark data. | Formatted ranges, regional normalization. |

---

## 💻 Technical Skill Taxonomies Supported

SkillBridge AI automatically recognizes and benchmarks proficiencies across major modern engineering domains:

- **AI & Machine Learning**: Python, PyTorch, TensorFlow, Scikit-Learn, LangChain, Hugging Face, Gemini API, Gemma 4, RAG, Vector DBs, Prompt Engineering, Model Fine-Tuning.
- **Backend & Cloud**: FastAPI, Django, Flask, Node.js, Express, Go, Docker, Kubernetes, AWS, GCP, Azure, PostgreSQL, MongoDB, Redis, REST APIs, Microservices, CI/CD.
- **Frontend & Web**: Next.js, React, TypeScript, JavaScript, Tailwind CSS, HTML5, CSS3, Redux, Responsive UI, State Management.
- **Data Engineering**: SQL, Pandas, NumPy, Apache Spark, Kafka, ETL Pipelines, Airflow, Snowflake, Data Warehousing.
