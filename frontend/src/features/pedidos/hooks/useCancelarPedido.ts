import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarPedido } from '../api/pedidos'

export function useCancelarPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['pedidos'] }),
        qc.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
