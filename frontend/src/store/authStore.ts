import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { registerSessionLostHandler } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'
import { cerrarSesion, iniciarSesion, obtenerPerfil } from '../features/auth/api/auth'
import type { LoginCredentials, UserPublic } from '../features/auth/types'

interface AuthState {
  usuario: UserPublic | null
  cargando: boolean
  login: (credenciales: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (credenciales) => {
        await iniciarSesion(credenciales)
        const usuario = await obtenerPerfil()
        set({ usuario })
      },

      logout: async () => {
        try {
          await cerrarSesion()
        } finally {
          set({ usuario: null })
          queryClient.clear()
        }
      },

      // Se llama al montar la app: pregunta al backend si la cookie sigue vigente.
      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await obtenerPerfil()
          set({ usuario })
        } catch {
          set({ usuario: null })
        } finally {
          set({ cargando: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      // Solo se guarda el usuario (nombre, email, rol). Nunca el token: viaja en la cookie.
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

// Si la API responde 401 (sesión vencida) o "cuenta desactivada", se limpia la sesión.
registerSessionLostHandler(() => {
  useAuthStore.setState({ usuario: null })
})
