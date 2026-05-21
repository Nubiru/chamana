/**
 * Resilience test — F4 / H3 / AC-5.
 *
 * Save a Venta against a variante ID that does not exist on the linked Modelo
 * (e.g., Cintia typed it manually before F3's autoVarianteId landed, or copy-
 * paste typo). The hook MUST throw a clear Spanish error so Payload rolls
 * back the operation, NOT silently save with no Modelo update.
 */

import { ventasStockSync } from '@/lib/payload/hooks/ventas-stock-sync';

describe('resilience — unknown varianteId rejects with Spanish error (AC-5)', () => {
  function payloadWithModelo() {
    return {
      findByID: jest.fn(async () => ({
        id: 'm',
        variantes: [{ varianteId: 'hechizo-linmarmalv', stockTotal: 5, stockVendido: 0 }],
      })),
      update: jest.fn(),
    };
  }

  it('throws when varianteId does not match any variant on the Modelo', async () => {
    const payload = payloadWithModelo();
    await expect(
      (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
        operation: 'create',
        doc: { modelo: 'm', variante: 'typo-id-that-does-not-exist', estado: 'pendiente' },
        previousDoc: {},
        req: { payload },
        collection: {} as unknown,
        context: {} as unknown,
      })
    ).rejects.toThrow(/no encontrada en modelo/);
    expect(payload.update).not.toHaveBeenCalled();
  });

  it('error message names the offending varianteId for Cintia to correct', async () => {
    const payload = payloadWithModelo();
    try {
      await (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
        operation: 'create',
        doc: { modelo: 'm', variante: 'wrong-id', estado: 'pendiente' },
        previousDoc: {},
        req: { payload },
        collection: {} as unknown,
        context: {} as unknown,
      });
      throw new Error('expected hook to throw');
    } catch (err) {
      expect((err as Error).message).toContain('"wrong-id"');
      expect((err as Error).message).toMatch(/Verifica el ID/);
    }
  });

  it('throws when modelo ID does not resolve', async () => {
    const payload = { findByID: jest.fn(async () => null), update: jest.fn() };
    await expect(
      (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
        operation: 'create',
        doc: { modelo: 'ghost-id', variante: 'v', estado: 'pendiente' },
        previousDoc: {},
        req: { payload },
        collection: {} as unknown,
        context: {} as unknown,
      })
    ).rejects.toThrow(/Modelo con id "ghost-id" no encontrado/);
    expect(payload.update).not.toHaveBeenCalled();
  });
});
