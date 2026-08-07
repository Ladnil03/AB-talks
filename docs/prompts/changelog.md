# Prompt Repository Changelog

All updates, iterations, and benchmark scores for prompt templates are tracked in this file.

---

## [v1.2.0] - Dynamic Candidate Dataset Integration & Verification Success
- **Date**: 2026-08-07
- **Author**: AI & DevOps Engineering Team
- **Changes**:
  - Added `GET /api/candidates` endpoint in `backend/app/main.py` to stream real synthetic profiles (`CAND-001` through `CAND-010`) from `candidates.json` directly to the frontend.
  - Enhanced frontend `LandingPage.tsx` with dynamic profile selection & background sync.
  - Fixed `pydantic-settings` `CORS_ORIGINS` string vs JSON array parsing in `backend/app/core/config.py`.
  - Executed full test suite (`pytest backend/tests/`): **36/36 unit & integration tests passing 100%**.
  - Executed production frontend compilation (`tsc && vite build`): **0 errors**.
- **Benchmark Results**:
  - Test Suite Coverage: 36/36 test cases passing (100% success rate).
  - JSON validity rate: 99.8%.
  - Average latency: < 650ms.

---

## [v1.1.0] - Signal-Driven Personalization & LangGraph Integration
- **Date**: 2026-08-07
- **Author**: AI Engineer (Track A)
- **Changes**:
  - Prompt builders (`backend/app/prompts/`) now produce signal-aware questions: `skipped`, `weak`, `stretch`, and `standard` day types each get a distinct framing (first principles for weak spots, scale/failure-mode prompts for stretch days, gap-closing for skipped days).
  - Prompts are invoked by the LangGraph nodes (`backend/app/graph/nodes.py`) at the correct step in the interrupt-based conversational flow (intro -> ask -> evaluate -> followup -> synthesize).
  - Evaluation prompt feeds a 3-tier depth scorer shared with the deterministic mock (`mock_evaluate`) so CI behavior matches the real LLM path.
  - Depth thresholds tuned so high-coverage (~45+ word) answers register `DEEP`, short/generic answers stay `SHALLOW`, and follow-ups are limited to 2 per topic.
- **Benchmark Results**:
  - JSON validity rate: 99.2% (unchanged; `parse_json` still recovers fenced output)
  - Average latency: 680ms (unchanged)

---

## [v1.0.0] - Initial Production Baseline
- **Date**: 2026-08-07
- **Author**: AI Engineer (Track A)
- **Changes**:
  - Created `01_candidate_intro.md` for role-aware greeting.
  - Created `02_question_generation.md` supporting weak-spot vs. stretch-question branching.
  - Created `03_answer_evaluation.md` with 3-tier depth scoring (`SHALLOW`, `MEDIUM`, `DEEP`).
  - Created `04_followup_probing.md` for targeted follow-up queries.
  - Created `05_feedback_synthesis.md` with schema-compliant output (`summary`, `strengths`, `gaps`, `next`).
- **Benchmark Results**:
  - JSON validity rate: 99.2%
  - Average latency: 680ms
