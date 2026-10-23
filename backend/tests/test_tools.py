import pytest
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
from tools.job_tools import match_jobs
from tools import execute_tool

@pytest.mark.asyncio
async def test_career_guidance():
    res = career_guidance(education="BS CS", skills=["Python", "FastAPI"], experience_level="Beginner")
    assert "recommended_career_paths" in res
    assert len(res["recommended_career_paths"]) > 0

@pytest.mark.asyncio
async def test_analyze_skill_gap():
    res = analyze_skill_gap(current_skills=["Python", "FastAPI"], target_role="AI Engineer")
    assert "readiness_score" in res
    assert "skills_acquired" in res
    assert "skills_to_learn" in res
    assert "PyTorch" in res["skills_to_learn"] or "Transformers" in res["skills_to_learn"]

@pytest.mark.asyncio
async def test_create_learning_roadmap():
    res = create_learning_roadmap(target_role="AI Engineer", current_skills=["Python", "FastAPI"], timeframe_weeks=8)
    assert "weekly_schedule" in res
    assert len(res["weekly_schedule"]) == 8

@pytest.mark.asyncio
async def test_analyze_cv():
    sample_cv = """
    John Doe
    Email: john@example.com | Phone: 123-456-7890 | GitHub: github.com/johndoe
    Summary: Enthusiastic software developer with strong skills in Python and FastAPI.
    Education: BS in Computer Science, University.
    Skills: Python, FastAPI, Docker, SQL, Git.
    Experience: Developed web services and engineered scalable APIs, reducing latency by 20%.
    Projects: Built an AI career bridge platform using FastAPI.
    """
    res = analyze_cv(sample_cv)
    assert res["completeness_score"] >= 80
    assert "strengths" in res

@pytest.mark.asyncio
async def test_match_jobs_normalization():
    mock_jobs = [
        {
            "job_id": "job_123",
            "title": "Junior AI Engineer",
            "company": "DeepTech AI",
            "location": "Remote",
            "description": "Looking for developer skilled in Python, FastAPI, and PyTorch.",
            "apply_link": "https://example.com/apply"
        }
    ]
    matched = match_jobs(user_skills=["Python", "FastAPI"], job_listings=mock_jobs)
    assert len(matched) == 1
    assert matched[0]["relevance_score"] >= 60

@pytest.mark.asyncio
async def test_unauthorized_tool_dispatch():
    res = await execute_tool("forbidden_malicious_tool", {})
    assert "error" in res
    assert "not registered" in res["error"]

@pytest.mark.asyncio
async def test_missing_parameter_tool_dispatch():
    res = await execute_tool("analyze_skill_gap", {"current_skills": ["Python"]}) # missing target_role
    assert "error" in res
    assert "Missing required parameter" in res["error"]
