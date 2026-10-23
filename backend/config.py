import logging
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field

logger = logging.getLogger("skillbridge.config")

class Settings(BaseSettings):
    """
    SkillBridge Application Settings.
    Stateless configuration loaded strictly from environment variables.
    No credentials or API keys are ever hardcoded or persisted to disk.
    """
    # Gemini / Gemma 4 Settings
    gemini_api_key: Optional[str] = Field(default=None, validation_alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemma-4-26b-a4b-it", validation_alias="GEMINI_MODEL")
    
    # RapidAPI Settings
    rapidapi_key: Optional[str] = Field(default=None, validation_alias="RAPIDAPI_KEY")
    rapidapi_host: str = Field(default="jsearch.p.rapidapi.com", validation_alias="RAPIDAPI_HOST")
    
    # Server / Runtime Settings
    environment: str = Field(default="development", validation_alias="ENVIRONMENT")
    host: str = Field(default="0.0.0.0", validation_alias="HOST")
    port: int = Field(default=8000, validation_alias="PORT")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    max_history_length: int = Field(default=20, validation_alias="MAX_HISTORY_LENGTH")
    
    # API Timeouts
    request_timeout_seconds: float = Field(default=15.0, validation_alias="REQUEST_TIMEOUT_SECONDS")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    def validate_gemini_config(self) -> None:
        """Validates that the Gemini API Key is present before calling Gemini."""
        if not self.gemini_api_key or not self.gemini_api_key.strip():
            raise ValueError(
                "GEMINI_API_KEY is not configured. Please supply a valid Google Gemini API key in your environment or .env file."
            )

    def validate_rapidapi_config(self) -> None:
        """Validates that RapidAPI configuration is present before calling external services."""
        if not self.rapidapi_key or not self.rapidapi_key.strip():
            raise ValueError(
                "RAPIDAPI_KEY is not configured. Please supply a valid RapidAPI key in your environment or .env file."
            )

# Singleton settings instance
settings = Settings()
