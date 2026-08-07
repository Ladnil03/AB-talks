"""LLM client abstraction with deterministic mock mode.

Provider resolution order:
1. ``LLM_MODE=mock``              -> deterministic offline mock (tests / CI).
2. ``LLM_MODE=auto`` (default)    -> first configured key: ``GROQ_API_KEY``,
                                     then ``ANTHROPIC_API_KEY``, then ``OPENAI_API_KEY``.
3. no keys configured             -> deterministic mock.

``generate()`` receives a rendered prompt plus a ``kind`` and a structured
``context`` dict. The real providers receive the rendered prompt; the
deterministic mock uses the structured ``context`` so its output stays
grounded in the actual curriculum and candidate data.
"""
from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

logger = logging.getLogger(__name__)

DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"
DEFAULT_ANTHROPIC_MODEL = "claude-3-5-sonnet-latest"
DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
MAX_PARSE_RETRIES = 1

DEPTH_VALUES = ("SHALLOW", "MEDIUM", "DEEP")


def _split_keywords(text: str) -> list[str]:
    return [w for w in re.split(r"\W+", text.lower()) if len(w) > 3]


def mock_evaluate(context: dict[str, Any]) -> dict[str, Any]:
    """Deterministic depth scoring used by mock mode and graph fallbacks."""
    answer = context.get("answer") or ""
    objectives = context.get("objectives") or []
    objective_keywords = _split_keywords(" ".join(objectives))
    answer_lower = answer.lower()
    coverage = sum(1 for w in objective_keywords if w in answer_lower) / max(1, len(objective_keywords))
    word_count = len(answer.split())

    if not answer.strip() or word_count < 8:
        depth = "SHALLOW"
    elif coverage >= 0.35 and word_count >= 45:
        depth = "DEEP"
    elif word_count >= 45 and coverage >= 0.12:
        depth = "MEDIUM"
    elif coverage >= 0.4:
        depth = "MEDIUM"
    else:
        depth = "SHALLOW"

    follow_up_count = int(context.get("follow_up_count", 0) or 0)
    should_follow_up = depth in ("SHALLOW", "MEDIUM") and follow_up_count < 2
    reasoning = {
        "DEEP": "Answer demonstrated concrete mechanisms, edge cases, and trade-offs.",
        "MEDIUM": "Answer covered the core idea but missed specific failure modes or trade-offs.",
        "SHALLOW": "Answer was too high-level and did not explain concrete mechanisms.",
    }[depth]
    return {"depth": depth, "should_follow_up": should_follow_up, "reasoning": reasoning}


def mock_feedback(context: dict[str, Any]) -> dict[str, Any]:
    """Deterministic feedback synthesis from recorded evaluations."""
    transcript = context.get("transcript") or []
    days = context.get("days") or []
    title_by_day = {d.get("day"): d.get("title") for d in days}

    evals: list[dict[str, Any]] = []
    for entry in transcript:
        if entry.get("role") == "candidate":
            evals.append(entry)

    def _title(day: Any) -> str:
        return title_by_day.get(day) or f"Day {day}"

    strength_titles: list[str] = []
    gap_titles: list[str] = []
    for entry in evals:
        depth = (entry.get("eval") or {}).get("depth", "SHALLOW")
        title = _title(entry.get("day"))
        if depth == "DEEP":
            strength_titles.append(title)
        elif depth == "MEDIUM":
            strength_titles.append(title)
        else:
            gap_titles.append(title)

    def _dedup(items: list[str]) -> list[str]:
        seen: list[str] = []
        for item in items:
            if item not in seen:
                seen.append(item)
        return seen

    strengths = [
        f"Demonstrated a strong grasp of {title} with concrete mechanisms and trade-offs."
        for title in _dedup(strength_titles)
    ]
    gaps = [
        f"Coverage of {title} stayed high-level; work through the hands-on objectives to deepen understanding."
        for title in _dedup(gap_titles)
    ]
    if not strengths:
        strengths = ["Articulated the core concepts discussed during the session."]
    if not gaps:
        gaps = ["No major gaps observed; push further into scaling and failure-mode scenarios."]

    next_steps = [
        f"Revisit {title} and rebuild the hands-on mission end-to-end from scratch."
        for title in _dedup(gap_titles)
    ]
    if not next_steps:
        next_steps = [
            "Practice explaining each mission end-to-end: architecture, trade-offs, and failure modes.",
        ]

    summary = (
        f"The candidate fielded {len(evals)} questions across {len(days)} curriculum days. "
        f"Answers were generally "
        f"{'strong and well-grounded' if strength_titles and not gap_titles else 'solid with clear areas for growth'}."
    )
    return {"summary": summary, "strengths": strengths, "gaps": gaps, "next": next_steps}


