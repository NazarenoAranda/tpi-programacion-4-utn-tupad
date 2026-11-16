import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useActualizarCategoria, useCrearCategoria } from '../hooks/useCategorias'
import { handleApiError } from '../../../shared/api/handleApiError'
import { fieldError } from '../../../shared/utils/forms'
import { Button } from '../../../shared/ui/Button'
import { CONTROL_CLASES, Field, Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import type { Categoria } from '../types'

interface Props {
  categoria?: Categoria
  onClose: () => void
}

export function CategoriaFormModal({ categoria, onClose }: Props) {
  const editando = categoria !== undefined
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      const data = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }
      try {
        if (editando) await actualizar.mutateAsync({ id: categoria.id, data })
        else await crear.mutateAsync(data)
        onClose()
      } catch (e) {
        setErrorApi(handleApiError(e))
      }
    },
  })

  return (
    <Modal open onClose={onClose} title={editando ? 'Editar categoría' : 'Nueva categoría'}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const n = value.trim().length
              if (n < 2) return 'Mínimo 2 caracteres'
              if (n > 100) return 'Máximo 100 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              label="Nombre"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field)}
            />
          )}
        </form.Field>

        <form.Field
          name="descripcion"
          validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
        >
          {(field) => (
            <Field label="Descripción (opcional)" error={fieldError(field)}>
              <textarea
                rows={3}
                className={CONTROL_CLASES}
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
