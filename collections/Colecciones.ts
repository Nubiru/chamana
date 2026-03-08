import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/payload/access.ts';
import { autoSlug } from '../lib/payload/hooks/auto-slug.ts';

export const Colecciones: CollectionConfig = {
  slug: 'colecciones',
  labels: { singular: 'Coleccion', plural: 'Colecciones' },
  admin: {
    group: 'Catalogo',
    useAsTitle: 'nombreCompleto',
    defaultColumns: ['nombre', 'temporada', 'anio', 'estado'],
    description: 'Colecciones de la marca (ej: Magia, Transmutacion)',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [autoSlug('nombre')],
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre',
      required: true,
      admin: {
        placeholder: 'Magia',
      },
    },
    {
      name: 'nombreCompleto',
      type: 'text',
      label: 'Nombre completo',
      required: true,
      admin: {
        placeholder: 'Coleccion Magia',
      },
    },
    {
      name: 'temporada',
      type: 'select',
      label: 'Temporada',
      required: true,
      options: [
        { label: 'Primavera-Verano', value: 'primavera-verano' },
        { label: 'Otono-Invierno', value: 'otono-invierno' },
      ],
    },
    {
      name: 'anio',
      type: 'number',
      label: 'Ano',
      required: true,
      min: 2024,
      max: 2030,
    },
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'planificacion',
      options: [
        { label: 'Planificacion', value: 'planificacion' },
        { label: 'Produccion', value: 'produccion' },
        { label: 'Activa', value: 'activa' },
        { label: 'Archivo', value: 'archivo' },
      ],
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: 'Descripcion',
      required: true,
    },
    {
      name: 'ejes',
      type: 'array',
      label: 'Ejes tematicos',
      fields: [
        {
          name: 'eje',
          type: 'text',
          label: 'Eje',
          required: true,
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
};
