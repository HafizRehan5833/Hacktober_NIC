import pytest
from unittest.mock import AsyncMock, patch
from services.rapidapi_service import RapidAPIService
from services.gemini_service import GeminiService
from agents.career_agent import CareerAgent
from schemas.chat_schemas import ChatRequest, UserProfile

@pytest.mark.asyncio
async def test_rapidapi_mock_search_jobs():
    """Verify RapidAPI job normalization on real mock data."""
    service = RapidAPIService()
    mock_response_data = {
        "data": [
            {
                "job_id": "test_job_1",
                "job_title": "AI Platform Engineer",
                "employer_name": "Google DeepMind",
                "job_city": "London",
                "job_country": "UK",
                "job_is_remote": True,
                "job_employment_type": "FULLTIME",
                "job_description": "We are seeking an AI Engineer experienced in LLMs, Gemini, and Python.",
                "job_apply_link": "https://careers.google.com/jobs/123",
                "job_posted_at_datetime_utc": "2026-10-23T12:00:00.000Z",
                "job_publisher": "Google Careers",
                "job_min_salary": 140000,
                "job_max_salary": 200000,
                "job_salary_currency": "USD",
                "job_salary_period": "YEAR"
            }
        ]
    }

    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = AsyncMock()
        mock_resp.status_code = 200
        mock_resp.json = lambda: mock_response_data
        mock_resp.raise_for_status = lambda: None
        mock_get.return_value = mock_resp

        with patch("config.settings.rapidapi_key", "test_key"):
            results = await service.search_jobs("AI Engineer", location="Remote")
            assert len(results) == 1
            job = results[0]
            assert job["title"] == "AI Platform Engineer"
            assert job["company"] == "Google DeepMind"
            assert job["is_remote"] is True
            assert job["apply_link"] == "https://careers.google.com/jobs/123"
            assert job["min_salary"] == 140000

@pytest.mark.asyncio
async def test_rapidapi_mock_empty_and_error():
    """Verify handling of empty listings and rate limits."""
    service = RapidAPIService()
    with patch("httpx.AsyncClient.get") as mock_get:
        mock_resp = AsyncMock()
        mock_resp.status_code = 429
        mock_get.return_value = mock_resp

        with patch("config.settings.rapidapi_key", "test_key"):
            results = await service.search_jobs("AI Engineer")
            assert len(results) == 1
            assert "rate limit" in results[0]["error"].lower()

@pytest.mark.asyncio
async def test_career_agent_mock_gemini_tool_call():
    """Verify career agent dispatches Gemini tool call and formats output."""
    agent = CareerAgent()
    mock_gemini_tool_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "functionCall": {
                                "name": "analyze_skill_gap",
                                "args": {
                                    "current_skills": ["Python", "FastAPI"],
                                    "target_role": "AI Engineer"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    }

    mock_gemini_final_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "Based on the skill gap analysis, your readiness is 20%. You should master PyTorch and Transformers."
                        }
                    ]
                }
            }
        ]
    }

    with patch("config.settings.gemini_api_key", "mock_gemini_key"):
        with patch.object(
            agent,
            "max_tool_iterations",
            3
        ):
            with patch("services.gemini_service.gemini_service.generate_response_with_tools") as mock_gen:
                mock_gen.side_effect = [mock_gemini_tool_response, mock_gemini_final_response]

                request = ChatRequest(
                    message="Help me become an AI engineer.",
                    profile=UserProfile(skills=["Python", "FastAPI"], target_role="AI Engineer")
                )
                resp = await agent.process_chat(request)
                assert resp.success is True
                assert "analyze_skill_gap" in resp.tools_used
                assert "readiness is 20%" in resp.message
