import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  icono?: string
  accion?: ReactNode
}

export function EstadoVacio({ titulo, descripcion, icono = '🍽️', accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <div className="text-4xl" aria-hidden="true">
        {icono}
      </div>
      <h3 className="mt-3 text-base font-semibold text-stone-800">{titulo}</h3>
      {descripcion && <p className="mt-1 max-w-md text-sm text-stone-500">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
