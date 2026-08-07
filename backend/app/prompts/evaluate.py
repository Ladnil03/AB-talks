"""Prompt builder for answer evaluation & depth scoring (EVALUATE)."""
from __future__ import annotations

from typing import Any


def build_evaluation_prompt(context: dict[str, Any]) -> str:
    """Render the answer-evaluation prompt with a strict JSON output contract."""
    objectives = "; ".join(context.get("objectives") or [])
    return (
        "You are an expert technical evaluator. Analyze the candidate's response to the technical question "
        "asked.\n\n"
        "Question Asked:\n"
        f"{context.get('question') or ''}\n\n"
        "Day Objectives & Core Concepts:\n"
        f"{objectives}\n\n"
        "Candidate's Answer:\n"
        f"{context.get('answer') or '(empty)'}\n\n"
        "Current Follow-up Count on this Day: "
        f"{context.get('follow_up_count', 0)} (Hard max is 2)\n\n"
        "Evaluation Criteria:\n"
        '- DEPTH:\n'
        '  - "SHALLOW": High-level keywords only, lacks concrete mechanism or trade-offs.\n'
        '  - "MEDIUM": Explains the concept and basic implementation, but misses edge cases or failure modes.\n'
        '  - "DEEP": Comprehensive explanation including architecture, edge cases, trade-offs, and practical '
        "considerations.\n"
        "- SHOULD_FOLLOW_UP:\n"
        '  - True if DEPTH is "SHALLOW" or "MEDIUM" AND follow_up_count < 2.\n'
        '  - False if DEPTH is "DEEP" OR follow_up_count >= 2.\n\n'
        "Return ONLY a valid JSON object with exactly these keys:\n"
        '{"depth": "SHALLOW" | "MEDIUM" | "DEEP", "should_follow_up": true | false, '
        '"reasoning": "concise 1-2 sentence justification"}\n'
    )
