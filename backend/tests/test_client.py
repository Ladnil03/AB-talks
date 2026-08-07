"""Unit tests for the LLM client abstraction (deterministic mock mode)."""
from app.llm.client import LLMClient, mock_evaluate, mock_feedback, parse_json


def test_mock_mode_forced_by_env(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "sk-fake")
    client = LLMClient()
    assert client.is_mock is True
    assert client.resolved_provider == "mock"


def test_auto_mode_resolves_to_mock_without_keys():
    client = LLMClient(provider="auto")
    assert client.is_mock is True


def test_question_generation_is_deterministic():
    client = LLMClient()
    context = {"kind": "question", "day_no": 7, "title": "Embeddings Explained", "objectives": ["Generate embeddings"], "tools": ["Sentence Transformers"], "signal": "standard"}
    first = client.generate("prompt", kind="question", context=context)
    second = client.generate("prompt", kind="question", context=context)
    assert isinstance(first, str) and first == second


def test_evaluate_shallow_answer():
    result = mock_evaluate({"answer": "I think embeddings are cool.", "objectives": ["embeddings", "vectors"], "follow_up_count": 0})
    assert result["depth"] == "SHALLOW"
    assert result["should_follow_up"] is True


def test_evaluate_deep_answer():
    answer = (
        "We converted text chunks into vector embeddings with Sentence Transformers, indexed them in "
        "ChromaDB with metadata for filtering, validated the clustering with PCA, then ran semantic search "
        "queries and compared retrieval quality across chunk sizes and embedding models before selecting the "
        "final configuration for the RAG pipeline."
    )
    result = mock_evaluate({"answer": answer, "objectives": ["embeddings", "ChromaDB", "semantic", "retrieval", "chunks", "metadata", "PCA"], "follow_up_count": 0})
    assert result["depth"] == "DEEP"
    assert result["should_follow_up"] is False


def test_evaluate_followup_capped_at_two():
    result = mock_evaluate({"answer": "short answer", "objectives": ["embeddings"], "follow_up_count": 2})
    assert result["depth"] == "SHALLOW"
    assert result["should_follow_up"] is False


def test_feedback_shape():
    transcript = [
        {"role": "assistant", "content": "Q", "day": 7},
        {"role": "candidate", "content": "a", "day": 7, "eval": {"depth": "SHALLOW", "should_follow_up": True, "reasoning": "r"}},
    ]
    result = mock_feedback({"transcript": transcript, "days": [{"day": 7, "title": "Embeddings Explained"}]})
    assert set(result.keys()) == {"summary", "strengths", "gaps", "next"}
    assert isinstance(result["strengths"], list)
    assert isinstance(result["gaps"], list)
    assert isinstance(result["next"], list)


def test_parse_json_handles_code_fences():
    assert parse_json('```json\n{"a": 1}\n```') == {"a": 1}
    assert parse_json('{"a": 1}') == {"a": 1}
    assert parse_json("not json") is None
