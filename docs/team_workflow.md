# Team Engineering Workflow & Collaboration Agreement

## 1. Branching Strategy
All three team members work on dedicated feature branches branched off `main`:
- **AI Engineer**: `feat/ai-day-planner`, `feat/ai-langgraph`, `feat/ai-prompts`
- **Backend Engineer**: `feat/be-fastapi-contract`, `feat/be-session-store`, `feat/be-loaders`
- **DevOps Engineer**: `feat/devops-docker`, `feat/devops-ci`, `feat/devops-observability`

---

## 2. Pull Request & Review Rules
1. **No direct commits to `main`**.
2. Every PR requires approval from at least one other team member.
3. CI tests (contract tests and unit tests) must pass with green status before merging.

---

## 3. Interface Freeze Policy
The shared source of truth is `backend/app/graph/state.py` (`InterviewState`) and `run_turn()`.
Any changes to `InterviewState` or API schemas require an explicit joint sync between the AI Engineer and the Backend Engineer.
