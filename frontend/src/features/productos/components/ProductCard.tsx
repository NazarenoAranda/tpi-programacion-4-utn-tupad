import { useState } from 'react'
import { useCartStore } from '../../../store/cartStore'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatMoneda } from '../../../shared/utils/format'
import type { Producto } from '../types'

export function ProductCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  )
  const [imagenRota, setImagenRota] = useState(false)

  const sinStock = producto.stock <= 0
  const noVendible = !producto.disponible || sinStock
  const alcanzoElStock = enCarrito >= producto.stock

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative h-40 bg-stone-100">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            onError={() => setImagenRota(true)}
            className={`h-full w-full object-cover ${noVendible ? 'opacity-50 grayscale' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl" aria-hidden="true">
            🍽️
          </div>
        )}
        {noVendible && (
          <span className="absolute left-2 top-2 rounded-full bg-stone-900/80 px-2.5 py-0.5 text-xs font-medium text-white">
            {!producto.disponible ? 'No disponible' : 'Sin stock'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-orange-600">
          {producto.categoria.nombre}
        </span>
        <h3 className="mt-0.5 font-semibold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="text-lg font-bold text-stone-900">{formatMoneda(producto.precio_base)}</div>
            {!noVendible && <div className="text-xs text-stone-400">Stock: {producto.stock}</div>}
          </div>
          <Button
            tamano="sm"
            disabled={noVendible || alcanzoElStock}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
              })
            }
          >
            {alcanzoElStock && !noVendible ? 'Máximo en carrito' : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
