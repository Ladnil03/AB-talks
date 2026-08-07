from typing import Any, Literal, TypedDict


class InterviewState(TypedDict):
    session_id: str
    candidate_id: str
    candidate_name: str
    day_plan: list[int]
    current_day_index: int
    follow_ups_on_current_day: int
    questions_asked: int
    days_covered: set[int]
    transcript: list[dict[str, Any]]
    phase: Literal["INTRO", "ASKING", "AWAIT_ANSWER", "FOLLOWUP", "CLOSING", "DONE"]
    feedback: dict[str, Any] | None
    last_reply: str | None


def build_initial_state(
    session_id: str,
    candidate_id: str,
    candidate_name: str,
    day_plan: list[int],
) -> InterviewState:
    """Factory for a fresh interview session (additive; backend may use it)."""
    return {
        "session_id": session_id,
        "candidate_id": candidate_id,
        "candidate_name": candidate_name,
        "day_plan": list(day_plan),
        "current_day_index": 0,
        "follow_ups_on_current_day": 0,
        "questions_asked": 0,
        "days_covered": set(),
        "transcript": [],
        "phase": "INTRO",
        "feedback": None,
        "last_reply": None,
    }
