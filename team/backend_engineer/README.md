# Track B — Backend Engineer Workspace

**Owner:** Backend Engineer  
**Scope:** FastAPI routing, API contract integrity, Pydantic models, session store concurrency, data loaders, and error handling.

---

## 🎯 Primary Responsibilities

1. **API Endpoints**:
   - Maintain [`backend/app/main.py`](file:///d:/Project/AB_talks/backend/app/main.py) and ensure `POST /api/interview` matches the technical specification.
2. **Session Store**:
   - Maintain the abstract session manager in [`backend/app/session/session_store.py`](file:///d:/Project/AB_talks/backend/app/session/session_store.py).
3. **Data Loading & Validation**:
   - Ensure dataset loaders fail fast on corrupted or missing JSON in [`backend/app/data/loader.py`](file:///d:/Project/AB_talks/backend/app/data/loader.py).

---

## 🧪 Testing Tools

```bash
# Run contract verification tests
pytest backend/tests/test_contract.py

# Run simulated end-to-end smoke test against the server
python team/backend_engineer/load_testing/smoke_test.py
```
