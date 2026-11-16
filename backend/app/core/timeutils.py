"""Fechas: se guardan y devuelven en UTC con zona horaria (tz-aware)."""

from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
