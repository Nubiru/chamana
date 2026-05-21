/**
 * Unit tests for lib/payload/hooks/ventas-stock-sync.ts (F4 — H3 fix)
 *
 * ventasStockSync is a CollectionAfterChangeHook that enforces the stock
 * invariant: a Venta record == one unit decrement on the linked Modelo's
 * matching variant. The sibling ventasStockSyncDelete is the
 * CollectionAfterDeleteHook that restores stock on cancellation/refund.
 *
 * Strategy: mock req.payload.findByID + req.payload.update to simulate the
 * Modelo collection. Assert the hook reads the current Modelo, applies the
 * correct delta to the matching variant, and re-saves via payload.update.
 */

import { ventasStockSync, ventasStockSyncDelete } from '@/lib/payload/hooks/ventas-stock-sync';

type Variante = {
  varianteId: string;
  stockTotal?: number;
  stockVendido?: number;
  [k: string]: unknown;
};

type Modelo = {
  id: string;
  variantes: Variante[];
};

function buildPayloadMock(modelos: Record<string, Modelo>) {
  const findByID = jest.fn(async ({ id }: { id: string }) => modelos[id] ?? null);
  const update = jest.fn(async ({ id, data }: { id: string; data: { variantes: Variante[] } }) => {
    if (modelos[id]) {
      modelos[id] = { ...modelos[id], variantes: data.variantes };
    }
    return modelos[id];
  });
  return { findByID, update, modelos };
}

function callAfterChange(args: {
  operation: 'create' | 'update';
  doc: Record<string, unknown>;
  previousDoc?: Record<string, unknown>;
  payload: ReturnType<typeof buildPayloadMock>;
}) {
  return (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
    operation: args.operation,
    doc: args.doc,
    previousDoc: args.previousDoc ?? {},
    req: { payload: args.payload },
    collection: {} as unknown,
    context: {} as unknown,
  });
}

function callAfterDelete(args: {
  doc: Record<string, unknown>;
  payload: ReturnType<typeof buildPayloadMock>;
}) {
  return (ventasStockSyncDelete as (a: Record<string, unknown>) => Promise<unknown>)({
    doc: args.doc,
    id: args.doc.id ?? 'venta-1',
    req: { payload: args.payload },
    collection: {} as unknown,
    context: {} as unknown,
  });
}

describe('ventasStockSync — afterChange create', () => {
  it('increments stockVendido on the matching variant when creating a pendiente Venta', async () => {
    const p = buildPayloadMock({
      'modelo-1': {
        id: 'modelo-1',
        variantes: [
          { varianteId: 'hechizo-linmarmalv', stockTotal: 5, stockVendido: 0 },
          { varianteId: 'hechizo-linmarrosa', stockTotal: 3, stockVendido: 1 },
        ],
      },
    });

    await callAfterChange({
      operation: 'create',
      doc: {
        modelo: 'modelo-1',
        variante: 'hechizo-linmarmalv',
        estado: 'pendiente',
      },
      payload: p,
    });

    expect(p.update).toHaveBeenCalledTimes(1);
    expect(p.modelos['modelo-1'].variantes[0].stockVendido).toBe(1);
    expect(p.modelos['modelo-1'].variantes[1].stockVendido).toBe(1); // untouched
  });

  it('increments by 1 for pagada / enviada / entregada states (all consume stock)', async () => {
    for (const estado of ['pagada', 'enviada', 'entregada'] as const) {
      const p = buildPayloadMock({
        m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 0 }] },
      });
      await callAfterChange({
        operation: 'create',
        doc: { modelo: 'm', variante: 'v', estado },
        payload: p,
      });
      expect(p.modelos.m.variantes[0].stockVendido).toBe(1);
    }
  });

  it('does NOT increment when creating with estado=cancelada (does not consume stock)', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 0 }] },
    });
    await callAfterChange({
      operation: 'create',
      doc: { modelo: 'm', variante: 'v', estado: 'cancelada' },
      payload: p,
    });
    expect(p.update).not.toHaveBeenCalled();
    expect(p.modelos.m.variantes[0].stockVendido).toBe(0);
  });

  it('handles modelo as populated object {id} (Payload depth>0 case)', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 0 }] },
    });
    await callAfterChange({
      operation: 'create',
      doc: { modelo: { id: 'm' }, variante: 'v', estado: 'pendiente' },
      payload: p,
    });
    expect(p.modelos.m.variantes[0].stockVendido).toBe(1);
  });

  it('does nothing when modelo is null', async () => {
    const p = buildPayloadMock({});
    await callAfterChange({
      operation: 'create',
      doc: { modelo: null, variante: 'v', estado: 'pendiente' },
      payload: p,
    });
    expect(p.findByID).not.toHaveBeenCalled();
    expect(p.update).not.toHaveBeenCalled();
  });

  it('does nothing when variante is empty', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v' }] },
    });
    await callAfterChange({
      operation: 'create',
      doc: { modelo: 'm', variante: '', estado: 'pendiente' },
      payload: p,
    });
    expect(p.update).not.toHaveBeenCalled();
  });

  it('throws when varianteId is not found in the Modelo', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'real-one', stockTotal: 5, stockVendido: 0 }] },
    });
    await expect(
      callAfterChange({
        operation: 'create',
        doc: { modelo: 'm', variante: 'unknown-id', estado: 'pendiente' },
        payload: p,
      })
    ).rejects.toThrow('Variante "unknown-id" no encontrada en modelo');
  });

  it('throws when Modelo is not found', async () => {
    const p = buildPayloadMock({});
    await expect(
      callAfterChange({
        operation: 'create',
        doc: { modelo: 'missing', variante: 'v', estado: 'pendiente' },
        payload: p,
      })
    ).rejects.toThrow('Modelo con id "missing" no encontrado');
  });
});

