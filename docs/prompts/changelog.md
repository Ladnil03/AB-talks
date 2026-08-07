# Prompt Repository Changelog

All updates, iterations, and benchmark scores for prompt templates are tracked in this file.

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
