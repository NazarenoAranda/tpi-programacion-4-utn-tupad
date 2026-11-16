"""Engine, creación de tablas y fábrica de sesiones."""

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

engine = create_engine(
    settings.DATABASE_URL, connect_args=_connect_args, pool_pre_ping=True
)


def create_all_tables() -> None:
    # Se importan los modelos para que queden registrados en la metadata.
    import app.modules.categorias.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.usuarios.models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)
