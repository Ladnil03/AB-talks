"""LangGraph nodes implementing the conversational interview flow.

The graph pauses at every question with ``interrupt()``; the resumed value is the
candidate's message. Node returns are applied after the resume, so state stays
consistent across HTTP turns driven through ``run_turn()``.
"""
from __future__ import annotations

from typing import Any

from langgraph.types import interrupt

from app.data.context import ctx
from app.graph.state import InterviewState
from app.llm.client import LLMClient, get_llm_client, mock_evaluate, mock_feedback
from app.prompts.evaluate import build_evaluation_prompt
from app.prompts.feedback import build_feedback_prompt
from app.prompts.followup import build_followup_prompt
from app.prompts.intro import build_intro_prompt
from app.prompts.question import build_question_prompt

MAX_FOLLOWUPS = 2
MIN_PRIMARY_QUESTIONS = 8
MAX_TOTAL_QUESTIONS = 12

EVALUATE_SCHEMA: dict[str, Any] = {
    "depth": "SHALLOW|MEDIUM|DEEP",
    "should_follow_up": bool,
    "reasoning": "str",
}
FEEDBACK_SCHEMA: dict[str, Any] = {
    "summary": "str",
    "strengths": ["str"],
    "gaps": ["str"],
    "next": ["str"],
}


def _client() -> LLMClient:
    return get_llm_client()


def _current_day(state: InterviewState) -> int:
    plan = state.get("day_plan") or []
    if not plan:
        return 1
    index = state.get("current_day_index", 0)
    return plan[index % len(plan)]


def _day_stats(state: InterviewState, day_no: int) -> dict[str, Any]:
    profile: dict[str, Any] = ctx.get_candidate(state.get("candidate_id", "")) or {}
    missions: list[dict[str, Any]] = profile.get("missions", []) or []
    mission = next((m for m in missions if m.get("day") == day_no), {})
    signals = profile.get("signals") or {}
    return {
        "passed": mission.get("passed"),
        "attempts": mission.get("attempts", 0),
        "skipped": mission.get("skipped", False),
        "first_try": signals.get("missionsFirstTry", 0),
        "completed": signals.get("missionsCompleted", 0),
    }


def _question_signal(stats: dict[str, Any]) -> str:
    if stats.get("skipped"):
        return "skipped"
    if stats.get("passed") is False or stats.get("attempts", 0) >= 4:
        return "weak"
    if (
        stats.get("passed") is True
        and stats.get("attempts") == 1
        and stats.get("first_try", 0) >= max(20, 0.6 * stats.get("completed", 0))
    ):
        return "stretch"
    return "standard"


def _day_context(state: InterviewState, day_no: int) -> dict[str, Any]:
    day = ctx.get_day(day_no) or {}
    stats = _day_stats(state, day_no)
    return {
        "day_no": day_no,
        "title": day.get("title", f"Day {day_no}"),
        "module": day.get("module", ""),
        "objectives": day.get("objectives", []),
        "tools": day.get("tools", []),
        "signal": _question_signal(stats),
        "passed": stats.get("passed"),
        "attempts": stats.get("attempts"),
        "skipped": stats.get("skipped"),
    }


def node_intro(state: InterviewState) -> dict[str, Any]:
    """Greet the candidate, frame the interview, then pause for the first turn."""
    profile = ctx.get_candidate(state.get("candidate_id", "")) or {}
    member = profile.get("member", {})
    day_plan = state.get("day_plan", [])
    topics = [ctx.day_title(d) for d in day_plan if ctx.day_title(d)]
    context = {
        "name": state.get("candidate_name") or member.get("name", "there"),
        "role": member.get("jobRole", ""),
        "background": (
            f"{member.get('yearsExperience', 0)} years, {member.get('education', '')}".strip(", ")
        ),
        "topics": topics,
    }
    greeting = _client().generate(build_intro_prompt(context), kind="intro", context=context)
    greeting = greeting or f"Hello {context['name']}! Let's begin your interview."

    transcript = list(state.get("transcript", []))
    transcript.append({"role": "assistant", "content": greeting, "day": None})
    interrupt(greeting)
    return {"phase": "ASKING", "transcript": transcript, "last_reply": greeting}


def node_ask_question(state: InterviewState) -> dict[str, Any]:
    """Ask the primary question for the current anchor day, then wait for an answer."""
    day_no = _current_day(state)
    context = _day_context(state, day_no)
    question = _client().generate(build_question_prompt(context), kind="question", context=context)
    question = question or f"Tell me about Day {day_no}: {context['title']}."

    transcript = list(state.get("transcript", []))
    transcript.append({"role": "assistant", "content": question, "day": day_no})
    answer = interrupt(question)
    answer = (answer or "").strip()
    transcript.append({"role": "candidate", "content": answer, "day": day_no})

    days_covered = set(state.get("days_covered", set()))
    days_covered.add(day_no)
    return {
        "phase": "AWAIT_ANSWER",
        "last_reply": question,
        "questions_asked": state.get("questions_asked", 0) + 1,
        "days_covered": days_covered,
        "transcript": transcript,
    }


