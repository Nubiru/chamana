import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/payload/access.ts';

export const ConfiguracionSitio: GlobalConfig = {
  slug: 'configuracion-sitio',
  label: 'Configuracion del Sitio',
  admin: {
    group: 'Configuracion',
    description: 'Ajustes generales del sitio web',
  },
  fields: [
    {
      name: 'nombreMarca',
      type: 'text',
      label: 'Nombre de la marca',
      required: true,
      defaultValue: 'CHAMANA',
    },
    {
      name: 'descripcionMarca',
      type: 'textarea',
      label: 'Descripcion de la marca',
      required: true,
      defaultValue:
        'Ropa femenina artesanal inspirada en la naturaleza. Prendas unicas confeccionadas a mano con telas nobles.',
      admin: {
        description: 'Descripcion corta para SEO y redes sociales',
      },
    },
    {
      name: 'whatsappNumero',
      type: 'text',
      label: 'Numero de WhatsApp',
      required: true,
      defaultValue: '542215475727',
      admin: {
        description: 'Numero con codigo de pais, sin + ni espacios (ej: 542215475727)',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        if (!/^\d{10,15}$/.test(value)) {
          return 'Debe ser un numero de 10-15 digitos sin espacios ni simbolos';
        }
        return true;
      },
    },
    {
      name: 'whatsappMensajeGeneral',
      type: 'text',
      label: 'Mensaje de WhatsApp general',
      defaultValue: 'Hola! Quiero consultar sobre la Coleccion Magia de CHAMANA 🌿',
      admin: {
        description: 'Mensaje predeterminado al hacer click en WhatsApp',
      },
    },
    {
      name: 'instagramHandle',
      type: 'text',
      label: 'Instagram',
      defaultValue: '@chamanasomostodas',
    },
    {
      name: 'instagramUrl',
      type: 'text',
      label: 'URL de Instagram',
      defaultValue: 'https://www.instagram.com/chamanasomostodas',
    },
    {
      name: 'siteUrl',
      type: 'text',
      label: 'URL del sitio',
      required: true,
      defaultValue: 'https://chamana.app',
      admin: {
        description: 'URL publica del sitio (para SEO y Open Graph)',
      },
    },
  ],
  access: {
    read: isPublic,
    update: isAdmin,
  },
};
