import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/payload/access.ts';

export const Telas: CollectionConfig = {
  slug: 'telas',
  labels: { singular: 'Tela', plural: 'Telas' },
  admin: {
    group: 'Catalogo',
    useAsTitle: 'nombre',
    defaultColumns: ['codigo', 'tipo', 'subtipo', 'color', 'colorHex'],
    listSearchableFields: ['codigo', 'tipo', 'color'],
    description: 'Telas y materiales disponibles para las prendas',
  },
  fields: [
    {
      name: 'codigo',
      type: 'text',
      label: 'Codigo',
      required: true,
      unique: true,
      index: true,
      admin: {
        placeholder: 'LinMarCho',
        description: 'Codigo interno unico (ej: LinSpanBei, RibNegro)',
      },
    },
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre de la tela',
      required: true,
      admin: {
        placeholder: 'Jersey Peinado 20/1',
        description: 'Nombre comercial o descriptivo',
      },
    },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo de tela',
      required: true,
      options: [
        // Coleccion Magia
        { label: 'Lino', value: 'Lino' },
        { label: 'Tejido', value: 'Tejido' },
        { label: 'Ribb', value: 'Ribb' },
        { label: 'Gabardina', value: 'Gabardina' },
        { label: 'Tusor', value: 'Tusor' },
        { label: 'Fibrana', value: 'Fibrana' },
        // Coleccion Transmutacion
        { label: 'Jersey', value: 'Jersey' },
        { label: 'Boucle', value: 'Boucle' },
        { label: 'Jacquard', value: 'Jacquard' },
        { label: 'Pana (Corderoy)', value: 'Pana' },
        { label: 'Fieltro / Pano', value: 'Fieltro' },
        { label: 'Malla / Open-weave', value: 'Malla' },
        { label: 'Algodon liso', value: 'Algodon' },
      ],
    },
    {
      name: 'subtipo',
      type: 'text',
      label: 'Subtipo / Linea',
      admin: {
        placeholder: 'Marruecos',
        description: 'Variedad de la tela (ej: Spandex, Men, Marruecos, New York)',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Color',
      required: true,
      admin: {
        placeholder: 'Verde Malva',
      },
    },
    {
      name: 'colorHex',
      type: 'text',
      label: 'Color HEX',
      required: true,
      admin: {
        placeholder: '#8B6F8B',
        description: 'Codigo hexadecimal del color para la muestra visual',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return 'Debe ser un color HEX valido (ej: #1A1A1A)';
        }
        return true;
      },
    },
    {
      name: 'detalle',
      type: 'textarea',
      label: 'Detalle / Descripcion',
      admin: {
        description: 'Textura, caida, sensacion al tacto, composicion',
      },
    },
    {
      name: 'imagen',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto de la tela',
      admin: {
        description: 'Foto del rollo o muestra de tela',
      },
    },
    {
      name: 'proveedor',
      type: 'text',
      label: 'Proveedor',
      admin: {
        placeholder: 'Algodones.dif',
      },
    },
    // --- GRUPO: Inventario ---
    {
      type: 'row',
      fields: [
        {
          name: 'precioPorMetro',
          type: 'number',
          label: 'Precio por metro ($)',
          min: 0,
          admin: {
            width: '33%',
            placeholder: '2500',
            description: 'Precio en pesos por metro',
          },
        },
        {
          name: 'metrosComprados',
          type: 'number',
          label: 'Metros comprados',
          min: 0,
          admin: {
            width: '33%',
            placeholder: '10',
          },
        },
        {
          name: 'metrosUsados',
          type: 'number',
          label: 'Metros usados',
          min: 0,
          defaultValue: 0,
          admin: {
            width: '33%',
          },
        },
      ],
    },
    {
      name: 'fechaCompra',
      type: 'date',
      label: 'Fecha de compra',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'coleccion',
      type: 'relationship',
      relationTo: 'colecciones',
      label: 'Coleccion',
      admin: {
        position: 'sidebar',
        description: 'A que coleccion pertenece esta tela',
      },
    },
  ],
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
};
