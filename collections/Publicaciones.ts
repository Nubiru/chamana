import type { CollectionConfig } from 'payload';
import { isAdmin } from '../lib/payload/access.ts';

export const Publicaciones: CollectionConfig = {
  slug: 'publicaciones',
  labels: { singular: 'Publicacion', plural: 'Publicaciones' },
  admin: {
    group: 'Contenido',
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'estado', 'plataforma', 'fechaProgramada'],
    description: 'Contenido para redes sociales — revision con Cintia',
  },
  fields: [
    // What
    {
      name: 'titulo',
      type: 'text',
      label: 'Titulo',
      required: true,
    },
    {
      name: 'imagen',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Caption',
    },
    {
      name: 'hashtags',
      type: 'textarea',
      label: 'Hashtags',
    },

    // When / Where
    {
      name: 'plataforma',
      type: 'select',
      label: 'Plataforma',
      options: [
        { label: 'Instagram Feed', value: 'instagram-feed' },
        { label: 'Instagram Story', value: 'instagram-story' },
        { label: 'Instagram Reel', value: 'instagram-reel' },
        { label: 'Pinterest', value: 'pinterest' },
      ],
    },
    {
      name: 'fechaProgramada',
      type: 'date',
      label: 'Fecha programada',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },

    // Review
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'pendiente',
      options: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Aceptado', value: 'aceptado' },
        { label: 'Necesita Cambio', value: 'necesita-cambio' },
        { label: 'Rechazado', value: 'rechazado' },
      ],
    },
    {
      name: 'notasCintia',
      type: 'textarea',
      label: 'Notas de Cintia',
      admin: {
        description: 'Cintia: escribi aca que cambios necesitas',
      },
    },

    // Organization
    {
      name: 'coleccion',
      type: 'relationship',
      relationTo: 'colecciones',
      label: 'Coleccion',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'semana',
      type: 'text',
      label: 'Semana',
      admin: {
        position: 'sidebar',
        placeholder: 'Semana 1',
      },
    },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo de contenido',
      admin: {
        position: 'sidebar',
      },
      options: [
        { label: 'Naturaleza', value: 'naturaleza' },
        { label: 'Teaser', value: 'teaser' },
        { label: 'Product Reveal', value: 'product-reveal' },
        { label: 'Behind the Scenes', value: 'bts' },
        { label: 'Brand Story', value: 'brand-story' },
        { label: 'Anticipacion', value: 'anticipacion' },
      ],
    },
  ],
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
};
