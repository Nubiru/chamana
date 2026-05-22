import type { CollectionConfig } from 'payload';
import { isAdmin } from '../access.ts';

/**
 * Recados — the Daniela→equipo message channel (O-17 §3, G-36).
 *
 * A *recado* (Río-de-la-Plata for "a note you leave someone") is one small
 * domain record: a message Daniela leaves the team — written by Cleo when she
 * says "decile a Gabriel que…", or typed by Daniela directly in this admin.
 *
 * Why this is the whole channel (O-17): the prod Neon DB is already the shared
 * substrate, so a Daniela→team message needs NO message bus / queue / sync
 * infra — it is just one more collection. The READ side is already free via the
 * bridge's generic `query` verb (`estado=nuevo`); the only genuinely-new code is
 * the bridge `recado` WRITE verb. The `estado` light state-machine
 * (nuevo→visto→resuelto) mirrors the publicaciones HITL review pattern Daniela
 * already knows (`Publicaciones.ts` `estado`).
 *
 * Simple-for-Daniela (Pillar 7): the main panel is a single message box; all the
 * meta (de / para / estado / prioridad / origen + the optional link) lives in the
 * sidebar, so leaving a recado is "one easy message", not a form.
 *
 * Engine-independent: works whether Cleo is C2 (Gabriel-operated) or C3
 * (admin-embedded) — it is just Payload + the bridge.
 */
export const Recados: CollectionConfig = {
  slug: 'recados',
  labels: { singular: 'Recado', plural: 'Recados' },
  admin: {
    group: 'Equipo',
    useAsTitle: 'mensaje',
    defaultColumns: ['mensaje', 'de', 'para', 'estado', 'prioridad', 'createdAt'],
    listSearchableFields: ['mensaje'],
    description: 'Mensajes de Daniela al equipo — Cleo o vos pueden dejar un recado',
  },
  fields: [
    {
      name: 'mensaje',
      type: 'textarea',
      label: 'Mensaje',
      required: true,
      admin: {
        description: 'Escribi el recado en una frase — que querés decirle al equipo',
      },
    },
    {
      name: 'de',
      type: 'select',
      label: 'De',
      required: true,
      defaultValue: 'daniela',
      options: [
        { label: 'Daniela', value: 'daniela' },
        { label: 'Cleo', value: 'cleo' },
        { label: 'Gabriel', value: 'gabriel' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'para',
      type: 'select',
      label: 'Para',
      required: true,
      defaultValue: 'gabriel',
      options: [
        { label: 'Gabriel', value: 'gabriel' },
        { label: 'Daniela', value: 'daniela' },
        { label: 'Equipo', value: 'equipo' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'estado',
      type: 'select',
      label: 'Estado',
      required: true,
      defaultValue: 'nuevo',
      index: true,
      options: [
        { label: 'Nuevo', value: 'nuevo' },
        { label: 'Visto', value: 'visto' },
        { label: 'Resuelto', value: 'resuelto' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Nuevo → Visto → Resuelto (cierra el recado)',
      },
    },
    {
      name: 'prioridad',
      type: 'select',
      label: 'Prioridad',
      defaultValue: 'normal',
      options: [
        { label: 'Baja', value: 'baja' },
        { label: 'Normal', value: 'normal' },
        { label: 'Alta', value: 'alta' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'creadoVia',
      type: 'select',
      label: 'Origen',
      defaultValue: 'admin-ui',
      options: [
        { label: 'Cleo', value: 'cleo' },
        { label: 'Admin', value: 'admin-ui' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Como se creo este recado',
      },
    },
    {
      name: 'relacion',
      type: 'relationship',
      relationTo: ['modelos', 'ventas', 'telas', 'publicaciones'],
      label: 'Relacionado con',
      admin: {
        position: 'sidebar',
        description: 'Opcional: el modelo, venta, tela o publicacion del que habla el recado',
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