def mock_question(context: dict[str, Any]) -> str:
    title = context.get("title") or "this topic"
    objectives = context.get("objectives") or []
    tools = context.get("tools") or []
    signal = context.get("signal") or "standard"
    day_no = context.get("day_no")
    first_objective = objectives[0] if objectives else f"the core concepts behind {title}"
    tool = tools[0] if tools else "the relevant tools"
    day_label = f"Day {day_no}: " if day_no else ""
    if signal == "skipped":
        return (
            f"We're on {day_label}{title}. I see this mission was skipped during the cohort. Tell me what you "
            f"do know about '{first_objective}', and what it would take to close that gap (for example, working "
            f"with {tool})."
        )
    if signal == "weak":
        return (
            f"We're on {day_label}{title}. You had to put in real work here, so let's go back to first "
            f"principles. Walk me through the core idea behind '{first_objective}' and the biggest problem "
            f"you hit getting it to work - then tell me how you would recover if it failed in production "
            f"(for example using {tool})."
        )
    if signal == "stretch":
        return (
            f"We're on {day_label}{title}, which you picked up quickly. Describe a scenario at scale where "
            f"'{first_objective}' would break, and the trade-offs you'd weigh (including {tool}) to "
            f"handle it in a production system."
        )
    return (
        f"We're on {day_label}{title}. Describe how you approached '{first_objective}' in your project, "
        f"the engineering decisions you made along the way, and where {tool} mattered most."
    )


def mock_intro(context: dict[str, Any]) -> str:
    name = context.get("name") or "Candidate"
    topics = context.get("topics") or []
    topic_str = ", ".join(topics[:3]) if topics else "the systems you built during the AI Cohort"
    return (
        f"Hello {name}! I'll be conducting your technical interview today, focusing on the systems you built "
        f"during the AI Cohort. We'll cover {topic_str}. It will be conversational - I'll ask you to walk "
        f"through your engineering decisions, then dig deeper where it's interesting. Let's start: tell me "
        f"about your experience building these systems end-to-end."
    )


def mock_followup(context: dict[str, Any]) -> str:
    depth = context.get("depth") or "MEDIUM"
    if depth == "SHALLOW":
        return (
            "That gives me the outline - could you go one level deeper and walk me through the concrete "
            "mechanism, the specific implementation details you used, and the failure modes you'd need to handle?"
        )
    return (
        "Good. Can you walk me through the trade-offs and edge cases you considered in more depth - "
        "what would actually break at scale, and how would you recover?"
    )


def mock_generate(kind: str | None, context: dict[str, Any], schema: dict[str, Any] | None = None) -> str | dict[str, Any]:
    if kind == "intro":
        return mock_intro(context)
    if kind == "evaluate":
        return mock_evaluate(context)
    if kind == "followup":
        return mock_followup(context)
    if kind == "feedback":
        return mock_feedback(context)
    return mock_question(context)


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def parse_json(text: str) -> dict[str, Any] | None:
    """Best-effort JSON extraction from a model response (handles code fences)."""
    cleaned = _strip_code_fences(text)
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass
    try:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start != -1 and end > start:
            parsed = json.loads(cleaned[start : end + 1])
            if isinstance(parsed, dict):
                return parsed
    except json.JSONDecodeError:
        pass
    logger.warning("Could not parse JSON from LLM output: %r", text[:200])
    return None


