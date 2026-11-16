import axios, { isAxiosError } from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // el navegador adjunta la cookie HttpOnly; el token nunca pasa por JS
})

// Evita una dependencia circular: el authStore se registra a sí mismo acá.
let onSessionLost: (() => void) | null = null
export function registerSessionLostHandler(handler: () => void): void {
  onSessionLost = handler
}

const RUTAS_DE_SESION = ['/auth/token', '/auth/me']

interface DetailBody {
  detail?: unknown
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError<DetailBody>(error) && error.response) {
      const { status, data } = error.response
      const url = error.config?.url ?? ''
      const esRutaDeSesion = RUTAS_DE_SESION.some((r) => url.includes(r))
      const cuentaDesactivada = status === 400 && data?.detail === 'Cuenta de usuario desactivada'
      if ((status === 401 && !esRutaDeSesion) || cuentaDesactivada) {
        // Se limpia el authStore; la vuelta a /login la hace ProtectedRoute al quedar sin usuario.
        onSessionLost?.()
      }
    }
    return Promise.reject(error)
  },
)
