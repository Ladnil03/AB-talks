"""Integration boundary between FastAPI backend and AI track.
AI Track owns everything inside run_turn.
"""
from typing import Optional
from app.graph.state import InterviewState
from app.graph.nodes import (
    node_intro,
    node_ask_question,
    node_evaluate_and_followup,
    node_feedback_synthesis,
)


def run_turn(state: InterviewState, incoming_message: Optional[str] = None) -> InterviewState:
    """Backend calls this once per request. AI owns everything inside it."""
    phase = state.get("phase", "INTRO")

    if phase == "INTRO":
        return node_intro(state)

    if phase == "ASKING":
        return node_ask_question(state)

    if phase in ("AWAIT_ANSWER", "FOLLOWUP"):
        if incoming_message:
            evaluated_state = node_evaluate_and_followup(state, incoming_message)
            if evaluated_state.get("phase") == "CLOSING":
                return node_feedback_synthesis(evaluated_state)
            return evaluated_state
        return state

    if phase == "CLOSING":
        return node_feedback_synthesis(state)

    return state
