# Track A — AI Engineer Workspace

**Owner:** AI / Prompt Engineer  
**Scope:** LangGraph workflow, prompt engineering, candidate day-planning logic, LLM client abstraction, answer evaluation, and feedback synthesis.

---

## 🎯 Primary Responsibilities

1. **Prompt Management**:
   - Author, version, and refine prompts in [`docs/prompts/templates/`](file:///d:/Project/AB_talks/docs/prompts/templates/).
   - Ensure all prompt revisions adhere to the guidelines in [`docs/prompts/prompt_engineering_guide.md`](file:///d:/Project/AB_talks/docs/prompts/prompt_engineering_guide.md).
2. **LangGraph State Flow**:
   - Manage node transition logic in [`backend/app/graph/nodes.py`](file:///d:/Project/AB_talks/backend/app/graph/nodes.py).
   - Maintain the shared integration function `run_turn()` in [`backend/app/graph/builder.py`](file:///d:/Project/AB_talks/backend/app/graph/builder.py).
3. **Personalization Engine**:
   - Implement scoring and anchor day selection in [`backend/app/data/day_planner.py`](file:///d:/Project/AB_talks/backend/app/data/day_planner.py).

---

## 🧪 Running Standalone Experiments

```bash
# Run standalone CLI graph test without spinning up FastAPI
python team/ai_engineer/experiments/test_graph_cli.py
```

---

## 🤝 Handoff Contract (Backend Engineer)

The AI track ships the conversational engine behind `POST /api/interview`. The
backend only needs these two public entry points:

- **`build_initial_state(session_id, candidate_id, candidate_name, day_plan)`** —
  factory for a fresh session state (in `backend/app/graph/state.py`).
- **`run_turn(state, incoming_message=None)`** — advances the interview one step
  and returns the mutated state. It drives the intro, questions, answer
  evaluation, follow-ups, and final feedback synthesis via LangGraph interrupts
  (in `backend/app/graph/builder.py`).

`InterviewState` and `run_turn()` are the frozen interface per
`docs/team_workflow.md`; any change requires a joint sync.

The graph reads real cohort data through the AI-owned loader
`backend/app/data/context.py` (`CohortContext`, exported as `ctx`) and never
depends on the backend `loader.py` schema. Day plans come from
`select_day_plan(candidate, curriculum)` in `backend/app/data/day_planner.py`.

**LLM behavior:** set `LLM_MODE=mock` for hermetic CI (default), or set a
`GROQ_API_KEY` / `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` for real generation
(`LLM_MODE=auto`). Tests always force mock mode (see `tests/conftest.py`).

### Backend sync checklist (`mypy app` — `app/main.py` only)

These are the Backend Engineer's integration points (AI track does not edit
`main.py`); all five fail type checking but pass at runtime:

1. `store.set(session_id, state)` — `InMemorySessionStore.set` expects
   `dict[str, Any]`; cast `state` to `InterviewState` (`from typing import cast`).
2. `InterviewResponse(reply=state["last_reply"])` — `last_reply` is
   `str | None`; the backend should fall back to `state["last_reply"] or ""`.
3. `run_turn(state)` — `state` is typed `dict[str, Any]` in `main.py`; cast to
   `InterviewState` before calling `run_turn` (or use `build_initial_state`).
4. Second `store.set(...)` after the turn — same cast as #1.
5. Second `InterviewResponse(reply=...)` — same fallback as #2.

All other `mypy` errors (including `app/graph`, `app/llm`, `app/prompts`,
`app/data`) are clean. Contract and unit tests pass in mock mode.

