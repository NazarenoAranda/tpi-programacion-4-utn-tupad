"""Repositorio genérico: acceso a datos sin reglas de negocio."""

from typing import Generic, Optional, Sequence, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int, for_update: bool = False) -> Optional[T]:
        statement = select(self.model).where(getattr(self.model, "id") == id)
        if for_update:
            statement = statement.with_for_update()
        return self.session.exec(statement).first()

    def get_all(self, skip: int = 0, limit: Optional[int] = None) -> Sequence[T]:
        statement = select(self.model).offset(skip)
        if limit is not None:
            statement = statement.limit(limit)
        return self.session.exec(statement).all()

    def add(self, entity: T) -> T:
        """Agrega y hace flush (asigna el id); el commit lo hace el Unit of Work."""
        self.session.add(entity)
        self.session.flush()
        return entity

    def refresh(self, entity: T) -> T:
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
