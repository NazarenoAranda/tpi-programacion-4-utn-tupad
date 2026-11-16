import { useEffect } from 'react'
import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Única llamada al servidor dentro de useEffect: confirma la sesión (cookie) al montar.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
