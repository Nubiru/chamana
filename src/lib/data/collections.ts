// Collection data is owned by the Payload SoT (the `colecciones` collection). Read it through
// `@/payload/queries` (getColecciones / getColeccionBySlug / getModelosByColeccion).
// The former static `COLECCIONES` array + getCollectionBySlug + getActiveCollection were a dead
// parallel source (the G-30 anti-pattern, 2nd manifestation) and were removed (G-34 / AC-9).
// Only the type re-export remains.
export type { CollectionMeta } from '@/domain/catalog';
