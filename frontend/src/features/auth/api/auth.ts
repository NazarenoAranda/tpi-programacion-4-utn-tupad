import { api } from '../../../shared/api/axiosInstance'
import type { LoginCredentials, UserCreate, UserPublic } from '../types'

export async function registrar(data: UserCreate): Promise<UserPublic> {
  const res = await api.post<UserPublic>('/auth/register', data)
  return res.data
}

/** Login OAuth2: formulario urlencoded. El JWT queda en una cookie HttpOnly. */
export async function iniciarSesion({ username, password }: LoginCredentials): Promise<void> {
  const body = new URLSearchParams({ username, password })
  await api.post('/auth/token', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export async function cerrarSesion(): Promise<void> {
  await api.post('/auth/logout')
}

export async function obtenerPerfil(): Promise<UserPublic> {
  const res = await api.get<UserPublic>('/auth/me')
  return res.data
}
