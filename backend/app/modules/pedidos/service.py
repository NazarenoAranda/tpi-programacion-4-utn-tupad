from typing import Optional

from app.core.timeutils import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

# RN-02: mapa de transiciones válidas. Los estados terminales no tienen salida.
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- RN-01: crear pedido ----------
    def crear(self, data: PedidoCreate, usuario: Usuario) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido("Un producto no puede repetirse en el pedido")

        with self.uow as uow:
            pedido = Pedido(
                usuario_id=usuario.id,  # type: ignore[arg-type]
                estado=PENDIENTE,
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            # Se procesa ordenado por id de producto para tomar los bloqueos
            # de fila siempre en el mismo orden (evita deadlocks entre pedidos).
            for item in sorted(data.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_by_id(item.producto_id, for_update=True)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"El producto {item.producto_id} no existe o está inactivo"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"disponible {producto.stock}, solicitado {item.cantidad}"
                    )

                producto.stock -= item.cantidad  # descuento en la misma transacción
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,  # type: ignore[arg-type]
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia (RN-05)
                        precio_unitario=producto.precio_base,  # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.session.expire(pedido)  # recarga items al validar
            return PedidoRead.model_validate(pedido)

    # ---------- consultas ----------
    def listar(
        self, usuario: Usuario, skip: int, limit: int, estado: Optional[str]
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin":
                total, items = uow.pedidos.list_all(estado, skip, limit)
            else:
                total, items = uow.pedidos.list_by_usuario(
                    usuario.id, estado, skip, limit  # type: ignore[arg-type]
                )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in items]
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_visible(uow, pedido_id, usuario)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado(ENTREGADO),
            )

    # ---------- RN-02 / RN-03 / RN-04: cambios de estado ----------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Uso del admin: avanza o cancela según la máquina de estados."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id, for_update=True)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        """Uso del dueño: solo puede cancelar su pedido y solo en PENDIENTE."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id, for_update=True)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida(
                    f"Solo se puede cancelar un pedido en {PENDIENTE} (estado actual: {pedido.estado})"
                )
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    # ---------- internos ----------
    @staticmethod
    def _get_visible(uow: PedidoUnitOfWork, pedido_id: int, usuario: Usuario) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        if usuario.role != "admin" and pedido.usuario_id != usuario.id:
            raise PedidoAjeno("El pedido pertenece a otro usuario")
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        # Toda transición se valida ANTES de modificar el pedido.
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(
                f"Transición inválida: {pedido.estado} → {nuevo_estado}"
            )
        if nuevo_estado == CANCELADO:
            # RN-03: restituir el stock de cada línea en la misma transacción.
            for detalle in pedido.items:
                producto = uow.productos.get_by_id(detalle.producto_id, for_update=True)
                if producto is not None:
                    producto.stock += detalle.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo_estado
        pedido.updated_at = utcnow()
        uow.pedidos.add(pedido)
