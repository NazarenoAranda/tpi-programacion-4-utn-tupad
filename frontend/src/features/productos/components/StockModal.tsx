import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useActualizarStock } from '../hooks/useProductos'
import { handleApiError } from '../../../shared/api/handleApiError'
import { fieldError } from '../../../shared/utils/forms'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import type { Producto } from '../types'

interface Props {
  producto: Producto
  onClose: () => void
}

/** Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock). */
export function StockModal({ producto, onClose }: Props) {
  const actualizar = useActualizarStock()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      try {
        await actualizar.mutateAsync({
          id: producto.id,
          data: { stock: Number(value.stock), disponible: value.disponible },
        })
        onClose()
      } catch (e) {
        setErrorApi(handleApiError(e))
      }
    },
  })

  return (
    <Modal open onClose={onClose} title={`Stock · ${producto.nombre}`}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value)
              if (value.trim() === '' || !Number.isInteger(n)) return 'Debe ser un número entero'
              if (n < 0) return 'Debe ser mayor o igual a 0'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min={0}
              step={1}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field)}
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-orange-600"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        {errorApi && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorApi}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variante="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Guardar'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}
