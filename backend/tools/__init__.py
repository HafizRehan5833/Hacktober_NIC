import inspect
import logging
from typing import Dict, Any, Callable, Awaitable, Union
from tools.career_tools import (
    career_guidance,
    analyze_cv,
    analyze_skill_gap,
    create_learning_roadmap,
    write_cv,
    prepare_interview,
    generate_portfolio_project,
    check_ats_quality,
    track_career_progress
)
from tools.job_tools import (
    search_jobs,
    search_jobs_by_company,
    match_jobs
)
from tools.salary_tools import (
    search_salaries
)

logger = logging.getLogger("skillbridge.tools")

# Strict registry of allowed internal tools
TOOL_REGISTRY: Dict[str, Callable[..., Union[Dict[str, Any], Awaitable[Dict[str, Any]]]]] = {
    "career_guidance": career_guidance,
    "analyze_cv": analyze_cv,
    "match_jobs": match_jobs,
    "analyze_skill_gap": analyze_skill_gap,
    "create_learning_roadmap": create_learning_roadmap,
    "write_cv": write_cv,
    "prepare_interview": prepare_interview,
    "generate_portfolio_project": generate_portfolio_project,
    "check_ats_quality": check_ats_quality,
    "track_career_progress": track_career_progress,
    "search_jobs": search_jobs,
    "search_jobs_by_company": search_jobs_by_company,
    "search_salaries": search_salaries,
}

# Declarative Gemini-compatible tool schemas for function declarations
TOOL_DECLARATIONS = [
    {
        "name": "career_guidance",
        "description": "Recommend suitable career paths based on user's education, skills, interests, and goals.",
        "parameters": {
            "type": "object",
            "properties": {
                "education": {"type": "string", "description": "User education or degree"},
                "skills": {"type": "array", "items": {"type": "string"}, "description": "List of current skills"},
                "interests": {"type": "array", "items": {"type": "string"}, "description": "Domains of interest"},
                "experience_level": {"type": "string", "description": "Experience level (e.g. Beginner, Student, Mid)"},
                "goals": {"type": "string", "description": "User career aspirations"}
            }
        }
    },
    {
        "name": "analyze_cv",
        "description": "Analyze resume/CV text to detect completeness, strengths, gaps, and improvements without inventing data.",
        "parameters": {
            "type": "object",
            "properties": {
                "cv_text": {"type": "string", "description": "The full text content of the resume"}
            },
            "required": ["cv_text"]
        }
    },
    {
        "name": "match_jobs",
        "description": "Match user skills against real RapidAPI job listings to score relevance.",
        "parameters": {
            "type": "object",
            "properties": {
                "user_skills": {"type": "array", "items": {"type": "string"}, "description": "User skills list"},
                "job_listings": {"type": "array", "items": {"type": "object"}, "description": "List of job objects retrieved from search_jobs"}
            },
            "required": ["user_skills", "job_listings"]
        }
    },
    {
        "name": "analyze_skill_gap",
        "description": "Identify missing skills needed for a target role and prioritize learning requirements.",
        "parameters": {
            "type": "object",
            "properties": {
                "current_skills": {"type": "array", "items": {"type": "string"}, "description": "User current technical skills"},
                "target_role": {"type": "string", "description": "Desired job title (e.g. AI Engineer, Backend Developer)"}
            },
            "required": ["current_skills", "target_role"]
        }
    },
    {
        "name": "create_learning_roadmap",
        "description": "Generate a structured weekly learning plan with milestones, topics, and deliverables.",
        "parameters": {
            "type": "object",
            "properties": {
                "target_role": {"type": "string", "description": "Role to build roadmap for"},
                "current_skills": {"type": "array", "items": {"type": "string"}, "description": "Current skills list"},
                "timeframe_weeks": {"type": "integer", "description": "Target number of weeks (4 to 16)"}
            },
            "required": ["target_role", "current_skills"]
        }
    },
    {
        "name": "write_cv",
        "description": "Generate ATS-friendly resume content from factual user input.",
        "parameters": {
            "type": "object",
            "properties": {
                "full_name": {"type": "string", "description": "Candidate full name"},
                "target_role": {"type": "string", "description": "Target career position"},
                "education": {"type": "string", "description": "Candidate educational credentials"},
                "skills": {"type": "array", "items": {"type": "string"}, "description": "Skills list"}
            },
            "required": ["full_name", "target_role", "education", "skills"]
        }
    },
    {
        "name": "prepare_interview",
        "description": "Generate technical and behavioral interview preparation questions with answer guidelines.",
        "parameters": {
            "type": "object",
            "properties": {
                "target_role": {"type": "string", "description": "Interview target role"},
                "experience_level": {"type": "string", "description": "Experience level (e.g. Beginner, Senior)"}
            },
            "required": ["target_role"]
        }
    },
    {
        "name": "generate_portfolio_project",
        "description": "Recommend structured portfolio projects with architectures and GitHub guidelines.",
        "parameters": {
            "type": "object",
            "properties": {
                "target_role": {"type": "string", "description": "Target role for project"},
                "skills": {"type": "array", "items": {"type": "string"}, "description": "Skills to feature in project"}
            },
            "required": ["target_role", "skills"]
        }
    },
    {
        "name": "check_ats_quality",
        "description": "Estimate resume structure quality and keyword alignment against an optional job description.",
        "parameters": {
            "type": "object",
            "properties": {
                "resume_text": {"type": "string", "description": "Text of resume to evaluate"},
                "job_description": {"type": "string", "description": "Optional job description to match against"}
            },
            "required": ["resume_text"]
        }
    },
    {
        "name": "track_career_progress",
        "description": "Calculate stateless career progress summary from client-supplied milestone completion data.",
        "parameters": {
            "type": "object",
            "properties": {
                "completed_milestones": {"type": "array", "items": {"type": "string"}, "description": "Completed milestones"},
                "current_goal": {"type": "string", "description": "The goal being pursued"},
                "total_milestones_count": {"type": "integer", "description": "Total milestones planned"}
            },
            "required": ["completed_milestones", "current_goal"]
        }
    },
    {
        "name": "search_jobs",
        "description": "Retrieve live job listings from RapidAPI (e.g. JSearch). Never fabricates results.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Job title or query keyword (e.g. 'Python Developer', 'AI Engineer')"},
                "location": {"type": "string", "description": "City, country, or 'Remote'"},
                "num_pages": {"type": "integer", "description": "Number of pages (default 1)"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "search_jobs_by_company",
        "description": "Retrieve job openings for a specific company via RapidAPI.",
        "parameters": {
            "type": "object",
            "properties": {
                "company_name": {"type": "string", "description": "Name of the target company (e.g. Google, Microsoft, Meta)"},
                "query": {"type": "string", "description": "Optional job title filter"},
                "location": {"type": "string", "description": "Optional location filter"}
            },
            "required": ["company_name"]
        }
    },
    {
        "name": "search_salaries",
        "description": "Retrieve real salary data from RapidAPI for a job title and location.",
        "parameters": {
            "type": "object",
            "properties": {
                "job_title": {"type": "string", "description": "Job title to benchmark"},
                "location": {"type": "string", "description": "Geographic location"}
            },
            "required": ["job_title"]
        }
    }
]

