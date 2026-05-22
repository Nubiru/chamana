import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../access.ts';
import { autoSlug } from '../hooks/auto-slug.ts';
import { autoStock } from '../hooks/auto-stock.ts';
import { autoVarianteId } from '../hooks/auto-variante-id.ts';
import { modelosStateMachine } from '../hooks/modelos-state-machine.ts';
import { makeRevalidateHook } from '../hooks/revalidate-storefront.ts';

// F-storefront-freshness AC-3 — a Modelo edit/delete is the highest-freshness path
// (covers the sale cascade too: ventasStockSync payload.update's modelos → this fires).
const revalidateModelos = makeRevalidateHook([
  '/',
  '/tienda',
  ['/producto/[slug]', 'page'],
  ['/colecciones/[slug]', 'page'],
]);

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
    afterChange: [revalidateModelos],
    afterDelete: [revalidateModelos],
  },
  fields: [
    // G-35 (O-16 §4a item 2): de-scroll the 23-field form into 2 deliberate panes.
    // UNNAMED tabs (label-only) → purely presentational, the data shape is unchanged
    // (no field renamed/nested in the DB → no migration). Sidebar-positioned fields
    // stay at the top level below (Payload only honors position:'sidebar' there).
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basico',
          description: 'Identidad del modelo: nombre, tipo, descripcion e imagenes.',
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
          ],
        },
        {
          label: 'Variantes',
          description: 'Combinaciones de tela, precio y stock disponibles para este modelo.',
          fields: [
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
                // G-35 (O-16 §4a item 3): collapse the rarely-touched price/costing fields
                // behind an initially-collapsed pane so `precio` stays prominent at create.
                // UNNAMED collapsible → presentational only, the field names/data are unchanged.
                {
                  type: 'collapsible',
                  label: 'Precio avanzado',
                  admin: {
                    initCollapsed: true,
                    description: 'Descuentos y costo de tela (opcional)',
                  },
                  fields: [
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
                        if (value > 50)
                          return 'metros requeridos no puede superar 50 (limite de seguridad)';
                        return true;
                      },
                    },
                  ],
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
                    // G-35 (O-16 §4a item 1 — the #1 cheap win + DATA-TRUTH footgun closure):
                    // stockVendido is hook-managed (ventas-stock-sync writes `current + delta`).
                    // readOnly removes the "useless" editable field AND prevents a hand-edit from
                    // becoming the sync hook's new arithmetic base → silent stock drift.
                    {
                      name: 'stockVendido',
                      type: 'number',
                      label: 'Unidades vendidas',
                      min: 0,
                      defaultValue: 0,
                      admin: {
                        width: '33%',
                        readOnly: true,
                        description:
                          'Solo lectura. Lo gestiona el sistema automaticamente al registrar ventas (hook ventasStockSync). No editar a mano.',
                      },
                    },
                    // G-35 (O-16 §4a item 1): sinStock is hook-managed (auto-stock recomputes it
                    // from stockVendido >= stockTotal). readOnly so it cannot be hand-toggled out
                    // of sync with the computed truth.
                    {
                      name: 'sinStock',
                      type: 'checkbox',
                      label: 'Sin stock',
                      defaultValue: false,
                      admin: {
                        width: '33%',
                        readOnly: true,
                        description:
                          'Solo lectura. Se marca automaticamente cuando vendidos >= producidos (hook autoStock).',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
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
