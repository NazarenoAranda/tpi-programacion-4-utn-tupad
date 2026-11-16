import { api } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../types'

export async function listarUsuarios(): Promise<Usuario[]> {
  const res = await api.get<Usuario[]>('/admin/usuarios')
  return res.data
}

export async function activarUsuario(id: number): Promise<Usuario> {
  const res = await api.post<Usuario>(`/admin/usuarios/${id}/activar`)
  return res.data
}

export async function desactivarUsuario(id: number): Promise<Usuario> {
  const res = await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`)
  return res.data
}
