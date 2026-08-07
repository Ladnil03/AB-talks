"""Unit tests for the AI-track prompt builders."""
from app.prompts.evaluate import build_evaluation_prompt
from app.prompts.feedback import build_feedback_prompt
from app.prompts.followup import build_followup_prompt
from app.prompts.intro import build_intro_prompt
from app.prompts.question import build_question_prompt


def _assert_no_unfilled_placeholders(prompt: str):
    assert "{{" not in prompt and "}}" not in prompt


def test_intro_prompt_is_grounded():
    prompt = build_intro_prompt({"name": "Sarah", "role": "AI Engineer", "background": "6 years", "topics": ["Embeddings", "RAG"]})
    assert "Sarah" in prompt
    assert "AI Engineer" in prompt
    assert "Embeddings" in prompt
    _assert_no_unfilled_placeholders(prompt)


def test_question_prompt_supports_weak_signal():
    prompt = build_question_prompt({"day_no": 12, "module": "LLM Core", "objectives": ["chain-of-thought"], "tools": ["LLMs"], "signal": "weak"})
    assert "struggled" in prompt
    assert "chain-of-thought" in prompt
    _assert_no_unfilled_placeholders(prompt)


def test_question_prompt_supports_stretch_signal():
    prompt = build_question_prompt({"day_no": 12, "module": "LLM Core", "objectives": ["chain-of-thought"], "tools": ["LLMs"], "signal": "stretch"})
    assert "excelled" in prompt
    _assert_no_unfilled_placeholders(prompt)


def test_question_prompt_supports_skipped_signal():
    prompt = build_question_prompt({"day_no": 29, "module": "Production", "objectives": ["logging"], "tools": ["Prometheus"], "signal": "skipped"})
    assert "skipped" in prompt
    _assert_no_unfilled_placeholders(prompt)


def test_evaluation_prompt_has_json_contract():
    prompt = build_evaluation_prompt({"question": "Q?", "answer": "A.", "objectives": ["obj"], "follow_up_count": 1})
    assert '"depth"' in prompt
    assert '"should_follow_up"' in prompt
    assert '"reasoning"' in prompt
    assert "Follow-up Count" in prompt
    _assert_no_unfilled_placeholders(prompt)


def test_followup_prompt_is_grounded():
    prompt = build_followup_prompt({"question": "Q?", "answer": "A.", "depth": "SHALLOW", "reasoning": "too vague"})
    assert "SHALLOW" in prompt
    assert "too vague" in prompt
    assert "Q?" in prompt
    _assert_no_unfilled_placeholders(prompt)


def test_feedback_prompt_embeds_transcript():
    transcript = [{"role": "assistant", "content": "Q", "day": 7}]
    prompt = build_feedback_prompt({"transcript": transcript, "days": [{"day": 7, "title": "Embeddings"}]})
    assert '"summary"' in prompt
    assert '"strengths"' in prompt
    assert '"gaps"' in prompt
    assert '"next"' in prompt
    assert "Embeddings" in prompt
    _assert_no_unfilled_placeholders(prompt)