async def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    Safely dispatches and executes registered internal tools with argument validation.
    Restricts execution strictly to known tools in TOOL_REGISTRY.
    """
    if tool_name not in TOOL_REGISTRY:
        logger.warning(f"Unauthorized or unknown tool execution attempt: {tool_name}")
        return {"error": f"Tool '{tool_name}' is not registered or permitted."}

    func = TOOL_REGISTRY[tool_name]
    try:
        sig = inspect.signature(func)
        bound_args = {}
        for param_name, param in sig.parameters.items():
            if param_name in arguments:
                bound_args[param_name] = arguments[param_name]
            elif param.default is inspect.Parameter.empty:
                return {"error": f"Missing required parameter '{param_name}' for tool '{tool_name}'."}

        if inspect.iscoroutinefunction(func):
            result = await func(**bound_args)
        else:
            result = func(**bound_args)
            
        return result
    except Exception as e:
        logger.error(f"Error executing tool {tool_name}: {str(e)}")
        return {"error": f"Execution failed for {tool_name}: {str(e)}"}

__all__ = [
    "career_guidance",
    "analyze_cv",
    "analyze_skill_gap",
    "create_learning_roadmap",
    "write_cv",
    "prepare_interview",
    "generate_portfolio_project",
    "check_ats_quality",
    "track_career_progress",
    "search_jobs",
    "search_jobs_by_company",
    "match_jobs",
    "search_salaries",
    "TOOL_REGISTRY",
    "TOOL_DECLARATIONS",
    "execute_tool",
]
