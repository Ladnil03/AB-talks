"""Prompt builder for targeted follow-up probing (FOLLOWUP)."""
from __future__ import annotations

from typing import Any


def build_followup_prompt(context: dict[str, Any]) -> str:
    """Render the targeted follow-up probe prompt."""
    follow_up_count = context.get("follow_up_count", 0)
    return (
        "You are a technical interviewer following up on a candidate's previous response.\n"
        f"Follow-up Probe Number: {follow_up_count + 1} of 2 for current topic.\n"
        f"Evaluated Answer Depth: {context.get('depth') or 'MEDIUM'}\n\n"
        "Original Question:\n"
        f"{context.get('question') or ''}\n\n"
        "Candidate's Latest Answer:\n"
        f"{context.get('answer') or ''}\n\n"
        "Evaluator Reasoning:\n"
        f"{context.get('reasoning') or ''}\n\n"
        "Instructions:\n"
        "1. NEVER repeat the exact wording of a previous question or follow-up.\n"
        "2. If the candidate explicitly refuses to answer ('nah', 'idk', 'no', 'skip', 'pass'):\n"
        "   - Politely acknowledge their hesitation and simplify the question to ask about basic tools or high-level concepts.\n"
        "3. If the answer is extremely brief or single-letter gibberish ('a', 'asdf'):\n"
        "   - Ask them to elaborate with at least one concrete engineering detail or design choice.\n"
        "4. If the answer is partial or shallow:\n"
        "   - Probe deeper into the specific missing element identified in the evaluator reasoning.\n"
        "5. Keep the tone encouraging, curious, and professional (max 2 sentences).\n"
    )
