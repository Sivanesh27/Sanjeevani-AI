from typing import List, Union, Any
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    APP_NAME: str = "SanjeevaniAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Security
    SECRET_KEY: str = "sanjeevani-ai-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS (Supports plain string, comma-separated, JSON list, or wildcard)
    CORS_ORIGINS: Any = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            v_str = v.strip()
            if v_str == "*" or not v_str:
                return ["*"]
            if v_str.startswith("[") and v_str.endswith("]"):
                try:
                    parsed = json.loads(v_str)
                    if isinstance(parsed, list):
                        return [str(item) for item in parsed]
                except Exception:
                    pass
            return [i.strip() for i in v_str.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return [str(i) for i in v]
        return ["*"]

    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR / 'sanjeevani.db'}"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # ML Models
    NER_MODEL_PATH: str = str(BASE_DIR / "models" / "bc5cdr-ner")
    DEVICE: str = "auto"

    # LLM Providers
    LLM_PROVIDER: str = "mock"  # "gemini", "openai", "mock"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Document Storage
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "txt", "docx"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60


settings = Settings()
