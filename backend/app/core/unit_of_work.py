"""Unit of Work base.

Abre la sesión en ``__enter__`` y, en ``__exit__``, hace commit si el bloque
terminó bien o rollback si hubo una excepción; siempre cierra la sesión.
Ningún Service ni Router llama a ``session.commit()``.
"""

from typing import Callable, Optional, Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self.session: Optional[Session] = None

    def _init_repositories(self, session: Session) -> None:
        """Las subclases crean aquí los repositorios sobre la misma sesión."""

    def __enter__(self) -> Self:
        self.session = self._factory()
        self._init_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        session = self.session
        if session is None:
            return False
        try:
            if exc_type is None:
                try:
                    session.commit()
                except Exception:
                    session.rollback()
                    raise
            else:
                session.rollback()
        finally:
            session.close()
            self.session = None
        return False
