"""Standalone CLI harness to test LangGraph transitions without FastAPI."""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../backend")))

from app.graph.builder import run_turn
from app.graph.state import InterviewState


def main():
    print("=== Testing LangGraph Flow Standalone ===")
    state: InterviewState = {
        "session_id": "cli_test_001",
        "candidate_id": "cand_001",
        "candidate_name": "Sarah Chen",
        "day_plan": [1, 2, 3, 4],
        "current_day_index": 0,
        "follow_ups_on_current_day": 0,
        "questions_asked": 0,
        "days_covered": set(),
        "transcript": [],
        "phase": "INTRO",
        "feedback": None,
        "last_reply": None,
    }

    # Turn 1: Intro
    state = run_turn(state)
    print(f"\n[Turn 1 Output] Phase: {state['phase']}")
    print(f"Reply: {state['last_reply']}")

    # Turn 2: Question
    state = run_turn(state)
    print(f"\n[Turn 2 Output] Phase: {state['phase']}")
    print(f"Reply: {state['last_reply']}")

    # Turn 3: Candidate answer
    state = run_turn(state, incoming_message="I designed a horizontally scalable microservice with Kafka.")
    print(f"\n[Turn 3 Output] Phase: {state['phase']}")
    print(f"Reply: {state['last_reply']}")


if __name__ == "__main__":
    main()
