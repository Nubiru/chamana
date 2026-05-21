export type { Category } from '@/domain/catalog';

/** Returns the CSS variable reference for a category's earthy accent color. */
export function getCategoryColor(tipo: string): string {
  return `var(--earth-${tipo.toLowerCase()})`;
}
