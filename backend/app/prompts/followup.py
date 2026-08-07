"""Prompt builder for targeted follow-up probing (FOLLOWUP)."""
from __future__ import annotations

from typing import Any


def build_followup_prompt(context: dict[str, Any]) -> str:
    """Render the targeted follow-up probe prompt."""
    return (
        "You are a technical interviewer following up on a candidate's previous response.\n"
        f"The candidate gave a {context.get('depth') or 'MEDIUM'} answer.\n\n"
        "Original Question:\n"
        f"{context.get('question') or ''}\n\n"
        "Candidate's Answer:\n"
        f"{context.get('answer') or ''}\n\n"
        "Evaluator Reasoning:\n"
        f"{context.get('reasoning') or ''}\n\n"
        "Instructions:\n"
        "1. Acknowledge the candidate's point succinctly (e.g., \"Good point on X...\").\n"
        "2. Ask a targeted probe asking them to go deeper into the specific missing element identified in the "
        "reasoning.\n"
        "3. Keep the tone encouraging, curious, and collaborative.\n"
        "4. Output must be a single concise question (max 2 sentences).\n"
    )
