/**
 * Integration test — F4 / H3 / AC-3.
 *
 * Composes ventasStockSync (afterChange:update) with autoStock recompute
 * to verify Cintia's variant-swap correction flow:
 *   she creates Venta with wrong variante (misclick) → edits → swaps to right variante.
 *   Hook must (a) decrement OLD variant, (b) increment NEW variant, atomically.
 */

import { autoStock } from '@/payload/hooks/auto-stock';
import { ventasStockSync } from '@/payload/hooks/ventas-stock-sync';

type Variante = {
  varianteId: string;
  stockTotal?: number;
  stockVendido?: number;
  sinStock?: boolean;
};

function buildModelo() {
  return {
    id: 'modelo-hechizo',
    variantes: [
      { varianteId: 'hechizo-linmarmalv', stockTotal: 5, stockVendido: 1, sinStock: false },
      { varianteId: 'hechizo-linmarrosa', stockTotal: 5, stockVendido: 0, sinStock: false },
    ] as Variante[],
  };
}

function payloadStub(modelos: Record<string, ReturnType<typeof buildModelo>>) {
  return {
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
}

describe('integration — ventas-edit-variant-swap (AC-3)', () => {
  it('decrements old variant + increments new variant atomically on swap', async () => {
    const modelos = { 'modelo-hechizo': buildModelo() };
    const payload = payloadStub(modelos);

    await (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
      operation: 'update',
      doc: {
        id: 'venta-1',
        modelo: 'modelo-hechizo',
        variante: 'hechizo-linmarrosa',
        estado: 'pendiente',
      },
      previousDoc: {
        id: 'venta-1',
        modelo: 'modelo-hechizo',
        variante: 'hechizo-linmarmalv',
        estado: 'pendiente',
      },
      req: { payload },
      collection: {} as unknown,
      context: {} as unknown,
    });

    const variantes = modelos['modelo-hechizo'].variantes;
    expect(variantes.find((v) => v.varianteId === 'hechizo-linmarmalv')?.stockVendido).toBe(0);
    expect(variantes.find((v) => v.varianteId === 'hechizo-linmarrosa')?.stockVendido).toBe(1);
  });

  it('state change without variant change is independent of swap logic (state pendiente→pagada keeps stock)', async () => {
    const modelos = { 'modelo-hechizo': buildModelo() };
    const payload = payloadStub(modelos);

    await (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
      operation: 'update',
      doc: {
        modelo: 'modelo-hechizo',
        variante: 'hechizo-linmarmalv',
        estado: 'pagada',
      },
      previousDoc: {
        modelo: 'modelo-hechizo',
        variante: 'hechizo-linmarmalv',
        estado: 'pendiente',
      },
      req: { payload },
      collection: {} as unknown,
      context: {} as unknown,
    });

    // Both pre+post consume stock → no change.
    expect(modelos['modelo-hechizo'].variantes[0].stockVendido).toBe(1);
  });
});
