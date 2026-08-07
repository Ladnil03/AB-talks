"""Shared fixtures for the AI-track test suite.

Tests always run in deterministic mock mode so they are hermetic and pass in CI
without any API keys. ``LLM_MODE`` is read at call time by ``LLMClient``.
"""
import os

import pytest

os.environ.setdefault("LLM_MODE", "mock")


@pytest.fixture(autouse=True)
def force_mock_mode(monkeypatch):
    monkeypatch.setenv("LLM_MODE", "mock")
    monkeypatch.setenv("LLM_PROVIDER", "auto")
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    yield
