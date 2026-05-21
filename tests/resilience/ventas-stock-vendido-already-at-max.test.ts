/**
 * Resilience test — F4 / H3 / AC oversell defense layer.
 *
 * If a variant is already at stockVendido === stockTotal (sinStock=true), the
 * storefront SHOULD have hidden it via VariantSelector logic — but if Cintia
 * logs a Venta against it anyway (e.g., she sells via WhatsApp and decides to
 * accept an overbook), the hook should still apply the +1 (current behavior
 * — Cintia's call to oversell). The test pins this behavior so a future
 * "reject when at max" decision is an explicit change with paired-test update.
 *
 * Sibling test: composing autoStock recompute leaves sinStock=true (already
 * was) so downstream storefront filters continue to hide the variant.
 */

import { autoStock } from '@/lib/payload/hooks/auto-stock';
import { ventasStockSync } from '@/lib/payload/hooks/ventas-stock-sync';

describe('resilience — venta logged against already-exhausted variant', () => {
  it('hook still increments (Cintia controls oversell decision); autoStock keeps sinStock=true', async () => {
    const modelos = {
      m: {
        id: 'm',
        variantes: [
          { varianteId: 'v', stockTotal: 5, stockVendido: 5, sinStock: true } as Record<
            string,
            unknown
          >,
        ],
      },
    };
    const payload = {
      findByID: async ({ id }: { id: string }) => modelos[id as keyof typeof modelos] ?? null,
      update: async ({
        id,
        data,
      }: {
        id: string;
        data: { variantes: Record<string, unknown>[] };
      }) => {
        const recomputed = (autoStock as (a: Record<string, unknown>) => Record<string, unknown>)({
          data: { variantes: data.variantes },
          collection: {} as unknown,
          context: {} as unknown,
          operation: 'update',
          originalDoc: {} as unknown,
          req: {} as unknown,
        });
        modelos[id as keyof typeof modelos] = {
          ...modelos[id as keyof typeof modelos],
          variantes: (recomputed.variantes as Record<string, unknown>[]) ?? data.variantes,
        };
        return modelos[id as keyof typeof modelos];
      },
    };

    await (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
      operation: 'create',
      doc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      previousDoc: {},
      req: { payload },
      collection: {} as unknown,
      context: {} as unknown,
    });

    const v = modelos.m.variantes[0];
    expect(v.stockVendido).toBe(6); // oversold by 1 — Cintia's call
    expect(v.sinStock).toBe(true); // remains hidden on storefront
  });
});
