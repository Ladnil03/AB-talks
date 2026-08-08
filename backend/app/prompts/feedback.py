"""Prompt builder for structured feedback synthesis (CLOSING / DONE)."""
from __future__ import annotations

import json
from typing import Any


def build_feedback_prompt(context: dict[str, Any]) -> str:
    """Render the feedback-synthesis prompt embedding the full transcript."""
    transcript: list[dict[str, Any]] = context.get("transcript") or []
    days: list[dict[str, Any]] = context.get("days") or []
    transcript_json = json.dumps(transcript, ensure_ascii=False, default=str)
    details = "\n".join(f"- Day {d.get('day')}: {d.get('title')}" for d in days) or "(none)"
    return (
        "You are a principal technical assessor synthesizing final interview performance feedback. You must "
        "base your feedback SOLELY on the interview transcript and evidence demonstrated during the session.\n\n"
        "Interview Transcript (JSON):\n"
        f"{transcript_json}\n\n"
        "Days Covered:\n"
        f"{details}\n\n"
        "Instructions:\n"
        "1. Ground every comment strictly in concrete answers the candidate gave. Do not hallucinate skills or strengths not demonstrated.\n"
        "2. Provide an honest 2-3 sentence executive summary of candidate performance.\n"
        "3. List 1-4 concrete strengths with specific examples from their answers. If candidate provided brief, single-letter, or non-technical responses, explicitly state: 'No major technical strengths demonstrated; candidate responses lacked architectural mechanisms.'\n"
        "4. List 1-4 identified technical gaps where answers lacked depth or were missing.\n"
        "5. Provide actionable next steps / recommendations for skill mastery.\n"
        "6. Return ONLY a valid JSON object with exactly these keys:\n"
        '{"summary": "string", "strengths": ["string"], "gaps": ["string"], "next": ["string"]}\n'
    )
