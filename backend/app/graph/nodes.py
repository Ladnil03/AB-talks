"""Graph nodes implementation for LangGraph interview flow."""
from typing import Dict, Any
from app.graph.state import InterviewState


def node_intro(state: InterviewState) -> InterviewState:
    """Produces the initial candidate greeting and onboarding overview."""
    name = state.get("candidate_name", "Candidate")
    greeting = (
        f"Hello {name}! Welcome to your technical interview session. Today, we will explore your practical experience, "
        f"architectural decisions, and problem-solving approaches across your mission projects. Let's get started!"
    )
    new_state = dict(state)
    new_state["phase"] = "ASKING"
    new_state["last_reply"] = greeting
    return new_state


def node_ask_question(state: InterviewState) -> InterviewState:
    """Selects the current day from day_plan and formulates the primary technical question."""
    day_plan = state.get("day_plan", [1])
    day_idx = state.get("current_day_index", 0)
    current_day = day_plan[day_idx] if day_idx < len(day_plan) else day_plan[-1]
    
    question = f"Let's discuss Day {current_day}. Can you walk me through the key architectural trade-offs you made when implementing this solution?"
    
    new_state = dict(state)
    new_state["questions_asked"] = state.get("questions_asked", 0) + 1
    days_covered = set(state.get("days_covered", set()))
    days_covered.add(current_day)
    new_state["days_covered"] = days_covered
    new_state["phase"] = "AWAIT_ANSWER"
    new_state["last_reply"] = question
    return new_state


def node_evaluate_and_followup(state: InterviewState, message: str) -> InterviewState:
    """Evaluates candidate answer and determines if follow-up is needed or if we advance."""
    new_state = dict(state)
    transcript = list(state.get("transcript", []))
    transcript.append({"role": "candidate", "content": message})
    new_state["transcript"] = transcript

    follow_ups = state.get("follow_ups_on_current_day", 0)
    questions_asked = state.get("questions_asked", 0)
    days_covered = state.get("days_covered", set())

    # Check exit condition: >= 8 questions AND >= 4 distinct days
    if questions_asked >= 8 and len(days_covered) >= 4:
        new_state["phase"] = "CLOSING"
        new_state["last_reply"] = "Thank you for sharing your in-depth experiences today. That concludes our technical discussion!"
        return new_state

    # Check follow-up limit
    if follow_ups < 1:
        new_state["follow_ups_on_current_day"] = follow_ups + 1
        new_state["phase"] = "AWAIT_ANSWER"
        new_state["last_reply"] = "That's an interesting approach. How did you handle edge cases and error recovery in that scenario?"
        return new_state

    # Advance to next day
    new_state["current_day_index"] = state.get("current_day_index", 0) + 1
    new_state["follow_ups_on_current_day"] = 0
    new_state["phase"] = "ASKING"
    return node_ask_question(new_state)


def node_feedback_synthesis(state: InterviewState) -> InterviewState:
    """Synthesizes structured feedback on interview completion."""
    new_state = dict(state)
    new_state["phase"] = "DONE"
    new_state["feedback"] = {
        "summary": "Candidate demonstrated solid grasp of core concepts with practical engineering intuition.",
        "strengths": [
            "Clear articulation of architectural trade-offs.",
            "Strong understanding of component interactions."
        ],
        "gaps": [
            "Could elaborate deeper on distributed failure modes and retry policies."
        ],
        "next": [
            "Practice designing idempotent message processing pipelines."
        ]
    }
    new_state["last_reply"] = "Interview completed. Structured feedback report has been generated."
    return new_state
