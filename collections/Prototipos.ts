import type { CollectionConfig } from 'payload'
import { isAdmin } from '../lib/payload/access.ts'

export const Prototipos: CollectionConfig = {
  slug: 'prototipos',
  labels: { singular: 'Prototipo', plural: 'Prototipos' },
  admin: {
    group: 'Taller',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'tipo', 'estado', 'createdAt'],
    description: 'Ideas y prototipos de prendas — captura rapida',
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre de trabajo',
      required: true,
      admin: {
        placeholder: 'Campera larga con capucha',
        description: 'Nombre provisional, puede cambiar',
      },
    },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo de prenda',
      options: [
        // Coleccion Magia
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
        // Coleccion Transmutacion
        { label: 'Campera', value: 'Campera' },
        { label: 'Chaleco', value: 'Chaleco' },
        { label: 'Sweater', value: 'Sweater' },
        { label: 'Remera', value: 'Remera' },
        { label: 'Poncho', value: 'Poncho' },
        { label: 'Tapado', value: 'Tapado' },
        { label: 'Bufanda', value: 'Bufanda' },
        { label: 'Chalina', value: 'Chalina' },
      ],
    },
    {
      name: 'boceto',
      type: 'upload',
      relationTo: 'media',
      label: 'Boceto o foto',
      admin: {
        description: 'Dibujo, foto de referencia, o captura de inspiracion',
      },
    },
    {
      name: 'telasIdea',
      type: 'relationship',
      relationTo: 'telas',
      hasMany: true,
      label: 'Telas posibles',
      admin: {
        description: 'Telas que podrian funcionar para este prototipo',
      },
    },
    {
      name: 'coleccion',
      type: 'relationship',
      relationTo: 'colecciones',
      label: 'Coleccion destino',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'inspiracion',
      type: 'textarea',
      label: 'Inspiracion / Notas',
      admin: {
        description: 'De donde viene la idea, que queres transmitir, notas libres',
      },
    },
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'idea',
      options: [
        { label: 'Idea', value: 'idea' },
        { label: 'En desarrollo', value: 'en-desarrollo' },
        { label: 'Aprobado', value: 'aprobado' },
        { label: 'Descartado', value: 'descartado' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
}
