"""Application configuration and environment settings."""
import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AI Interview Agent API"
    environment: str = "development"
    debug: bool = True
    cors_origins: Union[List[str], str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    anthropic_api_key: str = ""
    groq_api_key: str = ""
    openai_api_key: str = ""

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                return json.loads(v)
            return [item.strip() for item in v.split(",") if item.strip()]
        if isinstance(v, list):
            return v
        return ["*"]


settings = Settings()

