"""Standalone CLI harness to test LangGraph transitions without FastAPI.

Runs an entire interview against a real dataset candidate in deterministic
mock LLM mode (no API key required). Requires the backend venv:
    python team/ai_engineer/experiments/test_graph_cli.py
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../backend")))
os.environ.setdefault("LLM_MODE", "mock")

from app.data.context import ctx
from app.data.day_planner import select_day_plan
from app.graph.builder import run_turn
from app.graph.state import build_initial_state


def main():
    candidate = ctx.get_candidate("CAND-001") or ctx.get_candidate(ctx.candidate_ids()[0])
    member = candidate["member"]
    plan = select_day_plan(candidate, ctx.curriculum())
    print(f"=== Testing LangGraph Flow Standalone (candidate {member['id']}, plan {plan}) ===")

    state = build_initial_state("cli_test_001", member["id"], member["name"], plan)

    # Turn 1: Intro
    state = run_turn(state)
    print(f"\n[Turn 1] Phase: {state['phase']}")
    print(f"Reply: {state['last_reply']}")

    # Turn 2: Candidate greeting
    state = run_turn(state, incoming_message="Hi, I'm ready to discuss my project.")
    print(f"\n[Turn 2] Phase: {state['phase']}")
    print(f"Reply: {state['last_reply']}")

    # Turn 3: First substantive answer
    state = run_turn(
        state,
        incoming_message=(
            "I built the retrieval pipeline end-to-end: I embedded the documents, tuned chunk sizes, "
            "indexed vectors for fast search, and validated quality with real queries before shipping it."
        ),
    )
    print(f"\n[Turn 3] Phase: {state['phase']}")
    print(f"Reply: {state['last_reply']}")

    # Turn 4: Drive the interview to completion with substantive answers.
    guard = 0
    while state["phase"] != "DONE" and guard < 20:
        guard += 1
        state = run_turn(
            state,
            incoming_message=(
                "I chose the stack after benchmarking options, handled failure modes with retries and "
                "fallbacks, and validated the results with both automated checks and manual review."
            ),
        )
    print(f"\n[Final] Phase: {state['phase']}, questions asked: {state['questions_asked']}")
    print(f"Feedback summary: {state['feedback']['summary'] if state.get('feedback') else None}")
    print(f"Feedback: {state.get('feedback')}")


if __name__ == "__main__":
    main()
