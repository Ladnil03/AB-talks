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
