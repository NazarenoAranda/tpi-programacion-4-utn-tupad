import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Button } from '../ui/Button'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pageSize?: number
  vacio?: string
}

/** Tabla del panel de administración con TanStack Table y paginación del lado del cliente. */
export function DataTable<T>({ data, columns, pageSize = 10, vacio = 'Sin resultados' }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })

  const { pageIndex } = table.getState().pagination
  const paginas = table.getPageCount()

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 font-medium">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-stone-500">
                  {vacio}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/60">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <div className="flex items-center justify-between border-t border-stone-100 px-4 py-2.5 text-sm text-stone-600">
          <span>
            Página {pageIndex + 1} de {paginas} · {data.length} registros
          </span>
          <div className="flex gap-2">
            <Button variante="secondary" tamano="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
              ← Anterior
            </Button>
            <Button variante="secondary" tamano="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
