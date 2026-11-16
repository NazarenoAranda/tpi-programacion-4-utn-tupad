import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listarPedidos } from '../api/pedidos'
import type { PedidosFiltros } from '../types'

export function usePedidos(filtros: PedidosFiltros) {
  return useQuery({
    queryKey: ['pedidos', 'lista', filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}
