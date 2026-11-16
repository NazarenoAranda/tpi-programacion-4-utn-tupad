import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { Rol } from '../features/auth/types'

interface ProtectedRouteProps {
  /** Roles permitidos. Si se omite, alcanza con tener sesión. */
  roles?: Rol[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) {
    return (
      <div role="status" className="flex min-h-[40vh] items-center justify-center text-sm text-stone-500">
        Verificando sesión…
      </div>
    )
  }
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
