import { api } from '../../../shared/api/axiosInstance'
import type {
  Producto,
  ProductoCreate,
  ProductosFiltros,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types'

export async function listarProductos(filtros: ProductosFiltros): Promise<ProductosPaginados> {
  const res = await api.get<ProductosPaginados>('/productos', { params: filtros })
  return res.data
}

export async function crearProducto(data: ProductoCreate): Promise<Producto> {
  const res = await api.post<Producto>('/productos', data)
  return res.data
}

export async function actualizarProducto(id: number, data: ProductoUpdate): Promise<Producto> {
  const res = await api.put<Producto>(`/productos/${id}`, data)
  return res.data
}

export async function actualizarStock(id: number, data: ProductoStockUpdate): Promise<Producto> {
  const res = await api.patch<Producto>(`/productos/${id}/stock`, data)
  return res.data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
