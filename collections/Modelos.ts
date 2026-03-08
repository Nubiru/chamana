import type { CollectionConfig } from 'payload'
import { isAdmin, isPublic } from '../lib/payload/access.ts'
import { autoSlug } from '../lib/payload/hooks/auto-slug.ts'
import { autoStock } from '../lib/payload/hooks/auto-stock.ts'

export const Modelos: CollectionConfig = {
  slug: 'modelos',
  labels: { singular: 'Modelo', plural: 'Modelos' },
  admin: {
    group: 'Catalogo',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'tipo', 'detalle', 'featured'],
    listSearchableFields: ['nombre', 'slug', 'tipo'],
    description: 'Modelos de prendas de la marca',
  },
  hooks: {
    beforeChange: [autoStock],
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre del modelo',
      required: true,
      admin: {
        placeholder: 'Hechizo',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL amigable',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [autoSlug('nombre')],
      },
      admin: {
        position: 'sidebar',
        description:
          'Se genera automaticamente del nombre. NO cambiar despues de publicar (rompe links y carrito)',
      },
    },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo de prenda',
      required: true,
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
      name: 'detalle',
      type: 'text',
      label: 'Detalle',
      admin: {
        placeholder: 'Reversible',
        description: 'Caracteristica adicional (ej: Reversible, Oriental, Bolsillos)',
      },
    },
    {
      name: 'descripcion',
      type: 'textarea',
      label: 'Descripcion',
      required: true,
      maxLength: 500,
      admin: {
        description: 'Descripcion poetica del modelo para la tienda',
      },
    },
    {
      name: 'imagenes',
      type: 'array',
      label: 'Imagenes',
      admin: {
        description: 'Fotos del modelo. La primera imagen sera la portada',
      },
      fields: [
        {
          name: 'imagen',
          type: 'upload',
          relationTo: 'media',
          label: 'Imagen',
          required: true,
        },
      ],
    },
    {
      name: 'variantes',
      type: 'array',
      label: 'Variantes',
      admin: {
        description: 'Combinaciones de tela disponibles para este modelo',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'varianteId',
          type: 'text',
          label: 'ID de variante',
          required: true,
          admin: {
            placeholder: 'hechizo-linmenchoc',
            description:
              'Identificador unico. CRITICO: no cambiar despues de publicar (clave del carrito)',
          },
        },
        {
          name: 'tela1',
          type: 'relationship',
          relationTo: 'telas',
          label: 'Tela principal',
          required: true,
          admin: {
            description: 'Tela del lado A (o unica tela si no es reversible)',
          },
        },
        {
          name: 'tela2',
          type: 'relationship',
          relationTo: 'telas',
          label: 'Tela secundaria',
          admin: {
            description: 'Solo para prendas reversibles - Tela del lado B',
          },
        },
        {
          name: 'precio',
          type: 'number',
          label: 'Precio',
          min: 0,
          admin: {
            placeholder: '32000',
            description: 'Precio en pesos argentinos. Dejar vacio para "Consultar precio"',
          },
        },
        {
          name: 'precioAnterior',
          type: 'number',
          label: 'Precio anterior',
          min: 0,
          admin: {
            description: 'Precio antes del descuento (para mostrar tachado)',
          },
        },
        {
          name: 'descuento',
          type: 'number',
          label: 'Descuento %',
          min: 0,
          max: 100,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'stockTotal',
              type: 'number',
              label: 'Unidades producidas',
              min: 0,
              defaultValue: 0,
              admin: {
                width: '33%',
              },
            },
            {
              name: 'stockVendido',
              type: 'number',
              label: 'Unidades vendidas',
              min: 0,
              defaultValue: 0,
              admin: {
                width: '33%',
              },
            },
            {
              name: 'sinStock',
              type: 'checkbox',
              label: 'Sin stock',
              defaultValue: false,
              admin: {
                width: '33%',
                description: 'Se marca automaticamente cuando vendidos >= producidos',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'badge',
      type: 'text',
      label: 'Etiqueta',
      admin: {
        position: 'sidebar',
        placeholder: 'Nuevo',
        description: 'Etiqueta especial visible en la tarjeta (ej: Nuevo, Popular)',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Destacado',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mostrar en la seccion de destacados en la pagina principal',
      },
    },
    {
      name: 'coleccion',
      type: 'relationship',
      relationTo: 'colecciones',
      label: 'Coleccion',
      admin: {
        position: 'sidebar',
        description: 'Coleccion a la que pertenece este modelo',
      },
    },
    {
      name: 'bundleId',
      type: 'text',
      label: 'ID de Bundle',
      admin: {
        position: 'sidebar',
        description: 'Para agrupar modelos en combos/bundles (futuro)',
      },
    },
  ],
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
}
