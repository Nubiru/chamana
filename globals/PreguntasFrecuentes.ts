import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/payload/access.ts';

const TIPOS_PRENDA = [
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
];

export const PreguntasFrecuentes: GlobalConfig = {
  slug: 'preguntas-frecuentes',
  label: 'Preguntas Frecuentes',
  admin: {
    group: 'Contenido',
    description: 'Preguntas y respuestas que aparecen en la tienda y paginas de producto',
  },
  fields: [
    {
      name: 'faqs',
      type: 'array',
      label: 'Preguntas',
      required: true,
      fields: [
        {
          name: 'pregunta',
          type: 'text',
          label: 'Pregunta',
          required: true,
        },
        {
          name: 'respuesta',
          type: 'textarea',
          label: 'Respuesta',
          required: true,
        },
        {
          name: 'global',
          type: 'checkbox',
          label: 'Mostrar en todas las prendas',
          defaultValue: true,
          admin: {
            description: 'Si esta marcado, aparece en todas las paginas de producto',
          },
        },
        {
          name: 'categorias',
          type: 'select',
          label: 'Categorias especificas',
          hasMany: true,
          options: TIPOS_PRENDA,
          admin: {
            description: 'Si no es global, seleccionar en que tipos de prenda mostrar',
            condition: (_data, siblingData) => !siblingData?.global,
          },
        },
      ],
    },
  ],
  access: {
    read: isPublic,
    update: isAdmin,
  },
};
