import { Button } from '../ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <div className="text-3xl" aria-hidden="true">
        ⚠️
      </div>
      <p className="mt-2 text-sm font-medium text-red-800">{mensaje}</p>
      {onReintentar && (
        <Button className="mt-4" variante="secondary" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
