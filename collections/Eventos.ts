import type { CollectionConfig } from 'payload'
import { isAdmin, isPublic } from '../lib/payload/access.ts'

export const Eventos: CollectionConfig = {
  slug: 'eventos',
  labels: { singular: 'Evento', plural: 'Eventos' },
  admin: {
    group: 'Taller',
    useAsTitle: 'title',
    defaultColumns: ['title', 'displayDate', 'location'],
    description: 'Desfiles, ferias y eventos de la marca',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titulo',
      required: true,
    },
    {
      name: 'displayDate',
      type: 'text',
      label: 'Fecha (para mostrar)',
      required: true,
      admin: {
        placeholder: 'Enero 2026',
        description: 'Texto de fecha para mostrar (ej: Enero 2026)',
      },
    },
    {
      name: 'date',
      type: 'date',
      label: 'Fecha real',
      admin: {
        position: 'sidebar',
        description: 'Fecha exacta del evento (para ordenar)',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Lugar',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descripcion',
      required: true,
    },
    {
      name: 'images',
      type: 'array',
      label: 'Galeria de fotos',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Foto',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Descripcion de la foto',
          required: true,
          admin: {
            placeholder: 'Desfile CHAMANA en Utopia - foto 1',
          },
        },
      ],
    },
  ],
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
}
