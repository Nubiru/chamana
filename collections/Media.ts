import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/payload/access.ts';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Medio', plural: 'Medios' },
  admin: {
    group: 'Sistema',
  },
  upload: {
    mimeTypes: ['image/webp', 'image/jpeg', 'image/png'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 200,
        height: 200,
        position: 'centre',
      },
      {
        name: 'card',
        width: 600,
        height: 800,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1200,
        height: 1200,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      required: true,
    },
  ],
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
};
