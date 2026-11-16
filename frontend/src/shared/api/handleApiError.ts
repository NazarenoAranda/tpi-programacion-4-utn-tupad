import { isAxiosError } from 'axios'

interface ErrorDetalle {
  msg: string
  loc?: (string | number)[]
}

interface ApiErrorBody {
  detail?: string | ErrorDetalle[]
}

/** Convierte el `detail` de la API (o un error de red) en un mensaje para mostrar. */
export function handleApiError(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.'
    const detail = error.response.data?.detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          const campo = d.loc?.filter((p) => p !== 'body').join('.')
          return campo ? `${campo}: ${d.msg}` : d.msg
        })
        .join(' · ')
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}
