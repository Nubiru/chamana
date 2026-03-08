import type { CollectionConfig } from 'payload';
import { isAdmin } from '../lib/payload/access.ts';
import { ventasStateMachine } from '../lib/payload/hooks/ventas-state-machine.ts';

export const Ventas: CollectionConfig = {
  slug: 'ventas',
  hooks: {
    beforeChange: [ventasStateMachine],
  },
  labels: { singular: 'Venta', plural: 'Ventas' },
  admin: {
    group: 'Ventas',
    useAsTitle: 'compradora',
    defaultColumns: ['compradora', 'modelo', 'variante', 'precio', 'estado', 'fechaVenta'],
    listSearchableFields: ['compradora', 'notas'],
    description: 'Registro de ventas realizadas',
  },
  fields: [
    {
      name: 'compradora',
      type: 'text',
      label: 'Compradora',
      required: true,
      admin: {
        description: 'Nombre de la clienta',
      },
    },
    {
      name: 'contacto',
      type: 'text',
      label: 'Contacto',
      admin: {
        description: 'Telefono, Instagram o email de la compradora',
      },
    },
    {
      name: 'modelo',
      type: 'relationship',
      relationTo: 'modelos',
      label: 'Modelo',
      required: true,
      admin: {
        description: 'Prenda vendida',
      },
    },
    {
      name: 'variante',
      type: 'text',
      label: 'Variante',
      required: true,
      admin: {
        placeholder: 'hechizo-linmarmalv',
        description: 'ID de la variante vendida (ej: hechizo-linmarmalv)',
      },
    },
    {
      name: 'precio',
      type: 'number',
      label: 'Precio de venta',
      required: true,
      min: 0,
      admin: {
        description: 'Precio real cobrado (en pesos)',
      },
    },
    {
      name: 'medioPago',
      type: 'select',
      label: 'Medio de pago',
      options: [
        { label: 'Mercado Pago', value: 'mercadopago' },
        { label: 'Transferencia', value: 'transferencia' },
        { label: 'Efectivo', value: 'efectivo' },
      ],
    },
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'pendiente',
      options: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Pagada', value: 'pagada' },
        { label: 'Enviada', value: 'enviada' },
        { label: 'Entregada', value: 'entregada' },
        { label: 'Cancelada', value: 'cancelada' },
      ],
    },
    {
      name: 'fechaVenta',
      type: 'date',
      label: 'Fecha de venta',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'fechaEnvio',
      type: 'date',
      label: 'Fecha de envio',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'metodoEnvio',
      type: 'select',
      label: 'Metodo de envio',
      options: [
        { label: 'Correo', value: 'correo' },
        { label: 'En mano', value: 'en-mano' },
        { label: 'Combi', value: 'combi' },
      ],
    },
    {
      name: 'notas',
      type: 'textarea',
      label: 'Notas',
      admin: {
        description: 'Notas internas sobre la venta',
      },
    },
    {
      name: 'coleccion',
      type: 'relationship',
      relationTo: 'colecciones',
      label: 'Coleccion',
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
};
