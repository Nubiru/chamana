import type { GlobalConfig } from 'payload'
import { isAdmin, isPublic } from '../lib/payload/access.ts'

export const GuiaTalles: GlobalConfig = {
  slug: 'guia-talles',
  label: 'Guia de Talles',
  admin: {
    group: 'Contenido',
    description: 'Tabla de medidas por tipo de prenda',
  },
  fields: [
    {
      name: 'entradas',
      type: 'array',
      label: 'Medidas por tipo',
      required: true,
      fields: [
        {
          name: 'tipo',
          type: 'select',
          label: 'Tipo de prenda',
          required: true,
          options: [
            { label: 'Falda', value: 'Falda' },
            { label: 'Vestido', value: 'Vestido' },
            { label: 'Kimono', value: 'Kimono' },
            { label: 'Remeron', value: 'Remeron' },
            { label: 'Musculosa', value: 'Musculosa' },
            { label: 'Top', value: 'Top' },
            { label: 'Camisa', value: 'Camisa' },
            { label: 'Bermuda', value: 'Bermuda' },
            { label: 'Short', value: 'Short' },
            { label: 'Palazzo', value: 'Palazzo' },
          ],
        },
        {
          name: 'talleUnico',
          type: 'checkbox',
          label: 'Talle unico',
          defaultValue: true,
        },
        {
          name: 'medidas',
          type: 'array',
          label: 'Medidas',
          required: true,
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Medida',
              required: true,
              admin: {
                placeholder: 'Cintura (elastizada)',
              },
            },
            {
              name: 'valor',
              type: 'text',
              label: 'Valor',
              required: true,
              admin: {
                placeholder: '64 - 100 cm',
              },
            },
          ],
        },
        {
          name: 'notas',
          type: 'textarea',
          label: 'Notas',
          admin: {
            description: 'Nota adicional sobre este tipo de prenda',
          },
        },
      ],
    },
  ],
  access: {
    read: isPublic,
    update: isAdmin,
  },
}
