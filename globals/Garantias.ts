import type { GlobalConfig } from 'payload'
import { isAdmin, isPublic } from '../lib/payload/access.ts'

export const Garantias: GlobalConfig = {
  slug: 'garantias',
  label: 'Garantias',
  admin: {
    group: 'Contenido',
    description: 'Garantias de compra que se muestran en las paginas de producto',
  },
  fields: [
    {
      name: 'garantias',
      type: 'array',
      label: 'Garantias',
      required: true,
      fields: [
        {
          name: 'nombre',
          type: 'text',
          label: 'Nombre interno',
          required: true,
        },
        {
          name: 'titulo',
          type: 'text',
          label: 'Titulo visible',
          required: true,
        },
        {
          name: 'descripcion',
          type: 'text',
          label: 'Descripcion corta',
          required: true,
        },
        {
          name: 'detalle',
          type: 'textarea',
          label: 'Detalle completo',
          required: true,
        },
        {
          name: 'iconName',
          type: 'select',
          label: 'Icono',
          required: true,
          options: [
            { label: 'Flechas (cambio)', value: 'Repeat' },
            { label: 'Escudo (garantia)', value: 'ShieldCheck' },
            { label: 'Tijeras (costura)', value: 'Scissors' },
            { label: 'Corazon', value: 'Heart' },
            { label: 'Estrella', value: 'Star' },
          ],
        },
      ],
    },
  ],
  access: {
    read: isPublic,
    update: isAdmin,
  },
}
