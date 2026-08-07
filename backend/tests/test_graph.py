"""Integration tests for the compiled LangGraph interview flow via run_turn()."""
import uuid

from app.data.context import ctx
from app.data.day_planner import select_day_plan
from app.graph.builder import run_turn
from app.graph.state import build_initial_state

DETAILED_ANSWERS = [
    "We converted text chunks into vector embeddings with Sentence Transformers, stored them in ChromaDB "
    "with metadata for filtering, validated clustering with PCA, and ran semantic search to compare retrieval "
    "quality before selecting the final configuration.",
    "The retrieval engine routed between SQL for structured lookups and vector search for semantic matches, "
    "then merged and deduplicated results across sources.",
    "We built a grounded prompt that answered only from retrieved context and evaluated responses against a "
    "retrieval-only baseline.",
    "We created specialized agents for different domains and a router agent that delegated requests to the "
    "right specialist.",
    "We containerized the backend with Docker, configured health checks and env vars, and deployed to "
    "Kubernetes.",
    "We added structured logging, Prometheus metrics, and Grafana dashboards for observability.",
    "We exposed our chatbot tools through an MCP server and connected it to an MCP-compatible client.",
    "We persisted conversation history, implemented automatic summarization for long chats, and managed "
    "token limits while preserving important context.",
]


def _simulate(candidate_id: str, answers: list[str]) -> tuple[dict, list[str]]:
    candidate = ctx.get_candidate(candidate_id)
    assert candidate is not None, f"unknown candidate {candidate_id}"
    plan = select_day_plan(candidate, ctx.curriculum())
    session_id = f"test-{candidate_id}-{uuid.uuid4().hex[:8]}"
    name = (candidate.get("member") or {}).get("name", candidate_id)
    state = build_initial_state(session_id, candidate_id, name, plan)

    replies = [run_turn(state)["last_reply"]]
    guard = 0
    while state["phase"] not in ("CLOSING", "DONE") and guard < 60:
        state = run_turn(state, answers[guard % len(answers)])
        replies.append(state["last_reply"])
        guard += 1
    return state, replies


def _feedback_keys(state: dict) -> list[str]:
    return sorted(state.get("feedback", {}).keys())


def test_full_interview_meets_minimum_requirements():
    state, replies = _simulate("CAND-001", DETAILED_ANSWERS)
    assert state["phase"] == "DONE"
    assert state.get("questions_asked", 0) >= 8
    assert len(state.get("days_covered", set())) >= 4
    assert len(replies) >= 9
    assert state.get("feedback") is not None
    assert _feedback_keys(state) == ["gaps", "next", "strengths", "summary"]


def test_first_reply_is_greeting_and_conversational():
    state, replies = _simulate("CAND-001", DETAILED_ANSWERS)
    greeting = replies[0]
    assert greeting.startswith("Hello")
    assert "Sarah" in greeting


def test_followup_count_never_exceeds_two():
    short_answers = ["Not sure.", "I don't remember exactly."]
    state, _ = _simulate("CAND-010", short_answers)
    assert state["phase"] == "DONE"
    assert state.get("follow_ups_on_current_day", 0) <= 2
    assert state.get("feedback") is not None


def test_interview_terminates_for_sparse_candidate():
    state, _ = _simulate("CAND-011", DETAILED_ANSWERS)
    assert state["phase"] == "DONE"
    assert state.get("feedback") is not None


def test_transcript_contains_questions_and_answers():
    state, _ = _simulate("CAND-003", DETAILED_ANSWERS)
    roles = [entry.get("role") for entry in state["transcript"]]
    assert "assistant" in roles and "candidate" in roles
    assert len(state["transcript"]) >= 16


def test_handles_empty_answer_without_crashing():
    state, _ = _simulate("CAND-001", ["", "   "])
    assert state["phase"] == "DONE"
    assert state.get("feedback") is not None


def test_unknown_candidate_still_conducts_interview():
    state, _ = _simulate("CAND-001", DETAILED_ANSWERS)
    # run a fresh session against a profile id that does not exist in the dataset
    state = build_initial_state("test-unknown", "CAND-999", "Ghost", [1, 7, 12])
    state = run_turn(state)
    assert state["phase"] == "INTRO"
    assert state["last_reply"]
    # next turn resumes out of the intro interrupt into the first question
    state = run_turn(state, "hi")
    assert state["phase"] in ("ASKING", "AWAIT_ANSWER")
    assert state["last_reply"]


def test_repeated_calls_after_done_are_idempotent():
    state, _ = _simulate("CAND-001", DETAILED_ANSWERS)
    assert state["phase"] == "DONE"
    again = run_turn(state, "any message")
    assert again["phase"] == "DONE"
    assert again == state
