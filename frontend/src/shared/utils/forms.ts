import type { AnyFieldApi } from '@tanstack/react-form'

/** Primer mensaje de error de un campo de TanStack Form (solo si ya fue tocado). */
export function fieldError(field: AnyFieldApi): string | undefined {
  if (!field.state.meta.isTouched) return undefined
  for (const err of field.state.meta.errors) {
    if (typeof err === 'string') return err
    if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
      return err.message
    }
  }
  return undefined
}
