"""Contract tests validating request and response schemas for FastAPI endpoints."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_new_session_initialization():
    payload = {
        "sessionId": "test-session-123",
        "candidate": {
            "id": "cand_001",
            "name": "Sarah Chen",
            "track": "Backend Engineer",
            "background": "5 years Python"
        }
    }
    response = client.post("/api/interview", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["done"] is False
    assert data["feedback"] is None


def test_interview_turn():
    # 1. Init session
    init_payload = {
        "sessionId": "test-session-turn",
        "candidate": {
            "id": "cand_001",
            "name": "Sarah Chen"
        }
    }
    client.post("/api/interview", json=init_payload)

    # 2. Candidate turn
    turn_payload = {
        "sessionId": "test-session-turn",
        "message": "We utilized an event-driven architecture with Kafka topics and idempotency keys stored in Redis."
    }
    response = client.post("/api/interview", json=turn_payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert isinstance(data["done"], bool)
