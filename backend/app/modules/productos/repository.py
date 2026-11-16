from typing import Optional, Sequence

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, Sequence[Producto]]:
        """Productos activos con búsqueda por nombre (sin distinguir mayúsculas) y filtros."""
        condiciones = [Producto.activo == True]  # noqa: E712
        if search:
            condiciones.append(func.lower(Producto.nombre).contains(search.strip().lower()))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Producto)
            .where(*condiciones)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(Producto.id)  # type: ignore[arg-type]
            .offset(skip)
            .limit(limit)
        ).all()
        return total, items
