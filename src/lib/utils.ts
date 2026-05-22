import type { CollectionMeta } from '@/domain/catalog';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price?: number): string {
  if (price == null) return 'Consultar precio';
  return `$${price.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

// Storefront display labels for a collection's temporada (the admin enum label is ASCII
// `Otono-Invierno`; the storefront renders correct Spanish with the ñ).
const TEMPORADA_LABELS: Record<CollectionMeta['temporada'], string> = {
  'primavera-verano': 'Primavera-Verano',
  'otono-invierno': 'Otoño-Invierno',
};

export function formatTemporada(temporada: CollectionMeta['temporada']): string {
  return TEMPORADA_LABELS[temporada] ?? temporada;
}
