import { ETIQUETA_ESTADO } from '../utils/format'

const COLORES: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800 ring-amber-200',
  EN_PREPARACION: 'bg-blue-100 text-blue-800 ring-blue-200',
  ENTREGADO: 'bg-green-100 text-green-800 ring-green-200',
  CANCELADO: 'bg-red-100 text-red-800 ring-red-200',
}

export function BadgeEstado({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORES[estado] ?? 'bg-stone-100 text-stone-700 ring-stone-200'}`}
    >
      {ETIQUETA_ESTADO[estado] ?? estado}
    </span>
  )
}
