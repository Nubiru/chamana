import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../access.ts';
import { makeRevalidateHook } from '../hooks/revalidate-storefront.ts';
import { telasStateMachine } from '../hooks/telas-state-machine.ts';

// F-storefront-freshness AC-3 — a tela (color/name) edit changes how variants render
// across the catalog + product pages (variants are tela combinations).
const revalidateTelas = makeRevalidateHook(['/', '/tienda', ['/producto/[slug]', 'page']]);

export const Telas: CollectionConfig = {
  slug: 'telas',
  labels: { singular: 'Tela', plural: 'Telas' },
  hooks: {
    beforeChange: [telasStateMachine],
    afterChange: [revalidateTelas],
    afterDelete: [revalidateTelas],
  },
  admin: {
    group: 'Catalogo',
    useAsTitle: 'nombre',
    defaultColumns: ['codigo', 'tipo', 'subtipo', 'color', 'colorHex', 'estado'],
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
          // G-20 / ADR-003 §12 ERRATA-1 §7.1: value-preserving RENAME of the
          // former `precioPorMetro` to cost-not-price semantics (ADR-003 §0:
          // this is an internal cost input + price-floor check, NOT the sale
          // price, which lives on Variante.precio). DB column renamed by
          // migration 20260521_040000 (value-preserving RENAME COLUMN).
          name: 'costoPorMetro',
          type: 'number',
          label: 'Costo por metro (ARS)',
          min: 0,
          admin: {
            width: '33%',
            placeholder: '2500',
            description:
              'Costo de compra de la tela por metro (insumo interno para calcular costos y el piso de precio, NO el precio de venta al publico).',
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
    // --- GRUPO: Estado de aprovisionamiento (F-Telas-state-machine AC-1/2) ---
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'disponible',
      index: true,
      options: [
        { label: 'Disponible', value: 'disponible' },
        { label: 'Por agotarse', value: 'por_agotarse' },
        { label: 'Agotada', value: 'agotada' },
        { label: 'Pedida', value: 'pedida' },
        { label: 'Descontinuada', value: 'discontinuada' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Estado actual de la tela en el inventario',
      },
    },
    {
      name: 'leadTimeDias',
      type: 'number',
      label: 'Lead time (dias)',
      required: false,
      min: 0,
      max: 365,
      admin: {
        position: 'sidebar',
        description:
          'Solo aplica cuando estado = pedida. Dias desde pedido a proveedor hasta llegada.',
        step: 1,
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
