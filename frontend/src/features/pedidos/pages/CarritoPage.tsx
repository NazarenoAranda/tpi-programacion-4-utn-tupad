import { Link } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { formatMoneda } from '../../../shared/utils/format'

export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <EstadoVacio
          icono="🛒"
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo para armar tu pedido."
          accion={
            <Link to="/">
              <Button>Ir al catálogo</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Carrito</h1>
        <Button variante="ghost" tamano="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card className="divide-y divide-stone-100">
        {items.map((item) => (
          <div key={item.producto_id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-stone-900">{item.nombre}</div>
              <div className="text-sm text-stone-500">{formatMoneda(item.precio_unitario)} c/u</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variante="secondary"
                tamano="sm"
                aria-label={`Restar uno a ${item.nombre}`}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </Button>
              <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                {item.cantidad}
              </span>
              <Button
                variante="secondary"
                tamano="sm"
                aria-label={`Sumar uno a ${item.nombre}`}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </Button>
            </div>

            <div className="w-28 text-right font-semibold text-stone-900">
              {formatMoneda(item.precio_unitario * item.cantidad)}
            </div>
            <Button variante="ghost" tamano="sm" onClick={() => quitar(item.producto_id)}>
              Quitar
            </Button>
          </div>
        ))}
      </Card>

      <Card className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <div className="text-sm text-stone-500">Total</div>
          <div className="text-2xl font-bold text-stone-900">{formatMoneda(total)}</div>
        </div>
        <div className="flex gap-2">
          <Link to="/">
            <Button variante="secondary">Seguir comprando</Button>
          </Link>
          <Link to="/checkout">
            <Button>Confirmar pedido</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
