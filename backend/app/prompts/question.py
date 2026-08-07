"""Prompt builder for open-ended, curriculum-grounded question generation (ASKING)."""
from __future__ import annotations

from typing import Any

_FRAMING = {
    "skipped": (
        "The candidate skipped this mission during the cohort. Acknowledge the skip and ask what they do "
        "know about the topic, plus what it would take to close the gap. Do not assume hands-on experience."
    ),
    "weak": (
        "The candidate historically struggled on this topic (failed or repeated attempts). Focus on "
        "foundational debugging, architectural recovery, and making the underlying concept concrete."
    ),
    "stretch": (
        "The candidate historically excelled (passed on the first try with a high first-try rate). Provide a "
        "challenging scale or edge-case trade-off scenario."
    ),
    "standard": "Focus on practical architecture and the engineering decisions the candidate actually made.",
}


def build_question_prompt(context: dict[str, Any]) -> str:
    """Render the technical question prompt from structured context."""
    objectives = "; ".join(context.get("objectives") or [])
    tools = ", ".join(context.get("tools") or [])
    framing = _FRAMING.get(context.get("signal") or "standard", _FRAMING["standard"])
    return (
        "You are an expert technical interviewer assessing a candidate on specific curriculum objectives. "
        "You must formulate an open-ended, scenario-based technical question.\n\n"
        "Curriculum Context for Current Day:\n"
        f"- Day Number: {context.get('day_no')}\n"
        f"- Module: {context.get('module') or 'N/A'}\n"
        f"- Core Objectives: {objectives}\n"
        f"- Tools & Libraries: {tools}\n\n"
        f"Candidate Signal: {framing}\n\n"
        "Question Framing Guidelines:\n"
        "1. DO NOT ask quiz/trivia definitions (\"What is X?\"). Instead, formulate a practical "
        "engineering scenario (\"How would you handle X when Y occurs?\").\n"
        "2. Ground the question ONLY in the objectives and tools listed above. Never invent libraries or "
        "concepts outside the curriculum.\n"
        "3. Keep the question crisp, clear, and direct (max 3 sentences).\n"
        "4. Ask ONE question. Output ONLY the question text with no preamble.\n"
    )
