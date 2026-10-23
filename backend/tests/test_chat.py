import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chat_empty_message_validation():
    """Verify that an empty message raises 422 Unprocessable Entity."""
    response = client.post("/chat/chat", json={"message": "   "})
    assert response.status_code == 422

def test_chat_invalid_payload():
    """Verify that a malformed payload raises 422."""
    response = client.post("/chat/chat", json={})
    assert response.status_code == 422

def test_chat_career_transition_stateless():
    """Verify end-to-end chat flow for skill gap and career advice."""
    payload = {
        "message": "I know Python and FastAPI. Help me become an AI engineer.",
        "profile": {
            "education": "Software Engineering Student",
            "skills": ["Python", "FastAPI"],
            "experience_level": "Beginner",
            "target_role": "AI Engineer"
        },
        "conversation_history": []
    }
    response = client.post("/chat/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "message" in data
    assert len(data["message"]) > 50
    assert "tools_used" in data
    assert "model_used" in data
    assert "analyze_skill_gap" in data["tools_used"]
    assert "create_learning_roadmap" in data["tools_used"]

def test_chat_cv_upload_detection_and_job_search():
    """Verify CV upload extracts degree, skills, and finds jobs automatically."""
    payload = {
        "cv_text": "John Doe | BS Computer Science GCUF | Skills: Python, FastAPI, Docker, SQL | Experience: Backend Developer",
        "auto_search_jobs": True
    }
    response = client.post("/chat/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "analyze_cv" in data["tools_used"]
    assert "search_jobs" in data["tools_used"]
    assert "BS Computer Science" in data["message"] or "Bachelor" in data["message"] or "Degree" in data["message"]

def test_chat_query_ythondeveloper_fsd():
    """Verify natural query with typo and city alias like 'I am a ythondeveloper jobs in fsd'."""
    payload = {
        "message": "I am a ythondeveloper jobs in fsd"
    }
    response = client.post("/chat/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "search_jobs" in data["tools_used"]
