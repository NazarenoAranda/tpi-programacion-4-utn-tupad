import { Card } from '../../../shared/ui/Card'

interface ResumenCardProps {
  titulo: string
  valor: string
  icono: string
  acento?: string
}

export function ResumenCard({ titulo, valor, icono, acento = 'text-stone-900' }: ResumenCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-stone-500">{titulo}</span>
        <span className="text-2xl" aria-hidden="true">
          {icono}
        </span>
      </div>
      <div className={`mt-2 text-3xl font-bold ${acento}`}>{valor}</div>
    </Card>
  )
}
