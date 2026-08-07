# AI Interview Agent — 3-Person Implementation Plan

**Team split:** AI/Prompt Engineer · Backend Engineer · DevOps Engineer

This splits the single-engineer plan into three ownership tracks with clear interfaces between them, so all three can work in parallel from day one instead of blocking on each other.

---

## 1. Ownership Map

| Track | Owner | Owns |
|---|---|---|
| **AI** | AI Engineer | LangGraph flow, prompts, day-planner/personalization logic, LLM client, answer evaluation, feedback synthesis |
| **Backend** | Backend Engineer | FastAPI app, API contract, request/response schemas, session store, data loaders, error handling |
| **DevOps** | DevOps Engineer | Environment setup, containerization, config/secrets, CI, deployment, logging/observability, load testing |

**Core interface contract (agree this first, before anyone writes code):**

```python
# app/graph/state.py — shared source of truth, no one edits this alone
class InterviewState(TypedDict):
    session_id: str
    candidate_id: str
    day_plan: list[int]
    current_day_index: int
    follow_ups_on_current_day: int
    questions_asked: int
    days_covered: set[int]
    transcript: list[dict]
    phase: Literal["INTRO", "ASKING", "AWAIT_ANSWER", "FOLLOWUP", "CLOSING", "DONE"]
    feedback: dict | None
```

```python
# app/graph/builder.py — the seam between Backend and AI
def run_turn(state: InterviewState, incoming_message: str | None) -> InterviewState:
    """Backend calls this once per request. AI owns everything inside it."""
```

Backend never touches prompt content or graph node logic. AI never touches FastAPI routing, session persistence, or infra. Both meet only at `InterviewState` and `run_turn()`.

---

## 2. Track A — AI Engineer

**Owns:** `app/graph/`, `app/prompts/`, `app/data/day_planner.py`, `app/llm/client.py`

### Responsibilities
1. **Day-planner / personalization engine** (`day_planner.py`)
   - Score candidate's mission days: `passed:false` and `attempts>=4` → high priority (weak spot); `skipped:true` → medium priority, different question style; `attempts==1` + high `missionsFirstTry` → stretch question
   - Greedily select 5–6 anchor days spanning ≥4 distinct curriculum **modules**
   - Fallback logic for sparse candidate histories (few completed missions)
2. **LangGraph state machine** (`graph/builder.py`, `graph/nodes.py`)
   - Nodes: `load_candidate → INTRO → ASK → EVALUATE → FOLLOW_UP/advance → CLOSING → FEEDBACK`
   - Enforce hard cap: `follow_ups_on_current_day <= 2`
   - Enforce exit condition: `questions_asked >= 8 AND len(days_covered) >= 4`
3. **Prompt design** (`prompts/question.py`, `prompts/evaluate.py`, `prompts/feedback.py`)
   - Question generator: grounded in current day's objectives/tools only, role/experience-aware framing, open-ended interview style (not quiz-style)
   - Answer evaluator: structured JSON output `{depth, should_follow_up, reasoning}`
   - Feedback synthesizer: structured JSON matching spec exactly (`summary`, `strengths[]`, `gaps[]`, `next[]`), grounded only in what the candidate actually said
4. **LLM client abstraction** (`llm/client.py`)
   - Single `generate(prompt, schema=None) -> str | dict` interface so the model (Claude/Groq) is swappable without touching graph logic
   - JSON-mode/structured output handling with one retry on parse failure

### Deliverables
- [ ] `day_planner.py` with unit tests against 3–4 sample candidates from `candidates.json`
- [ ] Compiled LangGraph with all nodes, runnable standalone via a CLI script (no FastAPI needed to test it)
- [ ] All three prompts, iterated against real curriculum days until output quality is consistent
- [ ] `run_turn(state, message) -> state` function handed off to Backend as the integration point

### Milestones
| Day | Milestone |
|---|---|
| 1 | Day-planner logic complete + unit tested standalone |
| 2 | LangGraph skeleton with mocked LLM calls (hardcoded strings), full state transitions verified |
| 3 | Real question-generation + evaluation prompts wired in, tested via CLI harness |
| 4 | Feedback synthesis + schema validation, hand off `run_turn()` to Backend |
| 5 | Prompt tuning based on Backend/DevOps integration feedback, edge cases (off-topic answers, empty answers) |

---

## 3. Track B — Backend Engineer

**Owns:** `app/main.py`, `app/models.py`, `app/session_store.py`, `app/data/loader.py`

### Responsibilities
1. **API contract** (`main.py`, `models.py`)
   - `POST /api/interview` exactly matching technical-spec.md: start / turn / end shapes
   - Pydantic models for request (`sessionId`, `candidate` | `message`) and response (`reply`, `done`, `feedback?`)
   - Branch: no existing session + `candidate` present → init; existing session + `message` present → turn
2. **Session store** (`session_store.py`)
   - In-memory `{sessionId: InterviewState}` for the hackathon scope (spec explicitly excludes persistent accounts)
   - Simple interface (`get`, `set`, `exists`) so DevOps can swap in Redis/SQLite later without touching route logic
3. **Data loaders** (`data/loader.py`)
   - Parse `curriculum.json` → `days_by_number`, `module_by_day` indexes
   - Parse `candidates.json` → `candidates_by_id` index
   - Load once at app startup (FastAPI lifespan hook), expose as app state
