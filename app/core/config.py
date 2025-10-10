import os
from pydantic_settings import BaseSettings
from typing import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/traffic_db"
    
     # JWT
    SECRET_KEY: str = "trafficviolation"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Security
    BCRYPT_ROUNDS: int = 12
    
    # CORS
    ALLOWED_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # App
    PROJECT_NAME: str = "Traffic Violation System"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
