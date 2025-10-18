import os
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
print(f"DEBUG: Looking for .env at: {ENV_PATH}")
print(f"DEBUG: File exists? {os.path.exists(ENV_PATH)}")


class Settings(BaseSettings):
    # DATABASE
    DATABASE_URL: str 
    postgres_user: str = "admin"
    postgres_password: str = "admin123"
    postgres_db: str = "phatnguoi"

    # JWT / Security 
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BCRYPT_ROUNDS: int = 12

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # App Info
    PROJECT_NAME: str = "Traffic Violation System"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    # pgAdmin
    pgadmin_default_email: str = "admin@local.com"
    pgadmin_default_password: str = "admin123"

    # Redis
    redis_url: str = "redis://redis:6379/0"

    # MinIO
    minio_root_user: str = "minio"
    minio_root_password: str = "minio123"
    minio_endpoint: str = "http://minio:9000"
    minio_bucket: str = "violations"
    minio_console_url: str = "http://localhost:9001"

    # MongoDB
    mongo_uri: str = "mongodb://mongo:27017"
    mongo_db: str = "ai_logs"

    # Pydantic settings configuration (v2)
    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        extra="ignore"
    )


# Khởi tạo settings
settings = Settings()
print(f"🔍 DEBUG: Loaded DATABASE_URL = {settings.DATABASE_URL}")
print(f"🔍 DEBUG: Loaded SECRET_KEY = {settings.SECRET_KEY}")
