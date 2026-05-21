import { getCategoryColor } from '@/lib/data/categories';

// Post G-30: the static CATEGORIAS array + getCategoryBySlug were removed (category counts
// now come from the Payload-derived getCategorias() and are prop-drilled). Only the pure
// getCategoryColor CSS-var helper survives in this module.

describe('getCategoryColor', () => {
  it('returns the earthy CSS variable for a category tipo', () => {
    expect(getCategoryColor('Falda')).toBe('var(--earth-falda)');
  });

  it('lowercases the tipo when building the variable name', () => {
    expect(getCategoryColor('PALAZZO')).toBe('var(--earth-palazzo)');
  });

  it('produces distinct variables for distinct tipos', () => {
    expect(getCategoryColor('Top')).not.toBe(getCategoryColor('Kimono'));
  });
});
