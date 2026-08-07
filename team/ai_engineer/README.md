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
