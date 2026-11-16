from sqlmodel import SQLModel

from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["UserCreate", "UserPublic", "MensajeResponse"]


class MensajeResponse(SQLModel):
    message: str
