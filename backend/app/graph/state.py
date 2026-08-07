from typing import TypedDict, Literal, List, Dict, Any, Optional, Set


class InterviewState(TypedDict):
    session_id: str
    candidate_id: str
    candidate_name: str
    day_plan: List[int]
    current_day_index: int
    follow_ups_on_current_day: int
    questions_asked: int
    days_covered: Set[int]
    transcript: List[Dict[str, Any]]
    phase: Literal["INTRO", "ASKING", "AWAIT_ANSWER", "FOLLOWUP", "CLOSING", "DONE"]
    feedback: Optional[Dict[str, Any]]
    last_reply: Optional[str]
