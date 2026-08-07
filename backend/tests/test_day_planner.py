"""Unit tests for the AI-track day-planner / personalization engine."""
from app.data.context import ctx
from app.data.day_planner import DEFAULT_ANCHOR_DAYS, select_day_plan


def _plan(candidate_id: str) -> list[int]:
    candidate = ctx.get_candidate(candidate_id)
    return select_day_plan(candidate, ctx.curriculum())


def _modules_of(plan: list[int]) -> set[int]:
    return {ctx.module_for_day(day) for day in plan if ctx.module_for_day(day) is not None}


def test_empty_candidate_falls_back_to_default_anchors():
    plan = select_day_plan(None, ctx.curriculum())
    assert plan == DEFAULT_ANCHOR_DAYS


def test_candidate_without_missions_falls_back():
    plan = select_day_plan({"member": {"id": "x"}}, ctx.curriculum())
    assert plan == DEFAULT_ANCHOR_DAYS


def test_plan_satisfies_minimum_requirements_for_strong_candidate():
    # CAND-003 passed every mission on the first try (high first-try rate).
    plan = _plan("CAND-003")
    assert len(plan) >= 4
    assert len(set(plan)) == len(plan)
    assert len(_modules_of(plan)) >= 4


def test_plan_spans_distinct_modules_for_average_candidate():
    # CAND-001: varied performance across many modules.
    plan = _plan("CAND-001")
    assert 4 <= len(plan) <= 6
    assert len(set(plan)) == len(plan)
    assert len(_modules_of(plan)) >= 4


def test_weak_spots_are_prioritized():
    # CAND-010 failed days 8, 10, 22 (attempts >= 3). They must be anchors.
    plan = _plan("CAND-010")
    for weak_day in (8, 10, 22):
        assert weak_day in plan


def test_skipped_days_are_prioritized_as_anchors():
    # CAND-001 skipped days 28 and 29; skipped missions score above stable ones.
    plan = _plan("CAND-001")
    assert any(day in plan for day in (28, 29))


def test_sparse_candidate_still_gets_a_plan():
    # CAND-011 completed very few missions; planner must not crash or loop.
    plan = _plan("CAND-011")
    assert plan
    assert len(set(plan)) == len(plan)
    assert len(plan) <= 6


def test_plan_prefers_completed_days_over_defaults_for_sparse_candidate():
    plan = select_day_plan(ctx.get_candidate("CAND-011"), None)
    assert plan
    available = {m.get("day") for m in ctx.get_candidate("CAND-011")["missions"]}
    assert set(plan).issubset(available)


def test_without_curriculum_returns_distinct_days():
    candidate = ctx.get_candidate("CAND-001")
    plan = select_day_plan(candidate, None)
    assert 4 <= len(set(plan)) <= 6


def test_candidate_with_few_missions_returns_what_is_available():
    fake = {
        "member": {"id": "fake", "name": "Fake"},
        "missions": [{"day": 7, "passed": True, "attempts": 1}],
        "signals": {"missionsFirstTry": 1, "missionsCompleted": 1},
    }
    plan = select_day_plan(fake, ctx.curriculum())
    assert plan == [7]
