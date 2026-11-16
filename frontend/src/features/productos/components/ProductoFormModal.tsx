import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useActualizarProducto, useCrearProducto } from '../hooks/useProductos'
import { handleApiError } from '../../../shared/api/handleApiError'
import { fieldError } from '../../../shared/utils/forms'
import { Button } from '../../../shared/ui/Button'
import { CONTROL_CLASES, Field, Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'
import type { Producto } from '../types'

interface Props {
  producto?: Producto
  onClose: () => void
}

export function ProductoFormModal({ producto, onClose }: Props) {
  const editando = producto !== undefined
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const [errorApi, setErrorApi] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : '',
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null)
      const data = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }
      try {
        if (editando) await actualizar.mutateAsync({ id: producto.id, data })
        else await crear.mutateAsync(data)
        onClose()
      } catch (e) {
        setErrorApi(handleApiError(e))
      }
    },
  })

  return (
    <Modal open onClose={onClose} title={editando ? 'Editar producto' : 'Nuevo producto'}>
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
              if (n > 150) return 'Máximo 150 caracteres'
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
          name="categoria_id"
          validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}
        >
          {(field) => (
            <Field label="Categoría" error={fieldError(field)}>
              <select
                className={CONTROL_CLASES}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              >
                <option value="">Seleccionar…</option>
                {categorias.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => {
                if (value.trim() === '' || Number.isNaN(Number(value))) return 'Ingresá un precio'
                if (Number(value) < 0) return 'Debe ser mayor o igual a 0'
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                label="Precio base"
                type="number"
                min={0}
                step="0.01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={fieldError(field)}
              />
            )}
          </form.Field>

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
        </div>

        <form.Field
          name="imagen_url"
          validators={{
            onChange: ({ value }) =>
              value.trim() === '' || /^https?:\/\//i.test(value.trim())
                ? undefined
                : 'Debe empezar con http:// o https://',
          }}
        >
          {(field) => (
            <Input
              label="URL de la imagen (opcional)"
              placeholder="https://…"
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