def _find_question(transcript: list[dict[str, Any]], day_no: int | None) -> str:
    for entry in reversed(transcript):
        if entry.get("role") == "assistant" and entry.get("day") == day_no and entry.get("content"):
            return entry["content"]
    return ""


def node_evaluate_answer(state: InterviewState) -> dict[str, Any]:
    """Score the latest answer and decide follow-up, advance, or close."""
    transcript = list(state.get("transcript", []))
    if not transcript:
        return {"phase": "CLOSING", "transcript": transcript}

    last = transcript[-1]
    day_no = last.get("day")
    question = _find_question(transcript, day_no)
    answer = last.get("content", "")
    day = ctx.get_day(day_no) if day_no is not None else None

    context = {
        "question": question,
        "answer": answer,
        "objectives": (day or {}).get("objectives", []),
        "follow_up_count": state.get("follow_ups_on_current_day", 0),
    }
    eval_result = _client().generate(
        build_evaluation_prompt(context),
        schema=EVALUATE_SCHEMA,
        kind="evaluate",
        context=context,
    )
    if not isinstance(eval_result, dict) or eval_result.get("depth") not in ("SHALLOW", "MEDIUM", "DEEP"):
        eval_result = mock_evaluate(context)
    if not isinstance(eval_result.get("should_follow_up"), bool):
        eval_result["should_follow_up"] = eval_result.get("depth") in ("SHALLOW", "MEDIUM")
    last["eval"] = eval_result

    questions_asked = state.get("questions_asked", 0)
    day_plan_len = max(1, len(state.get("day_plan") or []))
    min_days_required = min(4, day_plan_len)
    days_covered = len(state.get("days_covered", set()))
    exit_condition = (questions_asked >= MIN_PRIMARY_QUESTIONS and days_covered >= min_days_required) or (
        questions_asked >= MAX_TOTAL_QUESTIONS
    )
    if exit_condition:
        return {"phase": "CLOSING", "transcript": transcript}

    follow_ups = state.get("follow_ups_on_current_day", 0)
    if eval_result.get("should_follow_up") and follow_ups < MAX_FOLLOWUPS:
        return {"phase": "FOLLOWUP", "transcript": transcript}

    return {
        "phase": "ASKING",
        "transcript": transcript,
        "current_day_index": state.get("current_day_index", 0) + 1,
        "follow_ups_on_current_day": 0,
    }


def node_ask_followup(state: InterviewState) -> dict[str, Any]:
    """Probe deeper into a shallow/medium answer, then wait for the reply."""
    transcript = list(state.get("transcript", []))
    last = transcript[-1]
    day_no = last.get("day")
    eval_result = last.get("eval") or {}
    question = _find_question(transcript, day_no)
    day = ctx.get_day(day_no) if day_no is not None else None

    context = {
        "question": question,
        "answer": last.get("content", ""),
        "depth": eval_result.get("depth", "MEDIUM"),
        "reasoning": eval_result.get("reasoning", ""),
        "objectives": (day or {}).get("objectives", []),
        "day_no": day_no,
        "title": (day or {}).get("title", f"Day {day_no}"),
    }
    followup = _client().generate(build_followup_prompt(context), kind="followup", context=context)
    followup = followup or "Could you go a level deeper into the edge cases and failure modes there?"

    transcript.append({"role": "assistant", "content": followup, "day": day_no})
    answer = interrupt(followup)
    answer = (answer or "").strip()
    transcript.append({"role": "candidate", "content": answer, "day": day_no})

    return {
        "phase": "AWAIT_ANSWER",
        "last_reply": followup,
        "follow_ups_on_current_day": state.get("follow_ups_on_current_day", 0) + 1,
        "questions_asked": state.get("questions_asked", 0) + 1,
        "transcript": transcript,
    }


def node_synthesize_feedback(state: InterviewState) -> dict[str, Any]:
    """Synthesize structured feedback and end the interview."""
    transcript = list(state.get("transcript", []))
    days_covered = sorted(state.get("days_covered", set()))
    day_details = [{"day": d, "title": ctx.day_title(d)} for d in days_covered]
    context = {"transcript": transcript, "days": day_details}

    feedback = _client().generate(
        build_feedback_prompt(context),
        schema=FEEDBACK_SCHEMA,
        kind="feedback",
        context=context,
    )
    if not isinstance(feedback, dict):
        feedback = mock_feedback(context)
    feedback = {
        "summary": str(feedback.get("summary") or ""),
        "strengths": [str(s) for s in feedback.get("strengths") or []],
        "gaps": [str(g) for g in feedback.get("gaps") or []],
        "next": [str(n) for n in feedback.get("next") or []],
    }
    return {
        "phase": "DONE",
        "feedback": feedback,
        "last_reply": "Interview completed. Your structured feedback is ready.",
    }
