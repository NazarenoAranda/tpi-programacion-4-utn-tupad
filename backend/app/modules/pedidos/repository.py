from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def _listar(
        self, usuario_id: Optional[int], estado: Optional[str], skip: int, limit: int
    ) -> tuple[int, Sequence[Pedido]]:
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)
        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Pedido)
            .where(*condiciones)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())  # type: ignore[union-attr]
            .offset(skip)
            .limit(limit)
        ).all()
        return total, items

    def list_by_usuario(
        self, usuario_id: int, estado: Optional[str] = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, Sequence[Pedido]]:
        return self._listar(usuario_id, estado, skip, limit)

    def list_all(
        self, estado: Optional[str] = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, Sequence[Pedido]]:
        return self._listar(None, estado, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(
            select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado)  # type: ignore[arg-type]
        ).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.created_at >= desde)  # type: ignore[arg-type]
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        valor = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == estado)
        ).one()
        return float(valor)
