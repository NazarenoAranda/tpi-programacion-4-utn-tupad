import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { handleApiError } from '../../../shared/api/handleApiError'
import { fieldError } from '../../../shared/utils/forms'
import { Button } from '../../../shared/ui/Button'
import { CONTROL_CLASES, Field, Input } from '../../../shared/ui/Input'
import type { FormaPago } from '../types'

interface CheckoutValues {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string
}

interface CheckoutFormProps {
  onSubmit: (values: CheckoutValues) => Promise<void>
}

export type { CheckoutValues }

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO', notas: '' } as CheckoutValues,
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await onSubmit(value)
      } catch (e) {
        setErrorApi(handleApiError(e))
      }
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const v = value.trim().length
            if (v < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (v > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            placeholder="Calle, número, piso, ciudad"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={fieldError(field)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Field label="Forma de pago">
            <select
              className={CONTROL_CLASES}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value as FormaPago)}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </Field>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{
          onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined),
        }}
      >
        {(field) => (
          <Field label="Notas (opcional)" error={fieldError(field)}>
            <textarea
              rows={3}
              className={CONTROL_CLASES}
              placeholder="Ej.: tocar timbre 2B, sin cebolla…"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </Field>
        )}
      </form.Field>

      {errorApi && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorApi}
        </p>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Confirmando…' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
