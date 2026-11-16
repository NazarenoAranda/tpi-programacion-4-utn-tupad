import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategorias, useEliminarCategoria } from '../hooks/useCategorias'
import { CategoriaFormModal } from '../components/CategoriaFormModal'
import { DataTable } from '../../../shared/components/DataTable'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { ConfirmModal } from '../../../shared/ui/Modal'
import type { Categoria } from '../types'

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const eliminar = useEliminarCategoria()
  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | undefined>(undefined)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ getValue }) => <span className="font-medium text-stone-900">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-stone-400">—</span>,
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
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
          <h1 className="text-2xl font-bold text-stone-900">Categorías</h1>
          <p className="text-sm text-stone-500">Administrá las categorías del catálogo.</p>
        </div>
        <Button
          onClick={() => {
            setEditando(undefined)
            setFormAbierto(true)
          }}
        >
          + Nueva categoría
        </Button>
      </div>

      {categorias.isPending ? (
        <SkeletonRows />
      ) : categorias.isError ? (
        <EstadoError mensaje={handleApiError(categorias.error)} onReintentar={() => void categorias.refetch()} />
      ) : (
        <DataTable data={categorias.data} columns={columnas} vacio="Todavía no hay categorías" />
      )}

      {formAbierto && (
        <CategoriaFormModal categoria={editando} onClose={() => setFormAbierto(false)} />
      )}

      <ConfirmModal
        open={aEliminar !== null}
        title="Eliminar categoría"
        mensaje={`Se dará de baja la categoría "${aEliminar?.nombre ?? ''}". Su nombre no se libera y sus productos no se dan de baja automáticamente.`}
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
