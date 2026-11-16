import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import { useAuthStore } from '../../../store/authStore'
import { DataTable } from '../../../shared/components/DataTable'
import { SkeletonRows } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import type { Usuario } from '../types'

export function AdminUsuariosPage() {
  const yo = useAuthStore((s) => s.usuario)
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const ocupado = activar.isPending || desactivar.isPending

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      {
        accessorKey: 'username',
        header: 'Usuario',
        cell: ({ getValue }) => <span className="font-medium text-stone-900">{getValue<string>()}</span>,
      },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ getValue }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getValue<string>() === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-700'}`}
          >
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Desactivado</span>
          ) : (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Activo</span>
          ),
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original
          if (u.disabled) {
            return (
              <Button tamano="sm" disabled={ocupado} onClick={() => activar.mutate(u.id)}>
                Activar
              </Button>
            )
          }
          // El administrador no puede desactivarse a sí mismo: no se muestra el botón en su fila.
          if (u.id === yo?.id) return <span className="text-xs text-stone-400">Tu cuenta</span>
          return (
            <Button variante="danger" tamano="sm" disabled={ocupado} onClick={() => desactivar.mutate(u.id)}>
              Desactivar
            </Button>
          )
        },
      },
    ],
    [yo?.id, ocupado, activar, desactivar],
  )

  const errorAccion = activar.isError ? activar.error : desactivar.isError ? desactivar.error : null

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-stone-900">Usuarios</h1>
        <p className="text-sm text-stone-500">Activá o desactivá cuentas (baja lógica).</p>
      </div>

      {errorAccion && (
        <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {handleApiError(errorAccion)}
        </p>
      )}

      {usuarios.isPending ? (
        <SkeletonRows />
      ) : usuarios.isError ? (
        <EstadoError mensaje={handleApiError(usuarios.error)} onReintentar={() => void usuarios.refetch()} />
      ) : (
        <DataTable data={usuarios.data} columns={columnas} vacio="No hay usuarios" />
      )}
    </div>
  )
}
