import { MODELOS } from './products';

export interface Category {
  slug: string;
  nombre: string;
  count: number;
}

const CATEGORY_ORDER = [
  'Falda',
  'Vestido',
  'Kimono',
  'Remeron',
  'Musculosa',
  'Top',
  'Camisa',
  'Bermuda',
  'Short',
  'Palazzo',
];

export const CATEGORIAS: Category[] = CATEGORY_ORDER.map((tipo) => ({
  slug: tipo
    .toLowerCase()
    .normalize('NFD')
    // biome-ignore lint/suspicious/noMisleadingCharacterClass: standard NFD accent-stripping pattern
    .replace(/[\u0300-\u036f]/g, ''),
  nombre: tipo,
  count: MODELOS.filter((m) => m.tipo === tipo).length,
})).filter((c) => c.count > 0);

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIAS.find((c) => c.slug === slug);
}

/** Returns the CSS variable reference for a category's earthy accent color. */
export function getCategoryColor(tipo: string): string {
  return `var(--earth-${tipo.toLowerCase()})`;
}
