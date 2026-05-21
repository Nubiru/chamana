import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../access.ts';
import { autoSlug } from '../hooks/auto-slug.ts';
import { autoStock } from '../hooks/auto-stock.ts';
import { autoVarianteId } from '../hooks/auto-variante-id.ts';
import { modelosStateMachine } from '../hooks/modelos-state-machine.ts';

export const Modelos: CollectionConfig = {
  slug: 'modelos',
  labels: { singular: 'Modelo', plural: 'Modelos' },
  admin: {
    group: 'Catalogo',
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'tipo', 'detalle', 'featured', 'estado'],
    listSearchableFields: ['nombre', 'slug', 'tipo'],
    description: 'Modelos de prendas de la marca',
  },
  hooks: {
    beforeChange: [autoStock, modelosStateMachine],
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
          hooks: {
            beforeValidate: [autoVarianteId],
          },
          admin: {
            placeholder: 'hechizo-linmenchoc',
            description:
              'Se genera automaticamente del slug del modelo + codigos de tela. Dejar vacio para autogenerar. CRITICO: no cambiar despues de publicar (clave del carrito)',
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
          name: 'metrosRequeridos',
          type: 'number',
          label: 'Metros requeridos por unidad',
          required: false,
          min: 0,
          max: 50,
          admin: {
            placeholder: '1.25',
            step: 0.05,
            description:
              'Cuantos metros de tela consume UNA unidad de esta variante (ej: XL Falda ~ 1.4 m). Decimal con 2 digitos. Opcional para variantes legacy; obligatorio para variantes nuevas a partir de la proxima Coleccion.',
          },
          validate: (value: number | null | undefined) => {
            if (value == null) return true;
            if (value < 0) return 'metros requeridos no puede ser negativo';
            if (value > 50) return 'metros requeridos no puede superar 50 (limite de seguridad)';
            return true;
          },
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
    // --- F-Variante-metrosRequeridos-Modelo-estado AC-3 ---
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'nueva',
      index: true,
      options: [
        { label: 'Nueva', value: 'nueva' },
        { label: 'En produccion', value: 'en_produccion' },
        { label: 'En stock', value: 'en_stock' },
        { label: 'Sin stock', value: 'sin_stock' },
        { label: 'Descontinuada', value: 'descontinuada' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Estado del ciclo de vida del Modelo. Nueva = idea/diseno; En produccion = taller la esta cosiendo; En stock = vendible; Sin stock = todas las variantes agotadas; Descontinuada = retirada terminal.',
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
};
