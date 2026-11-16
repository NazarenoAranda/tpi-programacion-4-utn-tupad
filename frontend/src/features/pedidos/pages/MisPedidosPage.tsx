import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePedidos } from '../hooks/usePedidos'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { ConfirmModal } from '../../../shared/ui/Modal'
import { formatFecha, formatMoneda } from '../../../shared/utils/format'

const LIMITE = 5

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1)
  const [abierto, setAbierto] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<number | null>(null)

  const pedidos = usePedidos({ skip: (pagina - 1) * LIMITE, limit: LIMITE })
  const cancelar = useCancelarPedido()

  const confirmarCancelacion = () => {
    if (aCancelar === null) return
    cancelar.mutate(aCancelar, { onSuccess: () => setACancelar(null) })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold text-stone-900">Mis pedidos</h1>

      {pedidos.isPending ? (
        <SkeletonRows />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          icono="📦"
          titulo="Todavía no hiciste pedidos"
          descripcion="Cuando confirmes un pedido lo vas a ver acá."
          accion={
            <Link to="/">
              <Button>Ver catálogo</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {pedidos.data.items.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-stone-900">Pedido #{p.id}</div>
                    <div className="text-xs text-stone-500">{formatFecha(p.created_at)}</div>
                  </div>
                  <BadgeEstado estado={p.estado} />
                  <div className="text-lg font-bold">{formatMoneda(p.total)}</div>
                  <div className="flex gap-2">
                    <Button
                      variante="secondary"
                      tamano="sm"
                      onClick={() => setAbierto(abierto === p.id ? null : p.id)}
                    >
                      {abierto === p.id ? 'Ocultar detalle' : 'Ver detalle'}
                    </Button>
                    {p.estado === 'PENDIENTE' && (
                      <Button
                        variante="danger"
                        tamano="sm"
                        onClick={() => {
                          cancelar.reset()
                          setACancelar(p.id)
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
                {abierto === p.id && (
                  <div className="mt-4 border-t border-stone-100 pt-4">
                    <PedidoDetalle pedido={p} />
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Paginacion pagina={pagina} total={pedidos.data.total} limite={LIMITE} onCambiar={setPagina} />
        </>
      )}

      <ConfirmModal
        open={aCancelar !== null}
        title={`Cancelar pedido #${aCancelar ?? ''}`}
        mensaje="El pedido se cancela y el stock de sus productos se restituye. Esta acción no se puede deshacer."
        confirmarTexto="Cancelar pedido"
        cargando={cancelar.isPending}
        error={cancelar.isError ? handleApiError(cancelar.error) : null}
        onConfirm={confirmarCancelacion}
        onClose={() => setACancelar(null)}
      />
    </div>
  )
}
