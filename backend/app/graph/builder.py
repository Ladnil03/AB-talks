"""Integration boundary between FastAPI backend and AI track.

The AI track owns everything inside ``run_turn``. The backend persists the
returned ``InterviewState`` per ``sessionId`` and passes it back on every turn.
A compiled LangGraph ``StateGraph`` (with a ``MemorySaver`` checkpointer keyed by
``thread_id == session_id``) is the single source of truth for the interview
flow; ``interrupt()`` pauses it after each question until the next HTTP request
resumes it with the candidate's message.
"""
from __future__ import annotations

import logging
from typing import Any, cast

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command

from app.graph.nodes import (
    node_ask_followup,
    node_ask_question,
    node_evaluate_answer,
    node_intro,
    node_synthesize_feedback,
)
from app.graph.state import InterviewState

logger = logging.getLogger(__name__)


def _route_after_evaluate(state: InterviewState) -> str:
    phase = state.get("phase", "AWAIT_ANSWER")
    if phase == "CLOSING":
        return "synthesize_feedback"
    if phase == "FOLLOWUP":
        return "ask_followup"
    return "ask_question"


def build_graph():
    graph = StateGraph(InterviewState)
    graph.add_node("intro", node_intro)
    graph.add_node("ask_question", node_ask_question)
    graph.add_node("evaluate_answer", node_evaluate_answer)
    graph.add_node("ask_followup", node_ask_followup)
    graph.add_node("synthesize_feedback", node_synthesize_feedback)

    graph.add_edge(START, "intro")
    graph.add_edge("intro", "ask_question")
    graph.add_edge("ask_question", "evaluate_answer")
    graph.add_conditional_edges(
        "evaluate_answer",
        _route_after_evaluate,
        {
            "ask_question": "ask_question",
            "ask_followup": "ask_followup",
            "synthesize_feedback": "synthesize_feedback",
        },
    )
    graph.add_edge("ask_followup", "evaluate_answer")
    graph.add_edge("synthesize_feedback", END)
    return graph.compile(checkpointer=MemorySaver())


compiled_graph = build_graph()


def _thread(state: InterviewState) -> dict[str, Any]:
    return {"configurable": {"thread_id": state.get("session_id") or "default"}}


def run_turn(state: InterviewState, incoming_message: str | None = None) -> InterviewState:
    """Backend calls this once per request. AI owns everything inside it."""
    phase = state.get("phase")
    if phase in ("CLOSING", "DONE"):
        return cast(InterviewState, dict(state))

    thread = _thread(state)
    try:
        if incoming_message is not None:
            compiled_graph.invoke(Command(resume=incoming_message), config=thread)
        elif phase == "INTRO":
            compiled_graph.invoke(state, config=thread)
        elif phase == "ASKING":
            compiled_graph.invoke(Command(resume=None), config=thread)
        else:
            return cast(InterviewState, dict(state))
    except Exception as exc:  # noqa: BLE001 - degrade gracefully on transient graph errors
        logger.exception("run_turn failed for session %s: %s", thread, exc)
        result: InterviewState = cast(InterviewState, dict(state))
        result["last_reply"] = "Sorry, let me rephrase. Could you tell me a bit more about that?"
        return result

    snapshot = compiled_graph.get_state(thread)
    result = cast(InterviewState, dict(snapshot.values))
    if snapshot.interrupts:
        result["last_reply"] = snapshot.interrupts[-1].value
    return result
