import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/useCrearPedido'
import { CheckoutForm, type CheckoutValues } from '../components/CheckoutForm'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { formatMoneda } from '../../../shared/utils/format'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-8">
        <EstadoVacio
          icono="🛒"
          titulo="No hay nada para confirmar"
          descripcion="Tu carrito está vacío."
          accion={
            <Link to="/">
              <Button>Ir al catálogo</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const confirmar = async (values: CheckoutValues) => {
    // Si falla (stock, producto no disponible…), la excepción vuelve al formulario
    // que muestra el detail de la API y el carrito se conserva.
    await crearPedido.mutateAsync({
      items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      forma_pago: values.forma_pago,
      direccion_entrega: values.direccion_entrega.trim(),
      notas: values.notas.trim() || null,
    })
    vaciar()
    navigate('/mis-pedidos')
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-5">
      <div className="md:col-span-3">
        <h1 className="mb-4 text-2xl font-bold text-stone-900">Confirmar pedido</h1>
        <Card className="p-5">
          <CheckoutForm onSubmit={confirmar} />
        </Card>
      </div>

      <aside className="md:col-span-2">
        <h2 className="mb-4 text-lg font-semibold text-stone-900 md:mt-1.5 md:pt-1">Tu pedido</h2>
        <Card className="p-4">
          <ul className="divide-y divide-stone-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between gap-3 py-2">
                <span className="text-stone-700">
                  {i.cantidad} × {i.nombre}
                </span>
                <span className="font-medium">{formatMoneda(i.cantidad * i.precio_unitario)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-base font-bold">
            <span>Total</span>
            <span>{formatMoneda(total)}</span>
          </div>
        </Card>
      </aside>
    </div>
  )
}
