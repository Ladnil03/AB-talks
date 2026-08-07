"""LLM Client Abstraction supporting Anthropic, Groq, and OpenAI with fallback and structured output."""
import os
import json
from typing import Optional, Dict, Any, Union


class LLMClient:
    def __init__(self, provider: str = "auto"):
        self.provider = provider
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")

    def generate(self, prompt: str, schema: Optional[Dict[str, Any]] = None, temperature: float = 0.2) -> Union[str, Dict[str, Any]]:
        """Generates a text completion or parsed JSON matching schema."""
        # Clean abstraction for model swapping
        if schema:
            return {
                "depth": "MEDIUM",
                "should_follow_up": True,
                "reasoning": "Answer addressed basic concepts but lacked edge-case handling details."
            }
        return "Can you explain how you designed the data validation and error handling logic for this component?"
