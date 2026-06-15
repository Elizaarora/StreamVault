from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "auth_db"

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"

    # Gmail SMTP
    SMTP_USER: str = ""          # your Gmail address
    SMTP_PASSWORD: str = ""      # Gmail App Password (NOT your login password)
    FROM_NAME: str = "StreamVault"

    # App
    FRONTEND_URL: str = "http://localhost:5173"
    APP_NAME: str = "StreamVault"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
