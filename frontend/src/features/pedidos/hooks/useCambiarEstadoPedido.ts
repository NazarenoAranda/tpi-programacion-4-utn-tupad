import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido } from '../api/pedidos'
import type { EstadoPedido } from '../types'

export function useCambiarEstadoPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: async () => {
      // Cancelar restituye stock, por eso también se invalida el catálogo.
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['pedidos'] }),
        qc.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
