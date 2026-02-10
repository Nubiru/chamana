import { CATEGORIAS, getCategoryBySlug } from '@/lib/data/categories';

describe('categories data', () => {
  it('has categories derived from products', () => {
    expect(CATEGORIAS.length).toBeGreaterThanOrEqual(5);
  });

  it('every category has a positive count', () => {
    for (const cat of CATEGORIAS) {
      expect(cat.count).toBeGreaterThan(0);
    }
  });

  it('every category has a slug and nombre', () => {
    for (const cat of CATEGORIAS) {
      expect(cat.slug).toBeTruthy();
      expect(cat.nombre).toBeTruthy();
    }
  });

  it('slugs are lowercase with no accents', () => {
    for (const cat of CATEGORIAS) {
      expect(cat.slug).toMatch(/^[a-z]+$/);
    }
  });
});

describe('getCategoryBySlug', () => {
  it('returns category for valid slug', () => {
    const cat = getCategoryBySlug('falda');
    expect(cat).toBeDefined();
    expect(cat?.nombre).toBe('Falda');
  });

  it('returns undefined for invalid slug', () => {
    expect(getCategoryBySlug('zapato')).toBeUndefined();
  });
});
