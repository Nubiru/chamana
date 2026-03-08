import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField, isAdminOrSelf } from '../lib/payload/access.ts'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    group: 'Sistema',
    useAsTitle: 'nombre',
  },
  auth: true,
  fields: [
    {
      name: 'nombre',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administradora', value: 'admin' },
        { label: 'Editora', value: 'editor' },
      ],
      access: {
        update: isAdminField,
      },
    },
  ],
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
}
