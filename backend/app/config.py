from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://hirevize:hirevize_dev@localhost:5432/hirevize"
    redis_url: str = "redis://localhost:6379"

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    default_ai_model: str = "claude-sonnet-4-20250514"

    cors_origins: list[str] = ["http://localhost:3000"]

    storage_path: str = "./storage"

    # JWT / Auth
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