4. **Error handling**
   - Unknown `sessionId` on a turn request → clear 4xx
   - Missing `candidate` on first request → clear 4xx
   - Unknown `candidateId` → clear 4xx
   - Malformed/empty `message` → don't crash the graph, pass through with a defensive default

### Deliverables
- [ ] FastAPI app with route wired to a **mocked** `run_turn()` (hardcoded response) — contract fully testable before AI track finishes
- [ ] Data loaders with startup validation (fail fast if JSON files are malformed/missing)
- [ ] Session store with clean swap-out interface
- [ ] Full contract test suite asserting response shapes match technical-spec.md field-for-field
- [ ] Integration point: swap mocked `run_turn()` for AI track's real implementation

### Milestones
| Day | Milestone |
|---|---|
| 1 | Data loaders + startup validation working; Pydantic request/response models locked and shared with AI/DevOps |
| 2 | FastAPI route complete against **mocked** `run_turn()`, all contract tests passing |
| 3 | Session store finalized, error-handling edge cases covered |
| 4 | Integrate AI track's real `run_turn()`, re-run full contract test suite |
| 5 | Bug-fix pass with AI engineer on integration issues (state mutation bugs, schema drift) |

---

## 4. Track C — DevOps Engineer

**Owns:** environment, containerization, secrets, CI, deployment, observability

### Responsibilities
1. **Environment & repo setup** (Day 0, blocks everyone)
   - Repo scaffold matching the agreed project structure
   - `requirements.txt` / `pyproject.toml`, Python version pin
   - `.env.example` (`ANTHROPIC_API_KEY` or `GROQ_API_KEY`, no secrets committed)
   - Pre-commit hooks (lint/format) so all three tracks stay consistent
2. **Containerization**
   - `Dockerfile` for the FastAPI app
   - `docker-compose.yml` if a local Redis/SQLite is added later
   - Ensure container starts cleanly with data files mounted/baked in
3. **CI**
   - GitHub Actions: run Backend's contract tests + AI's unit tests on every push
   - Fail the build on schema mismatches or lint errors
4. **Deployment**
   - Deploy to a simple host (Railway/Render/Fly.io) for the demo
   - Environment variable configuration for the LLM API key in the deployed environment
   - Health-check endpoint (`GET /health`) for uptime checks during judging
5. **Observability**
   - Structured logging for each graph transition (session_id, phase, day, timestamp) — critical for debugging "why did it ask that" during a live demo
   - Basic request logging/timing on the FastAPI route
   - Optional: simple dashboard or log-tail script for demo day
6. **Load/smoke testing**
   - Script that drives a full 8+ question interview against the deployed endpoint end-to-end
   - Concurrent session test (multiple `sessionId`s in parallel) to catch session-store race conditions

### Deliverables
- [ ] Repo scaffold + `.env.example` + lint config ready before Day 1 for the other two tracks
- [ ] `Dockerfile` building and running locally
- [ ] CI pipeline running both test suites on push
- [ ] Deployed instance reachable via public URL, `/health` green
- [ ] Structured logs visible per session for debugging
- [ ] End-to-end smoke-test script run against the deployed instance

### Milestones
| Day | Milestone |
|---|---|
| 0 | Repo scaffold, `.env.example`, lint/pre-commit config ready — unblocks AI and Backend |
| 1–2 | Dockerfile working locally against Backend's mocked endpoint |
| 3 | CI pipeline live, running both test suites automatically |
| 4 | Deployed to hosting provider, `/health` check passing, logging wired in |
| 5 | Full smoke test against deployed real (non-mocked) endpoint, concurrent-session test |

---

## 5. Integration Timeline (all three tracks)

| Day | AI | Backend | DevOps |
|---|---|---|---|
| 0 | Review curriculum/candidate data | Review spec, lock Pydantic models | Repo scaffold, env setup |
| 1 | Day-planner + unit tests | Data loaders + startup validation | Dockerfile against mock |
| 2 | LangGraph skeleton, mocked LLM | Route + session store vs. mocked `run_turn()` | CI pipeline setup |
| 3 | Real prompts wired in, CLI-tested | Contract tests, error handling | Deploy to hosting, `/health` |
| 4 | **Hand off `run_turn()`** | **Integrate real `run_turn()`** | Logging/observability wired in |
| 5 | Prompt tuning from integration feedback | Bug-fix pass on integration issues | End-to-end + concurrent smoke tests |
| 6 | Buffer / demo polish | Buffer / demo polish | Buffer / demo polish |

**Key integration point is Day 4** — everything before that, all three tracks work against mocks/stubs of each other's interfaces, so nobody is blocked waiting on someone else's unfinished work.

---

## 6. Shared Definition of Done

- [ ] `POST /api/interview` matches technical-spec.md exactly (verified by Backend's contract tests)
- [ ] ≥8 questions across ≥4 distinct curriculum days, verified against multiple candidate profiles (verified by AI's day-planner tests)
- [ ] Follow-up questions demonstrably respond to shallow answers (manual + scripted check)
- [ ] Feedback object schema-valid on every completed interview (Backend + AI joint test)
- [ ] Deployed, publicly reachable, `/health` green (DevOps)
- [ ] Structured logs available to explain any question asked during judging Q&A (DevOps)
