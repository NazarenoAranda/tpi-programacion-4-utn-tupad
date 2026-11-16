import { useResumenPedidos } from '../hooks/useResumenPedidos'
import { ResumenCard } from '../components/ResumenCard'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'
import { formatMoneda } from '../../../shared/utils/format'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Resumen del negocio</h1>
        <p className="text-sm text-stone-500">Indicadores de pedidos.</p>
      </div>

      {resumen.isPending ? (
        <div role="status" aria-label="Cargando" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError mensaje={handleApiError(resumen.error)} onReintentar={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pendientes" icono="🕒" valor={String(resumen.data.pendientes)} acento="text-amber-600" />
          <ResumenCard titulo="En preparación" icono="👨‍🍳" valor={String(resumen.data.en_preparacion)} acento="text-blue-600" />
          <ResumenCard titulo="Entregados" icono="✅" valor={String(resumen.data.entregados)} acento="text-green-600" />
          <ResumenCard titulo="Cancelados" icono="✖️" valor={String(resumen.data.cancelados)} acento="text-red-600" />
          <ResumenCard titulo="Pedidos de hoy" icono="📅" valor={String(resumen.data.pedidos_hoy)} />
          <ResumenCard titulo="Ingresos (entregados)" icono="💰" valor={formatMoneda(resumen.data.ingresos_entregados)} />
        </div>
      )}
    </div>
  )
}
