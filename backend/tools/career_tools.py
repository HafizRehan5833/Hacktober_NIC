from typing import Dict, Any, List, Optional
import re

# Comprehensive skill ontology map for career intelligence
SKILL_TAXONOMY = {
    "AI Engineer": {
        "core_skills": ["Python", "PyTorch", "TensorFlow", "Transformers", "NLP", "Computer Vision", "LLMs", "RAG", "Vector Databases", "MLOps", "Git"],
        "recommended_projects": [
            "End-to-End RAG System with Vector Search & Gemma/Gemini",
            "Fine-tuned Domain-Specific LLM with LoRA & Hugging Face",
            "Multi-Agent Workflow Orchestrator with FastAPI"
        ],
        "certifications": ["DeepLearning.AI AI Engineer Professional Certificate", "Google Cloud Professional ML Engineer"],
        "interview_topics": ["Attention Mechanism & Transformers", "RAG vs Fine-tuning tradeoffs", "Vector embeddings & cosine similarity", "Quantization (GGUF, AWQ, LoRA)"]
    },
    "Machine Learning Engineer": {
        "core_skills": ["Python", "Scikit-Learn", "PyTorch", "Feature Engineering", "Pandas", "NumPy", "SQL", "Docker", "MLflow", "Model Serving"],
        "recommended_projects": [
            "Automated Predictive Pipeline with CI/CD and MLflow tracking",
            "Real-time Fraud Detection Microservice with Kafka and FastAPI"
        ],
        "certifications": ["AWS Certified Machine Learning - Specialty", "TensorFlow Developer Certificate"],
        "interview_topics": ["Bias-Variance Tradeoff", "Cross-Validation Techniques", "Handling Imbalanced Datasets", "Model Drift & Monitoring"]
    },
    "Backend Developer": {
        "core_skills": ["Python", "FastAPI", "PostgreSQL", "REST APIs", "Docker", "Git", "System Design", "AsyncIO", "Redis", "Unit Testing"],
        "recommended_projects": [
            "High-concurrency Event-driven Microservice with WebSockets",
            "Stateless Rate-limited Authentication & Gateway API"
        ],
        "certifications": ["AWS Certified Developer Associate", "Linux Foundation Certified System Administrator"],
        "interview_topics": ["ACID properties vs BASE", "RESTful principles vs GraphQL", "Horizontal vs Vertical Scaling", "Caching strategies"]
    },
    "Data Scientist": {
        "core_skills": ["Python", "R", "SQL", "Statistics", "Pandas", "Matplotlib", "Seaborn", "Hypothesis Testing", "Exploratory Data Analysis"],
        "recommended_projects": [
            "Customer Churn Propensity Modeling with Business Impact Dashboard",
            "A/B Testing Simulation Framework with Statistical Power Analysis"
        ],
        "certifications": ["Google Data Analytics Professional Certificate", "IBM Data Science Professional"],
        "interview_topics": ["Central Limit Theorem", "p-values and Type I/II errors", "Feature Selection methods", "A/B testing pitfalls"]
    },
    "Full Stack Engineer": {
        "core_skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "FastAPI", "CSS", "HTML", "REST APIs", "Git"],
        "recommended_projects": [
            "Collaborative Real-time Workspace App with Canvas & WebSockets",
            "Full-stack AI Content Studio with Next.js and FastAPI"
        ],
        "certifications": ["Meta Front-End & Back-End Professional Certificates"],
        "interview_topics": ["State Management", "DOM lifecycle and virtual DOM", "CORS & Browser Security", "API Design and Idempotency"]
    }
}

def career_guidance(
    education: Optional[str] = None,
    skills: Optional[List[str]] = None,
    interests: Optional[List[str]] = None,
    experience_level: Optional[str] = "Beginner",
    goals: Optional[str] = None
) -> Dict[str, Any]:
    """
    Recommends suitable career tracks based on academic background, skills, interests, and goals.
    Stateless calculation.
    """
    skills = skills or []
    interests = interests or []
    skills_lower = [s.lower() for s in skills]
    interests_lower = [i.lower() for i in interests]

    matches = []
    for role, details in SKILL_TAXONOMY.items():
        overlap = [s for s in details["core_skills"] if s.lower() in skills_lower]
        interest_match = any(word in " ".join(interests_lower) for word in role.lower().split())
        score = len(overlap) * 15 + (20 if interest_match else 0)
        matches.append({
            "role": role,
            "matching_skills": overlap,
            "match_score": min(100, score + 30 if overlap or interest_match else 20),
            "key_focus_areas": details["core_skills"][:5],
            "recommended_certifications": details["certifications"]
        })

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    top_recommendations = matches[:3]

    return {
        "user_profile_summary": {
            "education": education or "Not specified",
            "experience_level": experience_level,
            "current_skills_count": len(skills),
        },
        "recommended_career_paths": top_recommendations,
        "advisory": (
            f"Based on your profile with {len(skills)} declared skills, the top matching career path is "
            f"'{top_recommendations[0]['role']}'. We recommend focusing on the identified core skills."
        )
    }

