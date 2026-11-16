import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { usePedidos } from '../hooks/usePedidos'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { TRANSICIONES, type EstadoPedido, type Pedido } from '../types'
import { DataTable } from '../../../shared/components/DataTable'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { CONTROL_CLASES } from '../../../shared/ui/Input'
import { ConfirmModal, Modal } from '../../../shared/ui/Modal'
import { ETIQUETA_ESTADO, formatFecha, formatMoneda } from '../../../shared/utils/format'

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const pedidos = usePedidos({ skip: 0, limit: 100, estado: estado || undefined })
  const cambiar = useCambiarEstadoPedido()

  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        accessorKey: 'id',
        header: '#',
        cell: ({ getValue }) => <span className="font-medium">#{getValue<number>()}</span>,
      },
      {
        accessorKey: 'usuario_id',
        header: 'Cliente',
        cell: ({ getValue }) => `Usuario ${getValue<number>()}`,
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ getValue }) => formatFecha(getValue<string>()),
      },
      {
        accessorKey: 'forma_pago',
        header: 'Pago',
        cell: ({ getValue }) => (getValue<string>() === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }) => <span className="font-semibold">{formatMoneda(getValue<number>())}</span>,
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ getValue }) => <BadgeEstado estado={getValue<string>()} />,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="flex flex-wrap gap-2">
              <Button variante="secondary" tamano="sm" onClick={() => setDetalle(p)}>
                Detalle
              </Button>
              {TRANSICIONES[p.estado].map((destino) =>
                destino === 'CANCELADO' ? (
                  <Button
                    key={destino}
                    variante="danger"
                    tamano="sm"
                    onClick={() => {
                      cambiar.reset()
                      setACancelar(p)
                    }}
                  >
                    {ETIQUETA_ACCION[destino]}
                  </Button>
                ) : (
                  <Button
                    key={destino}
                    tamano="sm"
                    disabled={cambiar.isPending}
                    onClick={() => cambiar.mutate({ id: p.id, estado: destino })}
                  >
                    {ETIQUETA_ACCION[destino]}
                  </Button>
                ),
              )}
            </div>
          )
        },
      },
    ],
    [cambiar],
  )

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Pedidos</h1>
          <p className="text-sm text-stone-500">Avanzá los pedidos según su estado o cancelalos.</p>
        </div>
        <select
          aria-label="Filtrar por estado"
          className={`${CONTROL_CLASES} w-52`}
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoPedido | '')}
        >
          <option value="">Todos los estados</option>
          {(Object.keys(ETIQUETA_ESTADO) as EstadoPedido[]).map((e) => (
            <option key={e} value={e}>
              {ETIQUETA_ESTADO[e]}
            </option>
          ))}
        </select>
      </div>

      {cambiar.isError && !aCancelar && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(cambiar.error)}
        </p>
      )}

      {pedidos.isPending ? (
        <SkeletonRows />
      ) : pedidos.isError ? (
        <EstadoError mensaje={handleApiError(pedidos.error)} onReintentar={() => void pedidos.refetch()} />
      ) : (
        <DataTable data={pedidos.data.items} columns={columnas} vacio="No hay pedidos con ese filtro" />
      )}

      <Modal open={detalle !== null} onClose={() => setDetalle(null)} title={`Pedido #${detalle?.id ?? ''}`}>
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <ConfirmModal
        open={aCancelar !== null}
        title={`Cancelar pedido #${aCancelar?.id ?? ''}`}
        mensaje="El pedido pasa a CANCELADO y el stock de sus productos se restituye. Es un estado final."
        confirmarTexto="Cancelar pedido"
        cargando={cambiar.isPending}
        error={cambiar.isError ? handleApiError(cambiar.error) : null}
        onConfirm={() => {
          if (aCancelar)
            cambiar.mutate({ id: aCancelar.id, estado: 'CANCELADO' }, { onSuccess: () => setACancelar(null) })
        }}
        onClose={() => setACancelar(null)}
      />
    </div>
  )
}
