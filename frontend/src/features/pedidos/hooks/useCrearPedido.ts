import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearPedido } from '../api/pedidos'
import type { PedidoCreate } from '../types'

export function useCrearPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PedidoCreate) => crearPedido(data),
    onSuccess: async () => {
      // El pedido descuenta stock: se refrescan pedidos (y resumen) y catálogo.
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['pedidos'] }),
        qc.invalidateQueries({ queryKey: ['productos'] }),
      ])
    },
  })
}
