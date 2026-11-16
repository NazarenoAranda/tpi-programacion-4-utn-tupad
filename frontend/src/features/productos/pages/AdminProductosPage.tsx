import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useEliminarProducto, useProductos } from '../hooks/useProductos'
import { ProductoFormModal } from '../components/ProductoFormModal'
import { StockModal } from '../components/StockModal'
import { DataTable } from '../../../shared/components/DataTable'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { ConfirmModal } from '../../../shared/ui/Modal'
import { formatMoneda } from '../../../shared/utils/format'
import type { Producto } from '../types'

export function AdminProductosPage() {
  // El panel pide el máximo permitido (limit=100) y pagina del lado del cliente.
  const productos = useProductos({ skip: 0, limit: 100 })
  const eliminar = useEliminarProducto()

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | undefined>(undefined)
  const [stockDe, setStockDe] = useState<Producto | null>(null)
  const [aEliminar, setAEliminar] = useState<Producto | null>(null)

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      {
        accessorKey: 'nombre',
        header: 'Producto',
        cell: ({ getValue }) => <span className="font-medium text-stone-900">{getValue<string>()}</span>,
      },
      { id: 'categoria', header: 'Categoría', accessorFn: (p) => p.categoria.nombre },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: ({ getValue }) => formatMoneda(getValue<number>()),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className={row.original.stock === 0 ? 'font-semibold text-red-600' : ''}>
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: 'disponible',
        header: 'Disponible',
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Sí</span>
          ) : (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-700">No</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variante="secondary"
              tamano="sm"
              onClick={() => {
                setEditando(row.original)
                setFormAbierto(true)
              }}
            >
              Editar
            </Button>
            <Button variante="secondary" tamano="sm" onClick={() => setStockDe(row.original)}>
              Stock
            </Button>
            <Button
              variante="danger"
              tamano="sm"
              onClick={() => {
                eliminar.reset()
                setAEliminar(row.original)
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
    ],
    [eliminar],
  )

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Productos</h1>
          <p className="text-sm text-stone-500">Alta, edición, stock y disponibilidad.</p>
        </div>
        <Button
          onClick={() => {
            setEditando(undefined)
            setFormAbierto(true)
          }}
        >
          + Nuevo producto
        </Button>
      </div>

      {productos.isPending ? (
        <SkeletonRows />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : (
        <DataTable data={productos.data.items} columns={columnas} vacio="Todavía no hay productos" />
      )}

      {formAbierto && <ProductoFormModal producto={editando} onClose={() => setFormAbierto(false)} />}
      {stockDe && <StockModal producto={stockDe} onClose={() => setStockDe(null)} />}

      <ConfirmModal
        open={aEliminar !== null}
        title="Eliminar producto"
        mensaje={`Se dará de baja "${aEliminar?.nombre ?? ''}". Deja de aparecer en el catálogo; los pedidos anteriores conservan su detalle.`}
        confirmarTexto="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onConfirm={() => {
          if (aEliminar) eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })
        }}
        onClose={() => setAEliminar(null)}
      />
    </div>
  )
}
