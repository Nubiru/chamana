/**
 * Integration test — F4 / H3 / AC-4.
 *
 * Cintia deletes a Venta (e.g., refund) → linked variant's stockVendido
 * decrements; if variant was sinStock=true, autoStock recompute should
 * flip it back to false.
 */

import { autoStock } from '@/payload/hooks/auto-stock';
import { ventasStockSyncDelete } from '@/payload/hooks/ventas-stock-sync';

type Variante = {
  varianteId: string;
  stockTotal?: number;
  stockVendido?: number;
  sinStock?: boolean;
};

function buildEnv(stockVendido: number) {
  const modelos: Record<string, { id: string; variantes: Variante[] }> = {
    m: {
      id: 'm',
      variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido, sinStock: stockVendido >= 5 }],
    },
  };
  const payload = {
    findByID: async ({ id }: { id: string }) => modelos[id] ?? null,
    update: async ({ id, data }: { id: string; data: { variantes: Variante[] } }) => {
      const recomputed = (autoStock as (a: Record<string, unknown>) => Record<string, unknown>)({
        data: { variantes: data.variantes },
        collection: {} as unknown,
        context: {} as unknown,
        operation: 'update',
        originalDoc: {} as unknown,
        req: {} as unknown,
      });
      modelos[id] = {
        ...modelos[id],
        variantes: (recomputed.variantes as Variante[]) ?? data.variantes,
      };
      return modelos[id];
    },
  };
  return { modelos, payload };
}

describe('integration — ventas-delete-restores-stock (AC-4)', () => {
  it('decrements variant.stockVendido when Venta is deleted', async () => {
    const env = buildEnv(3);
    await (ventasStockSyncDelete as (a: Record<string, unknown>) => Promise<unknown>)({
      doc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      id: 'venta-1',
      req: { payload: env.payload },
      collection: {} as unknown,
      context: {} as unknown,
    });
    expect(env.modelos.m.variantes[0].stockVendido).toBe(2);
  });

  it('deleting a sinStock=true variant Venta flips sinStock back to false via autoStock', async () => {
    const env = buildEnv(5); // exhausted
    expect(env.modelos.m.variantes[0].sinStock).toBe(true);

    await (ventasStockSyncDelete as (a: Record<string, unknown>) => Promise<unknown>)({
      doc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      id: 'venta-1',
      req: { payload: env.payload },
      collection: {} as unknown,
      context: {} as unknown,
    });

    const v = env.modelos.m.variantes[0];
    expect(v.stockVendido).toBe(4);
    expect(v.sinStock).toBe(false);
  });
});
