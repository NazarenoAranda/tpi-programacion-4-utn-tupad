import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../api/categorias'
import type { CategoriaCreate, CategoriaUpdate } from '../types'

export const categoriasKey = ['categorias'] as const

export function useCategorias() {
  return useQuery({ queryKey: categoriasKey, queryFn: listarCategorias })
}

function useInvalidarCategorias() {
  const qc = useQueryClient()
  // Los productos embeben su categoría, así que también se invalidan.
  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: categoriasKey }),
      qc.invalidateQueries({ queryKey: ['productos'] }),
    ])
  }
}

export function useCrearCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: (data: CategoriaCreate) => crearCategoria(data),
    onSuccess: invalidar,
  })
}

export function useActualizarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) => actualizarCategoria(id, data),
    onSuccess: invalidar,
  })
}

export function useEliminarCategoria() {
  const invalidar = useInvalidarCategorias()
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: invalidar,
  })
}