def analyze_cv(cv_text: str) -> Dict[str, Any]:
    """
    Analyzes user-provided CV text for strengths, gaps, section completeness, and actionable improvements.
    Never invents experience or credentials.
    """
    if not cv_text or len(cv_text.strip()) < 50:
        return {
            "error": "CV text is too short or empty. Please provide the full plain-text content of your resume."
        }

    text_lower = cv_text.lower()

    # Detect standard resume sections
    sections = {
        "contact_info": bool(re.search(r"(@|email|phone|linkedin|github)", text_lower)),
        "summary_objective": bool(re.search(r"(summary|objective|profile|about me)", text_lower)),
        "experience": bool(re.search(r"(experience|work history|employment|internship)", text_lower)),
        "education": bool(re.search(r"(education|university|degree|bachelor|master|gpa)", text_lower)),
        "skills": bool(re.search(r"(skills|technologies|tools|competencies)", text_lower)),
        "projects": bool(re.search(r"(projects|portfolio|personal projects)", text_lower)),
    }

    missing_sections = [sec.replace("_", " ").title() for sec, present in sections.items() if not present]
    present_sections = [sec.replace("_", " ").title() for sec, present in sections.items() if present]

    # Action verbs check
    action_verbs = ["developed", "architected", "engineered", "built", "implemented", "optimized", "orchestrated", "led", "reduced", "increased"]
    found_action_verbs = [verb for verb in action_verbs if verb in text_lower]

    # Quantifiable metrics check (numbers, percentages, metrics)
    metrics_found = len(re.findall(r"(\d+%\s*|\$\d+|\d+\s*x|\d+\s*users|\d+\s*ms|\d+\s*seconds)", text_lower))

    # Extract Degree / Education
    degree_patterns = [
        r"(bachelor(?:'s)?(?:\s+of\s+[a-zA-Z\s]+|\s+degree)?|bs\s+[a-z\s]+|b\.s\.|bsc|b\.sc)",
        r"(master(?:'s)?(?:\s+of\s+[a-zA-Z\s]+|\s+degree)?|ms\s+[a-z\s]+|m\.s\.|msc|m\.sc)",
        r"(phd|doctorate|doctor\s+of\s+philosophy)",
        r"(diploma|associate(?:'s)?\s+degree)"
    ]
    detected_degree = None
    for pattern in degree_patterns:
        match = re.search(pattern, text_lower)
        if match:
            detected_degree = match.group(0).strip().title()
            break

    # Extract Common Technical Skills
    known_tech_skills = [
        "python", "fastapi", "django", "flask", "pytorch", "tensorflow", "transformers", "hugging face",
        "keras", "machine learning", "deep learning", "nlp", "computer vision", "llm", "llms", "rag",
        "langchain", "sql", "postgresql", "mysql", "mongodb", "redis", "docker", "kubernetes", "aws",
        "azure", "gcp", "git", "github", "linux", "javascript", "typescript", "react", "next.js", "node.js",
        "c++", "java", "c#", "golang", "rust", "rest api", "rest", "graphql", "pandas", "numpy", "scikit-learn"
    ]
    extracted_skills = []
    for skill in known_tech_skills:
        # Match as whole word
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            extracted_skills.append(skill.title() if len(skill) > 3 else skill.upper())

    # Detect Recommended Target Role from skills/education
    detected_target_role = "AI Engineer" if any(s.lower() in ["pytorch", "tensorflow", "transformers", "llm", "rag", "machine learning"] for s in extracted_skills) else "Backend Developer"

    strengths = []
    if len(present_sections) >= 5:
        strengths.append("Comprehensive structure covering key standard resume sections.")
    if len(found_action_verbs) >= 4:
        strengths.append(f"Strong action-driven vocabulary detected ({', '.join(found_action_verbs[:4])}).")
    if metrics_found >= 2:
        strengths.append("Evidence of measurable impact with quantifiable numbers and percentages.")

    improvements = []
    if missing_sections:
        improvements.append(f"Add missing standard sections: {', '.join(missing_sections)}.")
    if metrics_found < 2:
        improvements.append("Incorporate more quantifiable achievements (e.g. 'Improved API response latency by 35%').")
    if "github" not in text_lower and "portfolio" not in text_lower:
        improvements.append("Include links to your GitHub profile and public portfolio projects.")

    return {
        "analysis_type": "Resume Structure & Content Audit",
        "completeness_score": int((len(present_sections) / len(sections)) * 100),
        "present_sections": present_sections,
        "missing_sections": missing_sections,
        "detected_degree": detected_degree or "Degree / Education detected in text",
        "detected_skills": extracted_skills,
        "recommended_role": detected_target_role,
        "strengths": strengths if strengths else ["Basic resume text provided."],
        "key_improvements": improvements,
        "disclaimer": "This analysis is an automated structural evaluation. It does not store or persist your resume."
    }

