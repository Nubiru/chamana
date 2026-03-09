import {
  calculateDiscount,
  getMaxPrice,
  getMinPrice,
  hasPricing,
} from '@/lib/domain/catalog/pricing';
import type { ChamanaModel, Tela, Variante } from '@/lib/domain/catalog/types';

// --- Inline factories ---

function makeTela(overrides: Partial<Tela> = {}): Tela {
  return {
    codigo: 'T01',
    tipo: 'Lino',
    color: 'Negro',
    colorHex: '#000000',
    ...overrides,
  };
}

function makeVariante(overrides: Partial<Variante> = {}): Variante {
  return {
    id: 'v-1',
    tela1: makeTela(),
    ...overrides,
  };
}

function makeModel(overrides: Partial<ChamanaModel> = {}): ChamanaModel {
  return {
    slug: 'test-model',
    nombre: 'Test',
    tipo: 'vestido',
    descripcion: 'Un modelo de prueba',
    variantes: [],
    ...overrides,
  };
}

// --- Tests ---

describe('getMinPrice', () => {
  it('returns null for empty array', () => {
    expect(getMinPrice([])).toBeNull();
  });

  it('returns the price for a single priced variante', () => {
    const variantes = [makeVariante({ precio: 15000 })];
    expect(getMinPrice(variantes)).toBe(15000);
  });

  it('returns the minimum across multiple priced variantes', () => {
    const variantes = [
      makeVariante({ id: 'v-1', precio: 20000 }),
      makeVariante({ id: 'v-2', precio: 12000 }),
      makeVariante({ id: 'v-3', precio: 18000 }),
    ];
    expect(getMinPrice(variantes)).toBe(12000);
  });

  it('ignores variantes without precio (undefined)', () => {
    const variantes = [
      makeVariante({ id: 'v-1', precio: undefined }),
      makeVariante({ id: 'v-2', precio: 9000 }),
      makeVariante({ id: 'v-3', precio: 15000 }),
    ];
    expect(getMinPrice(variantes)).toBe(9000);
  });

  it('returns null when all variantes lack precio', () => {
    const variantes = [makeVariante({ id: 'v-1' }), makeVariante({ id: 'v-2' })];
    expect(getMinPrice(variantes)).toBeNull();
  });

  it('handles precio of 0 as a valid price', () => {
    const variantes = [
      makeVariante({ id: 'v-1', precio: 0 }),
      makeVariante({ id: 'v-2', precio: 5000 }),
    ];
    expect(getMinPrice(variantes)).toBe(0);
  });
});

describe('getMaxPrice', () => {
  it('returns null for empty array', () => {
    expect(getMaxPrice([])).toBeNull();
  });

  it('returns the price for a single priced variante', () => {
    const variantes = [makeVariante({ precio: 25000 })];
    expect(getMaxPrice(variantes)).toBe(25000);
  });

  it('returns the maximum across multiple priced variantes', () => {
    const variantes = [
      makeVariante({ id: 'v-1', precio: 20000 }),
      makeVariante({ id: 'v-2', precio: 30000 }),
      makeVariante({ id: 'v-3', precio: 18000 }),
    ];
    expect(getMaxPrice(variantes)).toBe(30000);
  });

  it('ignores variantes without precio', () => {
    const variantes = [
      makeVariante({ id: 'v-1', precio: undefined }),
      makeVariante({ id: 'v-2', precio: 22000 }),
      makeVariante({ id: 'v-3', precio: 10000 }),
    ];
    expect(getMaxPrice(variantes)).toBe(22000);
  });

  it('returns null when all variantes lack precio', () => {
    const variantes = [makeVariante({ id: 'v-1' }), makeVariante({ id: 'v-2' })];
    expect(getMaxPrice(variantes)).toBeNull();
  });

  it('handles precio of 0 as a valid price', () => {
    const variantes = [
      makeVariante({ id: 'v-1', precio: 0 }),
      makeVariante({ id: 'v-2', precio: 5000 }),
    ];
    expect(getMaxPrice(variantes)).toBe(5000);
  });
});

describe('hasPricing', () => {
  it('returns true when at least one variante has a price', () => {
    const model = makeModel({
      variantes: [makeVariante({ id: 'v-1' }), makeVariante({ id: 'v-2', precio: 15000 })],
    });
    expect(hasPricing(model)).toBe(true);
  });

  it('returns false when no variante has a price', () => {
    const model = makeModel({
      variantes: [makeVariante({ id: 'v-1' }), makeVariante({ id: 'v-2' })],
    });
    expect(hasPricing(model)).toBe(false);
  });

  it('returns false when variantes array is empty', () => {
    const model = makeModel({ variantes: [] });
    expect(hasPricing(model)).toBe(false);
  });

  it('treats precio: 0 as having pricing', () => {
    const model = makeModel({
      variantes: [makeVariante({ precio: 0 })],
    });
    expect(hasPricing(model)).toBe(true);
  });
});

describe('calculateDiscount', () => {
  it('calculates 20% discount (100 -> 80)', () => {
    expect(calculateDiscount(100, 80)).toBe(20);
  });

  it('returns 0 when original is 0', () => {
    expect(calculateDiscount(0, 50)).toBe(0);
  });

  it('returns 0 when original is negative', () => {
    expect(calculateDiscount(-100, 50)).toBe(0);
  });

  it('returns 0% when prices are equal (no discount)', () => {
    expect(calculateDiscount(15000, 15000)).toBe(0);
  });

  it('returns 100% for full discount (original -> 0)', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });

  it('rounds to nearest integer', () => {
    // 33.333...% -> 33
    expect(calculateDiscount(30000, 20000)).toBe(33);
  });

  it('handles large realistic prices', () => {
    // 25000 -> 18750 = 25%
    expect(calculateDiscount(25000, 18750)).toBe(25);
  });

  it('handles current price higher than original (negative discount)', () => {
    // Implementation: (100 - 120) / 100 = -20% -> rounds to -20
    expect(calculateDiscount(100, 120)).toBe(-20);
  });
});
