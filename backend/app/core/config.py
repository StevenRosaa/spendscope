# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Validates and loads environment variables.
    FastAPI will crash on startup if these are missing, which is a good thing!
    """
    DATABASE_URL: str
    SECRET_KEY: str
    S3_BUCKET_NAME: str
    S3_ENDPOINT_URL: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str

    # Tells Pydantic to read from the .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

# Create a global instance to use throughout the app
settings = Settings()