class LLMClient:
    """Minimal provider-agnostic LLM client with mock fallback."""

    def __init__(self, provider: str = "auto") -> None:
        self.provider = provider.lower()
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.groq_key = os.getenv("GROQ_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")

    @property
    def resolved_provider(self) -> str:
        mode = os.getenv("LLM_MODE", "auto").lower()
        if mode == "mock":
            return "mock"
        if self.provider != "auto":
            return self.provider
        if self.groq_key:
            return "groq"
        if self.anthropic_key:
            return "anthropic"
        if self.openai_key:
            return "openai"
        return "mock"

    @property
    def is_mock(self) -> bool:
        return self.resolved_provider == "mock"

    def generate(
        self,
        prompt: str,
        schema: dict[str, Any] | None = None,
        temperature: float = 0.2,
        kind: str | None = None,
        context: dict[str, Any] | None = None,
    ) -> str | dict[str, Any] | None:
        """Returns text (no schema), parsed JSON dict (schema) or None on failure."""
        context = context or {}
        if self.is_mock:
            return mock_generate(kind, context, schema)

        provider = self.resolved_provider
        try:
            if provider == "groq":
                result = self._groq(prompt, schema, temperature)
            elif provider == "anthropic":
                result = self._anthropic(prompt, schema, temperature)
            elif provider == "openai":
                result = self._openai(prompt, schema, temperature)
            else:
                result = mock_generate(kind, context, schema)
            if schema is not None and isinstance(result, str):
                return self._parse_json(result)
            return result
        except Exception as exc:  # noqa: BLE001 - degrade gracefully on provider errors
            logger.warning("LLM provider %s failed: %s; falling back to mock", provider, exc)
            return mock_generate(kind, context, schema)

    def _groq(self, prompt: str, schema: dict[str, Any] | None, temperature: float) -> str | dict[str, Any]:
        from groq import Groq

        client = Groq(api_key=self.groq_key)
        kwargs: dict[str, Any] = {
            "model": os.getenv("GROQ_MODEL", DEFAULT_GROQ_MODEL),
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
        }
        if schema is not None:
            kwargs["response_format"] = {"type": "json_object"}
        response = client.chat.completions.create(**kwargs)
        text = (response.choices[0].message.content or "").strip()
        if schema is None:
            return text
        return self._parse_json(text) or text

    def _anthropic(self, prompt: str, schema: dict[str, Any] | None, temperature: float) -> str | dict[str, Any]:
        from anthropic import Anthropic

        client = Anthropic(api_key=self.anthropic_key)
        response = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", DEFAULT_ANTHROPIC_MODEL),
            max_tokens=1024,
            temperature=temperature,
            system="You are the AI Interview Agent, a rigorous but conversational technical interviewer.",
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(b.text for b in response.content if getattr(b, "type", "") == "text").strip()
        if schema is None:
            return text
        return self._parse_json(text) or text

    def _openai(self, prompt: str, schema: dict[str, Any] | None, temperature: float) -> str | dict[str, Any]:
        from openai import OpenAI

        client = OpenAI(api_key=self.openai_key, base_url=os.getenv("OPENAI_BASE_URL") or None)
        kwargs: dict[str, Any] = {
            "model": os.getenv("OPENAI_MODEL", DEFAULT_OPENAI_MODEL),
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
        }
        if schema is not None:
            kwargs["response_format"] = {"type": "json_object"}
        response = client.chat.completions.create(**kwargs)
        text = (response.choices[0].message.content or "").strip()
        if schema is None:
            return text
        return self._parse_json(text) or text

    def _parse_json(self, text: str) -> dict[str, Any] | None:
        return parse_json(text)


_llm_client: LLMClient | None = None


def get_llm_client() -> LLMClient:
    global _llm_client
    if _llm_client is None:
        _llm_client = LLMClient(provider=os.getenv("LLM_PROVIDER", "auto"))
    return _llm_client
