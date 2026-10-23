import pytest
from fastapi.testclient import TestClient
from main import app
from config import settings

client = TestClient(app)

def test_health_check_status():
    """Verify that GET /health returns 200 with status ok and explicitly asserts no database."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "SkillBridge AI"
    assert data["database"] == "not_used"
    assert data["stateless"] is True
    assert "gemini_model" in data

def test_root_endpoint():
    """Verify that GET / returns welcome JSON metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["database"] == "not_used"
    assert "chat_endpoint" in data
