# AI Interview Agent — Backend Service

FastAPI server orchestrating candidate personalization, session storage, and LangGraph-driven conversational interview execution.

---

## 🛠️ Tech Stack
- **Framework**: FastAPI (Python 3.11+)
- **State Machine**: LangGraph
- **Data Validation**: Pydantic v2
- **Testing**: Pytest & TestClient

---

## 🏃 Running Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run test suite
pytest tests/

# 3. Start development server
uvicorn app.main:app --reload --port 8000
```

---

## 📡 API Contract

### `POST /api/interview`

#### Initialization (First Turn)
```json
{
  "sessionId": "sess_abc123",
  "candidate": {
    "id": "cand_001",
    "name": "Sarah Chen",
    "track": "Senior Backend Engineer"
  }
}
```

#### Conversation Turn
```json
{
  "sessionId": "sess_abc123",
  "message": "We used PostgreSQL partitioned tables with connection pooling via PgBouncer."
}
```

#### Response
```json
{
  "reply": "How did you manage failover and transaction rollbacks during network partitions?",
  "done": false,
  "feedback": null
}
```
