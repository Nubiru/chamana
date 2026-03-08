import type { GlobalConfig } from 'payload'
import { isAdmin, isPublic } from '../lib/payload/access.ts'

export const ContenidoInicio: GlobalConfig = {
  slug: 'contenido-inicio',
  label: 'Pagina de Inicio',
  admin: {
    group: 'Contenido',
    description: 'Textos y configuracion de la pagina principal',
  },
  fields: [
    {
      name: 'subtitulo',
      type: 'textarea',
      label: 'Subtitulo del hero',
      required: true,
      defaultValue:
        'Ropa femenina artesanal inspirada en la naturaleza. Prendas unicas confeccionadas a mano con telas nobles.',
    },
    {
      name: 'seccionEsencia',
      type: 'group',
      label: 'Seccion "Nuestra Esencia"',
      fields: [
        {
          name: 'titulo',
          type: 'text',
          label: 'Titulo',
          required: true,
          defaultValue: 'Nuestra Esencia',
        },
        {
          name: 'parrafos',
          type: 'array',
          label: 'Parrafos',
          fields: [
            {
              name: 'texto',
              type: 'textarea',
              label: 'Texto',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'seccionDestacados',
      type: 'group',
      label: 'Seccion Destacados',
      fields: [
        {
          name: 'titulo',
          type: 'text',
          label: 'Titulo',
          required: true,
          defaultValue: 'Destacados',
        },
        {
          name: 'descripcion',
          type: 'textarea',
          label: 'Descripcion',
        },
      ],
    },
    {
      name: 'seccionColeccion',
      type: 'group',
      label: 'Seccion Coleccion Completa',
      fields: [
        {
          name: 'titulo',
          type: 'text',
          label: 'Titulo',
          required: true,
          defaultValue: 'Coleccion Completa',
        },
        {
          name: 'subtitulo',
          type: 'text',
          label: 'Subtitulo',
        },
        {
          name: 'descripcion',
          type: 'textarea',
          label: 'Descripcion',
        },
      ],
    },
  ],
  access: {
    read: isPublic,
    update: isAdmin,
  },
}
