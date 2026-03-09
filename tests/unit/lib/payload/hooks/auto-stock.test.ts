/**
 * Unit tests for lib/payload/hooks/auto-stock.ts
 *
 * autoStock is a CollectionBeforeChangeHook that computes sinStock
 * for each variante based on stockVendido and stockTotal.
 */

import { autoStock } from '@/lib/payload/hooks/auto-stock';

describe('autoStock hook', () => {
  // Helper to call the hook with minimal mock args
  function callHook(data: Record<string, unknown>) {
    return autoStock({
      data,
      collection: {} as any,
      context: {} as any,
      operation: 'update',
      originalDoc: {} as any,
      req: {} as any,
    });
  }

  // ── sinStock = false when stockTotal = 0 ──

  it('sets sinStock=false when stockTotal=0 and stockVendido=0', () => {
    const result = callHook({
      variantes: [{ stockTotal: 0, stockVendido: 0 }],
    });
    expect(result.variantes[0].sinStock).toBe(false);
  });

  it('sets sinStock=false when stockTotal=0 even if stockVendido > 0', () => {
    // The condition requires stockTotal > 0, so sinStock stays false
    const result = callHook({
      variantes: [{ stockTotal: 0, stockVendido: 5 }],
    });
    expect(result.variantes[0].sinStock).toBe(false);
  });

  // ── sinStock = false when vendido < total ──

  it('sets sinStock=false when vendido < total (2 sold of 5)', () => {
    const result = callHook({
      variantes: [{ stockTotal: 5, stockVendido: 2 }],
    });
    expect(result.variantes[0].sinStock).toBe(false);
  });

  it('sets sinStock=false when vendido=0 and total > 0', () => {
    const result = callHook({
      variantes: [{ stockTotal: 10, stockVendido: 0 }],
    });
    expect(result.variantes[0].sinStock).toBe(false);
  });

  // ── sinStock = true when vendido >= total (and total > 0) ──

  it('sets sinStock=true when vendido equals total (3 sold of 3)', () => {
    const result = callHook({
      variantes: [{ stockTotal: 3, stockVendido: 3 }],
    });
    expect(result.variantes[0].sinStock).toBe(true);
  });

  it('sets sinStock=true when vendido > total (edge case oversold)', () => {
    const result = callHook({
      variantes: [{ stockTotal: 3, stockVendido: 5 }],
    });
    expect(result.variantes[0].sinStock).toBe(true);
  });

  it('sets sinStock=true when vendido=1 and total=1', () => {
    const result = callHook({
      variantes: [{ stockTotal: 1, stockVendido: 1 }],
    });
    expect(result.variantes[0].sinStock).toBe(true);
  });

  // ── Handles missing/undefined stockVendido and stockTotal ──

  it('defaults to sinStock=false when both stockVendido and stockTotal are undefined', () => {
    const result = callHook({
      variantes: [{}],
    });
    // (0 || 0) >= (0 || 0) && (0 || 0) > 0 → true && false → false
    expect(result.variantes[0].sinStock).toBe(false);
  });

  it('defaults stockVendido to 0 when undefined (stockTotal present)', () => {
    const result = callHook({
      variantes: [{ stockTotal: 5 }],
    });
    // (0 || 0) >= (5 || 0) && (5 || 0) > 0 → false && true → false
    expect(result.variantes[0].sinStock).toBe(false);
  });

  it('defaults stockTotal to 0 when undefined (stockVendido present)', () => {
    const result = callHook({
      variantes: [{ stockVendido: 3 }],
    });
    // (3 || 0) >= (0 || 0) && (0 || 0) > 0 → true && false → false
    expect(result.variantes[0].sinStock).toBe(false);
  });

  it('handles null values by defaulting to 0', () => {
    const result = callHook({
      variantes: [{ stockTotal: null, stockVendido: null }],
    });
    expect(result.variantes[0].sinStock).toBe(false);
  });

  // ── Preserves other variante fields ──

  it('preserves other variante fields while adding sinStock', () => {
    const result = callHook({
      variantes: [
        {
          varianteId: 'intuicion-linspanbei',
          tela1: 'lino-beige',
          precio: 28000,
          stockTotal: 5,
          stockVendido: 2,
        },
      ],
    });
    const v = result.variantes[0];
    expect(v.varianteId).toBe('intuicion-linspanbei');
    expect(v.tela1).toBe('lino-beige');
    expect(v.precio).toBe(28000);
    expect(v.stockTotal).toBe(5);
    expect(v.stockVendido).toBe(2);
    expect(v.sinStock).toBe(false);
  });

  // ── Multiple variantes ──

  it('computes sinStock independently for each variante', () => {
    const result = callHook({
      variantes: [
        { stockTotal: 5, stockVendido: 5 }, // sinStock=true
        { stockTotal: 10, stockVendido: 3 }, // sinStock=false
        { stockTotal: 0, stockVendido: 0 }, // sinStock=false
        { stockTotal: 1, stockVendido: 2 }, // sinStock=true (oversold)
      ],
    });
    expect(result.variantes[0].sinStock).toBe(true);
    expect(result.variantes[1].sinStock).toBe(false);
    expect(result.variantes[2].sinStock).toBe(false);
    expect(result.variantes[3].sinStock).toBe(true);
  });

  // ── Returns data unchanged when no variantes array ──

  it('returns data unchanged when variantes is undefined', () => {
    const data = { nombre: 'Intuicion', tipo: 'Kimono' };
    const result = callHook(data);
    expect(result).toEqual(data);
    expect(result.variantes).toBeUndefined();
  });

  it('returns data unchanged when variantes is null', () => {
    const data = { nombre: 'Intuicion', variantes: null };
    const result = callHook(data);
    expect(result.variantes).toBeNull();
  });

  it('returns data unchanged when variantes is not an array', () => {
    const data = { nombre: 'Intuicion', variantes: 'not-array' };
    const result = callHook(data);
    expect(result.variantes).toBe('not-array');
  });

  // ── Returns data unchanged when variantes is empty array ──

  it('returns data with empty variantes array when variantes is []', () => {
    const result = callHook({ variantes: [] });
    expect(result.variantes).toEqual([]);
  });
});
