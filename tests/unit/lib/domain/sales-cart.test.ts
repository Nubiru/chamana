import { computeCartTotal, computeItemCount } from '@/lib/domain/sales/cart';
import type { CartItem } from '@/lib/domain/sales/types';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    modelSlug: 'intuicion',
    modelNombre: 'Intuición',
    modelTipo: 'Vestido',
    varianteId: 'v1',
    tela1Desc: 'Lino Natural',
    quantity: 1,
    ...overrides,
  };
}

describe('computeCartTotal', () => {
  it('returns 0 for an empty cart', () => {
    expect(computeCartTotal([])).toBe(0);
  });

  it('returns the total when all items have prices', () => {
    const items = [
      makeItem({ precio: 10000, quantity: 1 }),
      makeItem({ precio: 15000, quantity: 2 }),
    ];
    expect(computeCartTotal(items)).toBe(10000 + 15000 * 2);
  });

  it('returns the price for a single item with quantity 1', () => {
    const items = [makeItem({ precio: 25000, quantity: 1 })];
    expect(computeCartTotal(items)).toBe(25000);
  });

  it('multiplies price by quantity', () => {
    const items = [makeItem({ precio: 5000, quantity: 3 })];
    expect(computeCartTotal(items)).toBe(15000);
  });

  it('returns null when any item has undefined precio', () => {
    const items = [
      makeItem({ precio: 10000, quantity: 1 }),
      makeItem({ precio: undefined, quantity: 1 }),
    ];
    expect(computeCartTotal(items)).toBeNull();
  });

  it('returns null when all items lack precio', () => {
    const items = [makeItem({ quantity: 1 }), makeItem({ quantity: 2 })];
    expect(computeCartTotal(items)).toBeNull();
  });

  it('returns null for a single item without precio', () => {
    const items = [makeItem({ quantity: 1 })];
    expect(computeCartTotal(items)).toBeNull();
  });

  it('handles zero price correctly', () => {
    const items = [makeItem({ precio: 0, quantity: 5 })];
    expect(computeCartTotal(items)).toBe(0);
  });
});

describe('computeItemCount', () => {
  it('returns 0 for an empty cart', () => {
    expect(computeItemCount([])).toBe(0);
  });

  it('returns the quantity of a single item', () => {
    const items = [makeItem({ quantity: 3 })];
    expect(computeItemCount(items)).toBe(3);
  });

  it('sums quantities across multiple items', () => {
    const items = [makeItem({ quantity: 2 }), makeItem({ quantity: 5 }), makeItem({ quantity: 1 })];
    expect(computeItemCount(items)).toBe(8);
  });

  it('handles single item with quantity 1', () => {
    const items = [makeItem({ quantity: 1 })];
    expect(computeItemCount(items)).toBe(1);
  });
});
