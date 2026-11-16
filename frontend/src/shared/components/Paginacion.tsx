import { Button } from '../ui/Button'

interface PaginacionProps {
  pagina: number // 1-based
  total: number
  limite: number
  onCambiar: (pagina: number) => void
}

export function Paginacion({ pagina, total, limite, onCambiar }: PaginacionProps) {
  const paginas = Math.max(1, Math.ceil(total / limite))
  if (total <= limite) return null
  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3 py-4">
      <Button variante="secondary" tamano="sm" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </Button>
      <span className="text-sm text-stone-600">
        Página {pagina} de {paginas} · {total} resultados
      </span>
      <Button variante="secondary" tamano="sm" disabled={pagina >= paginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente →
      </Button>
    </nav>
  )
}
