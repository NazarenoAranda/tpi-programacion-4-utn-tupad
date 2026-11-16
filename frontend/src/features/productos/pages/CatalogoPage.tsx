import { useState } from 'react'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { ProductCard } from '../components/ProductCard'
import { Paginacion } from '../../../shared/components/Paginacion'
import { SkeletonGrid } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { CONTROL_CLASES } from '../../../shared/ui/Input'

const LIMITE = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(1)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const categorias = useCategorias()
  // Paginación en el servidor: skip = (página - 1) × límite.
  const productos = useProductos({
    skip: (pagina - 1) * LIMITE,
    limit: LIMITE,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  const hayFiltros = search !== '' || categoriaId !== undefined

  const limpiar = () => {
    setTextoBusqueda('')
    setSearch('')
    setCategoriaId(undefined)
    setPagina(1)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Catálogo</h1>
        <p className="text-sm text-stone-500">Elegí tus platos y armá el carrito.</p>
      </div>

      <form
        className="mb-6 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(textoBusqueda.trim())
          setPagina(1)
        }}
      >
        <input
          type="search"
          aria-label="Buscar productos"
          placeholder="Buscar por nombre…"
          value={textoBusqueda}
          onChange={(e) => setTextoBusqueda(e.target.value)}
          className={`${CONTROL_CLASES} sm:max-w-xs`}
        />
        <select
          aria-label="Filtrar por categoría"
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined)
            setPagina(1)
          }}
          className={`${CONTROL_CLASES} sm:max-w-[14rem]`}
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <Button type="submit">Buscar</Button>
        {hayFiltros && (
          <Button variante="ghost" onClick={limpiar}>
            Limpiar filtros
          </Button>
        )}
      </form>

      {productos.isPending ? (
        <SkeletonGrid cantidad={LIMITE} />
      ) : productos.isError ? (
        <EstadoError mensaje={handleApiError(productos.error)} onReintentar={() => void productos.refetch()} />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          icono="🔍"
          titulo="No encontramos productos"
          descripcion={hayFiltros ? 'Probá con otra búsqueda o quitá los filtros.' : 'Todavía no hay productos cargados.'}
          accion={hayFiltros ? <Button onClick={limpiar}>Quitar filtros</Button> : undefined}
        />
      ) : (
        <>
          <div
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${productos.isPlaceholderData ? 'opacity-60' : ''}`}
          >
            {productos.data.items.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} total={productos.data.total} limite={LIMITE} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
