"""Application configuration and environment settings."""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Interview Agent API"
    environment: str = "development"
    debug: bool = True
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
