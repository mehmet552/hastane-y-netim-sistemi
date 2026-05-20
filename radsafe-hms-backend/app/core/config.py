import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "RADSAFE HMS API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-radsafe-hms-dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # SQLAlchemy SQLite for development (in-memory or local file)
    # For production, this should be PostgreSQL: postgresql+asyncpg://user:password@host:port/db
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./radsafe.db")

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
