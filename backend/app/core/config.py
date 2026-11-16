"""Configuración de la aplicación, leída desde variables de entorno / .env."""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./foodstore.db"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    @field_validator("DATABASE_URL")
    @classmethod
    def usar_driver_psycopg2(cls, value: str) -> str:
        # SQLAlchemy 2.1 usa psycopg 3 para "postgresql://"; el proyecto usa psycopg2.
        for prefijo in ("postgresql://", "postgres://"):
            if value.startswith(prefijo):
                return "postgresql+psycopg2://" + value[len(prefijo):]
        return value

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_larga(cls, value: str) -> str:
        if len(value) < 32:
            raise ValueError("SECRET_KEY debe tener al menos 32 caracteres")
        return value

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGIN.split(",") if o.strip()]


settings = Settings()  # type: ignore[call-arg]
