import { Link } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'

export function UnauthorizedPage({ noEncontrada = false }: { noEncontrada?: boolean }) {
  return (
    <div className="mx-auto max-w-lg py-10">
      <EstadoVacio
        icono={noEncontrada ? '🧭' : '🔒'}
        titulo={noEncontrada ? 'Página no encontrada' : 'No tenés permiso para ver esta página'}
        descripcion={
          noEncontrada
            ? 'La dirección que buscás no existe.'
            : 'Esta sección es solo para administradores.'
        }
        accion={
          <Link to="/">
            <Button>Volver al inicio</Button>
          </Link>
        }
      />
    </div>
  )
}