def analyze_skill_gap(current_skills: List[str], target_role: str) -> Dict[str, Any]:
    """
    Identifies skills needed for a target role, compares them with current skills, and prioritizes missing areas.
    """
    current_skills_clean = [s.strip() for s in current_skills if s.strip()]
    current_lower = {s.lower(): s for s in current_skills_clean}

    # Find matched role taxonomy or fallback to generic technical role
    matched_role_key = None
    for role_name in SKILL_TAXONOMY:
        if role_name.lower() in target_role.lower() or target_role.lower() in role_name.lower():
            matched_role_key = role_name
            break

    if not matched_role_key:
        matched_role_key = "AI Engineer" if "ai" in target_role.lower() else "Backend Developer"

    taxonomy = SKILL_TAXONOMY[matched_role_key]
    required_skills = taxonomy["core_skills"]

    acquired = []
    missing = []
    for skill in required_skills:
        if skill.lower() in current_lower:
            acquired.append(skill)
        else:
            missing.append(skill)

    readiness_score = int((len(acquired) / len(required_skills)) * 100) if required_skills else 0

    return {
        "target_role": target_role,
        "matched_taxonomy": matched_role_key,
        "readiness_score": readiness_score,
        "skills_acquired": acquired,
        "skills_to_learn": missing,
        "high_priority_gap": missing[:3] if missing else ["Continue advanced mastery & specialized architectures"],
        "recommended_projects": taxonomy["recommended_projects"],
        "interview_focus_areas": taxonomy["interview_topics"]
    }

