import type { CollectionMeta } from '@/lib/domain/catalog';
export type { CollectionMeta } from '@/lib/domain/catalog';

export const COLECCIONES: CollectionMeta[] = [
  {
    slug: 'magia',
    nombre: 'Magia',
    nombreCompleto: 'Coleccion Magia',
    temporada: 'primavera-verano',
    anio: 2025,
    estado: 'activa',
    descripcion:
      'Primera coleccion de CHAMANA. 14 modelos inspirados en la intuicion, la naturaleza y lo sagrado femenino.',
    ejes: ['intuicion', 'naturaleza', 'sagrado femenino', 'magia'],
  },
  {
    slug: 'transmutacion',
    nombre: 'Transmutacion',
    nombreCompleto: 'Coleccion Transmutacion',
    temporada: 'otono-invierno',
    anio: 2026,
    estado: 'planificacion',
    descripcion:
      '18 prendas artesanales inspiradas en la transmutacion de la naturaleza. 4 capas elementales: Tierra, Fuego, Agua, Aire.',
    ejes: ['transmutacion', 'naturaleza', 'renacer', 'elementos'],
  },
];

export function getCollectionBySlug(slug: string): CollectionMeta | undefined {
  return COLECCIONES.find((c) => c.slug === slug);
}

export function getActiveCollection(): CollectionMeta | undefined {
  return COLECCIONES.find((c) => c.estado === 'activa');
}
