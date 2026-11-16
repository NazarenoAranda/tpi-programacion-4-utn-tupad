import type { InputHTMLAttributes, ReactNode } from 'react'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

/** Envoltorio común de campo: etiqueta, control y mensaje de error. */
export function Field({ label, error, hint, children }: FieldProps) {
  // El mensaje de error y la ayuda quedan FUERA del <label> para que no formen
  // parte del nombre accesible del campo.
  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-stone-700">{label}</span>
        {children}
      </label>
      {hint && !error && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  )
}

export const CONTROL_CLASES =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-2 focus:outline-orange-200 disabled:bg-stone-100'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      <input
        className={`${CONTROL_CLASES} ${error ? 'border-red-400' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  )
}