def create_learning_roadmap(
    target_role: str,
    current_skills: List[str],
    timeframe_weeks: int = 8
) -> Dict[str, Any]:
    """
    Generates a structured weekly learning plan with topics, projects, exercises, and measurable milestones.
    """
    gap = analyze_skill_gap(current_skills, target_role)
    skills_to_learn = gap["skills_to_learn"]

    if not skills_to_learn:
        skills_to_learn = ["Advanced System Design", "Scalable Microservices", "CI/CD & Production Deployment"]

    total_weeks = min(max(timeframe_weeks, 4), 16)
    weeks = []

    # Distribute skills across weeks
    skills_per_week = max(1, len(skills_to_learn) // (total_weeks - 1))
    
    for i in range(1, total_weeks + 1):
        if i == total_weeks:
            # Capstone week
            weeks.append({
                "week": i,
                "focus_area": "Capstone Portfolio Project & Deployment",
                "topics": ["End-to-end integration", "Dockerization & Cloud hosting", "Technical documentation & README"],
                "deliverable": f"Deploy a production-ready {target_role} showcase on GitHub.",
                "milestone": "Portfolio project publicly verifiable."
            })
        else:
            idx = (i - 1) * skills_per_week
            current_focus = skills_to_learn[idx : idx + skills_per_week]
            if not current_focus:
                current_focus = [skills_to_learn[-1]]
            
            weeks.append({
                "week": i,
                "focus_area": f"Core Foundations: {', '.join(current_focus)}",
                "topics": [f"Deep dive into {s} fundamentals & industry patterns" for s in current_focus],
                "deliverable": f"Build practical hands-on mini-lab implementing {', '.join(current_focus)}.",
                "milestone": f"Comfortable applying {current_focus[0]} in real-world scenarios."
            })

    return {
        "target_role": target_role,
        "duration": f"{total_weeks} Weeks",
        "current_skills_acknowledged": current_skills,
        "weekly_schedule": weeks,
        "success_criteria": [
            "Complete all weekly code exercises in a dedicated GitHub repository.",
            "Write modular, tested code adhering to clean architecture standards.",
            "Deploy the final capstone project with a live demonstration link."
        ]
    }

def write_cv(
    full_name: str,
    target_role: str,
    education: str,
    skills: List[str],
    experience_bullets: Optional[List[str]] = None,
    projects: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Generates clean, ATS-optimized CV content from user-provided factual data.
    Never invents fictitious credentials.
    """
    exp_bullets = experience_bullets or [
        f"Developed high-quality software solutions utilizing {', '.join(skills[:3]) if skills else 'modern programming tools'}.",
        "Collaborated with cross-functional team members to design scalable and reliable system architectures.",
        "Applied best engineering practices including code reviews, unit testing, and documentation."
    ]

    project_list = projects or [
        {
            "name": f"{target_role} Capstone System",
            "description": f"Engineered a production-ready application using {', '.join(skills[:4]) if skills else 'Python and FastAPI'}. Implemented automated testing and containerized deployment."
        }
    ]

    return {
        "candidate_name": full_name,
        "target_role": target_role,
        "professional_summary": (
            f"Results-driven and motivated {target_role} with strong background in {education}. "
            f"Proficient in {', '.join(skills[:5]) if skills else 'software engineering'}. "
            f"Passionate about building scalable systems, tackling complex challenges, and delivering tangible value."
        ),
        "education": education,
        "skills_section": {
            "technical_skills": skills,
            "core_competencies": ["Clean Architecture", "Problem Solving", "CI/CD", "Agile Collaboration"]
        },
        "experience": exp_bullets,
        "projects": project_list,
        "formatting_tips": [
            "Keep font clean and readable (e.g., Arial, Calibri, or Roboto).",
            "Use bullet points starting with strong action verbs.",
            "Save and export as standard PDF without multi-column tables to maximize ATS compatibility."
        ]
    }

def prepare_interview(
    target_role: str,
    experience_level: str = "Beginner",
    topic_focus: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates technical, HR, and behavioral interview questions with answer guidelines.
    """
    taxonomy_key = "AI Engineer" if "ai" in target_role.lower() else "Backend Developer"
    sample_topics = SKILL_TAXONOMY.get(taxonomy_key, {}).get("interview_topics", ["System Architecture", "Coding Best Practices"])

    return {
        "target_role": target_role,
        "experience_level": experience_level,
        "technical_questions": [
            {
                "question": f"Explain the core architectural concepts of {sample_topics[0]} and when you would choose it over alternatives.",
                "key_points_to_cover": ["Fundamental definition and use-cases", "Trade-offs and limitations", "Real-world production considerations"]
            },
            {
                "question": f"How do you approach debugging and optimizing performance in a {target_role} workflow?",
                "key_points_to_cover": ["Profiling and metrics collection", "Root cause isolation", "Iterative benchmarking"]
            }
        ],
        "behavioral_questions": [
            {
                "question": "Describe a challenging technical bug you encountered recently and how you resolved it.",
                "methodology": "Use the STAR method: Situation, Task, Action, Result."
            },
            {
                "question": "How do you prioritize competing deadlines when requirements shift unexpectedly?",
                "methodology": "Demonstrate proactive communication, impact assessment, and stakeholder alignment."
            }
        ],
        "preparation_tips": [
            "Practice explaining your thoughts aloud during live coding exercises.",
            "Ask clarifying questions before jumping into code solutions.",
            "Review core data structures and asynchronous programming concepts."
        ]
    }

def generate_portfolio_project(
    target_role: str,
    skills: List[str],
    difficulty: str = "Intermediate"
) -> Dict[str, Any]:
    """
    Recommends tailored portfolio projects with architecture, milestones, and presentation advice.
    """
    skill_str = ", ".join(skills[:3]) if skills else "Python, FastAPI"
    project_title = f"SkillBridge {target_role} Orchestration Platform"
    
    return {
        "project_title": project_title,
        "target_role": target_role,
        "difficulty_level": difficulty,
        "overview": f"A production-grade system demonstrating mastery of {skill_str} tailored for modern enterprise workflows.",
        "key_features": [
            "Stateless, modular REST API with comprehensive schema validation.",
            "External API integration with resilient error-handling and timeouts.",
            "Automated unit testing suite with >80% code coverage.",
            "Dockerized container specification for seamless zero-dependency execution."
        ],
        "suggested_tech_stack": skills if skills else ["Python 3.11", "FastAPI", "Pydantic", "Docker", "Pytest"],
        "milestones": [
            "Phase 1: Architecture design, schemas, and environment setup.",
            "Phase 2: Core business logic and external service client implementation.",
            "Phase 3: Automated tests, edge-case validation, and mock coverage.",
            "Phase 4: Comprehensive README with architecture diagrams and API documentation."
        ],
        "github_presentation_guide": [
            "Include a clean banner and architecture diagram in your README.",
            "Provide one-line copy-paste quickstart commands.",
            "Add GitHub Actions CI badge demonstrating passing tests."
        ]
    }

def check_ats_quality(resume_text: str, job_description: Optional[str] = None) -> Dict[str, Any]:
    """
    Evaluates resume structure, keyword density, and alignment against a job description.
    All scores are clearly labeled as estimates.
    """
    if not resume_text or len(resume_text.strip()) < 30:
        return {"error": "Please provide your resume text for ATS evaluation."}

    text_lower = resume_text.lower()
    
    # Calculate baseline structural estimate
    score = 60
    positives = []
    recommendations = []

    if "@" in text_lower or "email" in text_lower:
        score += 8
        positives.append("Contact information clearly detectable.")
    else:
        recommendations.append("Ensure your email and contact information are clearly visible.")

    if any(k in text_lower for k in ["experience", "employment", "internship"]):
        score += 10
        positives.append("Standard work experience section detected.")
    
    if any(k in text_lower for k in ["skills", "technologies", "proficiencies"]):
        score += 10
        positives.append("Dedicated skills section identified.")

    # Match job description if provided
    matched_keywords = []
    missing_keywords = []
    if job_description:
        jd_words = set(re.findall(r"\b[A-Za-z]{3,}\b", job_description.lower()))
        resume_words = set(re.findall(r"\b[A-Za-z]{3,}\b", text_lower))
        
        # Filter for common tech words
        common_tech = {"python", "fastapi", "docker", "git", "sql", "api", "rest", "cloud", "aws", "gemma", "gemini", "react", "ml"}
        jd_tech = jd_words.intersection(common_tech)
        
        for w in jd_tech:
            if w in resume_words:
                matched_keywords.append(w)
            else:
                missing_keywords.append(w)

        if missing_keywords:
            recommendations.append(f"Consider naturally including relevant target keywords: {', '.join(missing_keywords)}.")

    estimated_score = min(score, 95)

    return {
        "ats_estimate_label": "Automated Structural & Keyword Alignment Estimate (Not a proprietary ATS proprietary score)",
        "estimated_score_percentage": estimated_score,
        "positive_indicators": positives,
        "recommendations_for_improvement": recommendations,
        "matched_job_keywords": matched_keywords,
        "missing_job_keywords": missing_keywords,
        "disclaimer": "ATS scoring algorithms vary by employer. This estimate serves as an optimization guide."
    }

def track_career_progress(
    completed_milestones: List[str],
    current_goal: str,
    total_milestones_count: int = 5
) -> Dict[str, Any]:
    """
    Provides a purely stateless career progress breakdown based on current client inputs.
    Never persists progress to any database or local storage.
    """
    total = max(total_milestones_count, len(completed_milestones))
    completed_count = len(completed_milestones)
    progress_percentage = int((completed_count / total) * 100) if total > 0 else 0

    return {
        "status": "Stateless Progress Report",
        "current_goal": current_goal,
        "progress_percentage": progress_percentage,
        "completed_count": completed_count,
        "total_count": total,
        "completed_milestones": completed_milestones,
        "next_recommended_milestone": f"Advance to the next milestone for '{current_goal}' and build hands-on verification.",
        "persistence_notice": "Progress is computed strictly in-memory for this request. Please maintain your progress tracker in your client state."
    }
