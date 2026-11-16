import { formatFecha, formatMoneda } from '../../../shared/utils/format'
import type { Pedido } from '../types'

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-3 text-sm">
      <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        <div>
          <dt className="inline text-stone-500">Dirección: </dt>
          <dd className="inline font-medium text-stone-800">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="inline text-stone-500">Pago: </dt>
          <dd className="inline font-medium text-stone-800">
            {pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
          </dd>
        </div>
        <div>
          <dt className="inline text-stone-500">Creado: </dt>
          <dd className="inline font-medium text-stone-800">{formatFecha(pedido.created_at)}</dd>
        </div>
        <div>
          <dt className="inline text-stone-500">Actualizado: </dt>
          <dd className="inline font-medium text-stone-800">{formatFecha(pedido.updated_at)}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="inline text-stone-500">Notas: </dt>
            <dd className="inline font-medium text-stone-800">{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <table className="w-full text-left">
        <thead className="text-xs uppercase text-stone-500">
          <tr>
            <th className="py-1 font-medium">Producto</th>
            <th className="py-1 text-right font-medium">Cant.</th>
            <th className="py-1 text-right font-medium">Precio</th>
            <th className="py-1 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((d) => (
            <tr key={d.producto_id}>
              <td className="py-1.5">{d.nombre_producto}</td>
              <td className="py-1.5 text-right">{d.cantidad}</td>
              <td className="py-1.5 text-right">{formatMoneda(d.precio_unitario)}</td>
              <td className="py-1.5 text-right font-medium">{formatMoneda(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-200">
            <td colSpan={3} className="py-2 text-right font-semibold">
              Total
            </td>
            <td className="py-2 text-right font-bold">{formatMoneda(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
