# System Architecture & Technical Overview

## 1. High-Level Flow

```
[Candidate / Web Client]
        │  POST /api/interview { sessionId, candidate | message }
        ▼
[FastAPI Router (app/main.py)]
        │  Load / Validate Session
        ▼
[Session Store (In-Memory / Redis)]
        │  Retrieve InterviewState
        ▼
[LangGraph State Machine (run_turn)]
        ├─ Day Planner (Anchor selection)
        ├─ Question Generator (LLM)
        ├─ Answer Evaluator (LLM)
        ├─ Follow-up Prober (LLM)
        └─ Feedback Synthesizer (LLM)
        │
        ▼
[InterviewResponse { reply, done, feedback? }]
        │
        ▼
[Candidate / Web Client UI]
```

## 2. LangGraph State Machine Phases

1. `INTRO`: Welcomes candidate, introduces the session format.
2. `ASKING`: Formulates open-ended question for current day.
3. `AWAIT_ANSWER`: Waiting for user response.
4. `FOLLOWUP`: Evaluates answer; if shallow and follow-up count < 2, probes further.
5. `CLOSING`: Concludes interview after reaching ≥8 questions across ≥4 days.
6. `DONE`: Emits final structured feedback payload.

---

## 3. Engineering Tracks & Architectural Ownership

- **Frontend & DevOps Engineer (Lead)**:
  - **Frontend Client (`frontend/`)**: React 18 + TypeScript SPA, interview state orchestration, responsive dark-mode design system, live transcript feed, and structured feedback card renderers.
  - **Infrastructure & DevOps (`team/devops_engineer/`, `.github/`)**: Docker container multi-stage builds, Docker Compose service orchestration, GitHub Actions CI testing pipeline, deployment runbooks, and `/health` observability probes.
- **AI Engineer (Track A)**: LangGraph state transitions, day planner scoring algorithms, LLM abstraction, prompt engineering, and feedback synthesis.
- **Backend Engineer (Track B)**: FastAPI routes (`POST /api/interview`), Pydantic v2 validation contracts, session store adapters, dataset loaders, and contract test suites.
