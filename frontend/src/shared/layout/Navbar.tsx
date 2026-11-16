import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const linkClase = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/15 text-white' : 'text-stone-300 hover:bg-white/10 hover:text-white'
  }`

const ADMIN_LINKS = [
  { to: '/admin/resumen', label: 'Resumen' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/usuarios', label: 'Usuarios' },
]

export function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadItems = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0))

  const cerrarSesion = async () => {
    try {
      await logout()
    } finally {
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-stone-900 shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <NavLink to="/" className="mr-3 text-lg font-bold text-white">
            🍔 Food Store
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClase}>
              Catálogo
            </NavLink>
            <NavLink to="/carrito" className={linkClase}>
              Carrito
              {cantidadItems > 0 && (
                <span className="ml-1.5 rounded-full bg-orange-600 px-1.5 py-0.5 text-xs text-white">
                  {cantidadItems}
                </span>
              )}
            </NavLink>
            {usuario && (
              <NavLink to="/mis-pedidos" className={linkClase}>
                Mis pedidos
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <div className="text-sm font-medium text-white">{usuario.full_name}</div>
                <div className="text-xs text-stone-400">
                  {usuario.email} · {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
                </div>
              </div>
              <Button variante="secondary" tamano="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClase}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={linkClase}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>

      {usuario?.role === 'admin' && (
        <div className="border-t border-white/10 bg-stone-800">
          <nav
            aria-label="Panel de administración"
            className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-1.5"
          >
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-orange-400">Panel</span>
            {ADMIN_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClase}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