describe('ventasStockSync — afterChange update (same target)', () => {
  it('no-op when only non-stock fields change (state stays pendiente)', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 3 }] },
    });
    await callAfterChange({
      operation: 'update',
      doc: { modelo: 'm', variante: 'v', estado: 'pagada', notas: 'updated' },
      previousDoc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      payload: p,
    });
    // both pre + post consume stock → delta 0
    expect(p.update).not.toHaveBeenCalled();
    expect(p.modelos.m.variantes[0].stockVendido).toBe(3);
  });

  it('decrements when state flips to cancelada (was pendiente)', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 3 }] },
    });
    await callAfterChange({
      operation: 'update',
      doc: { modelo: 'm', variante: 'v', estado: 'cancelada' },
      previousDoc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      payload: p,
    });
    expect(p.modelos.m.variantes[0].stockVendido).toBe(2);
  });

  it('increments when state flips from cancelada to pendiente', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 1 }] },
    });
    await callAfterChange({
      operation: 'update',
      doc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      previousDoc: { modelo: 'm', variante: 'v', estado: 'cancelada' },
      payload: p,
    });
    expect(p.modelos.m.variantes[0].stockVendido).toBe(2);
  });
});

describe('ventasStockSync — afterChange update (variant swap)', () => {
  it('decrements OLD variant and increments NEW variant when Cintia swaps variante', async () => {
    const p = buildPayloadMock({
      m: {
        id: 'm',
        variantes: [
          { varianteId: 'old-v', stockTotal: 5, stockVendido: 3 },
          { varianteId: 'new-v', stockTotal: 5, stockVendido: 0 },
        ],
      },
    });
    await callAfterChange({
      operation: 'update',
      doc: { modelo: 'm', variante: 'new-v', estado: 'pendiente' },
      previousDoc: { modelo: 'm', variante: 'old-v', estado: 'pendiente' },
      payload: p,
    });
    expect(p.modelos.m.variantes[0].stockVendido).toBe(2); // old-v -1
    expect(p.modelos.m.variantes[1].stockVendido).toBe(1); // new-v +1
  });

  it('handles modelo swap (different Modelo) — decrement old modelo, increment new', async () => {
    const p = buildPayloadMock({
      'm-a': { id: 'm-a', variantes: [{ varianteId: 'va', stockTotal: 5, stockVendido: 2 }] },
      'm-b': { id: 'm-b', variantes: [{ varianteId: 'vb', stockTotal: 5, stockVendido: 0 }] },
    });
    await callAfterChange({
      operation: 'update',
      doc: { modelo: 'm-b', variante: 'vb', estado: 'pendiente' },
      previousDoc: { modelo: 'm-a', variante: 'va', estado: 'pendiente' },
      payload: p,
    });
    expect(p.modelos['m-a'].variantes[0].stockVendido).toBe(1);
    expect(p.modelos['m-b'].variantes[0].stockVendido).toBe(1);
  });

  it('on variant swap, only increments new variant when old was cancelled (no double-refund)', async () => {
    const p = buildPayloadMock({
      m: {
        id: 'm',
        variantes: [
          { varianteId: 'old-v', stockTotal: 5, stockVendido: 0 },
          { varianteId: 'new-v', stockTotal: 5, stockVendido: 0 },
        ],
      },
    });
    await callAfterChange({
      operation: 'update',
      doc: { modelo: 'm', variante: 'new-v', estado: 'pendiente' },
      previousDoc: { modelo: 'm', variante: 'old-v', estado: 'cancelada' },
      payload: p,
    });
    expect(p.modelos.m.variantes[0].stockVendido).toBe(0); // old-v untouched
    expect(p.modelos.m.variantes[1].stockVendido).toBe(1); // new-v +1
  });
});

describe('ventasStockSyncDelete — afterDelete', () => {
  it('decrements stockVendido on the linked variant when Venta is deleted', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 4 }] },
    });
    await callAfterDelete({
      doc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      payload: p,
    });
    expect(p.modelos.m.variantes[0].stockVendido).toBe(3);
  });

  it('does NOT decrement when deleting a cancelada Venta (it had not consumed stock)', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 4 }] },
    });
    await callAfterDelete({
      doc: { modelo: 'm', variante: 'v', estado: 'cancelada' },
      payload: p,
    });
    expect(p.update).not.toHaveBeenCalled();
    expect(p.modelos.m.variantes[0].stockVendido).toBe(4);
  });

  it('clamps stockVendido at 0 (no negative stock)', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 0 }] },
    });
    await callAfterDelete({
      doc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      payload: p,
    });
    expect(p.modelos.m.variantes[0].stockVendido).toBe(0);
  });
});

describe('ventasStockSync — concurrency / sequential saves', () => {
  it('5 sequential creates against stockTotal=5 leave stockVendido=5', async () => {
    const p = buildPayloadMock({
      m: { id: 'm', variantes: [{ varianteId: 'v', stockTotal: 5, stockVendido: 0 }] },
    });
    for (let i = 0; i < 5; i += 1) {
      await callAfterChange({
        operation: 'create',
        doc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
        payload: p,
      });
    }
    expect(p.modelos.m.variantes[0].stockVendido).toBe(5);
  });
});
