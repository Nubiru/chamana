/**
 * Resilience test — F4 / H3 / AC-5 (concurrency).
 *
 * Real-world: Cintia is single-user, so true concurrent writes are rare. BUT
 * a batch import (CSV restore, prototype-to-production migration) might
 * trigger near-concurrent saves. Verify the hook does not lose updates under
 * sequential save bursts AND that read-modify-write cycles are isolated.
 *
 * NOTE: this is a sequential-burst test, not a true concurrency test. True
 * concurrency safety in Payload depends on the underlying Postgres adapter's
 * row locking, which is out of scope for unit-level resilience. The hazard
 * neutralized here is the "lost-update during back-to-back saves" class.
 */

import { autoStock } from '@/payload/hooks/auto-stock';
import { ventasStockSync } from '@/payload/hooks/ventas-stock-sync';

type Variante = {
  varianteId: string;
  stockTotal?: number;
  stockVendido?: number;
  sinStock?: boolean;
};

describe('resilience — sequential burst saves preserve correctness', () => {
  function buildEnv(stockTotal: number) {
    const modelos = {
      m: {
        id: 'm',
        variantes: [
          { varianteId: 'v', stockTotal, stockVendido: 0, sinStock: false },
        ] as Variante[],
      },
    };
    const payload = {
      findByID: async ({ id }: { id: string }) => modelos[id as keyof typeof modelos] ?? null,
      update: async ({ id, data }: { id: string; data: { variantes: Variante[] } }) => {
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
          variantes: (recomputed.variantes as Variante[]) ?? data.variantes,
        };
        return modelos[id as keyof typeof modelos];
      },
    };
    return { modelos, payload };
  }

  async function createVenta(payload: ReturnType<typeof buildEnv>['payload']) {
    await (ventasStockSync as (a: Record<string, unknown>) => Promise<unknown>)({
      operation: 'create',
      doc: { modelo: 'm', variante: 'v', estado: 'pendiente' },
      previousDoc: {},
      req: { payload },
      collection: {} as unknown,
      context: {} as unknown,
    });
  }

  it('3 sequential saves on the same variant → final stockVendido === 3 (no lost updates)', async () => {
    const env = buildEnv(10);
    await createVenta(env.payload);
    await createVenta(env.payload);
    await createVenta(env.payload);
    expect(env.modelos.m.variantes[0].stockVendido).toBe(3);
  });

  it('10 sequential saves → stockVendido === 10', async () => {
    const env = buildEnv(20);
    for (let i = 0; i < 10; i += 1) {
      await createVenta(env.payload);
    }
    expect(env.modelos.m.variantes[0].stockVendido).toBe(10);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // KNOWN LIMITATION — documented, not asserted-against.
  //
  // The hook is not row-locked. Under TRULY parallel writes (Promise.all on
  // 5 createVentas), classic read-modify-write lost-update can occur because
  // all 5 read stockVendido=N before any of them writes N+1. Cintia is a
  // single-user admin so this is not a Phase-1 hazard. Promotion path: when
  // batch-import or multi-user admin ships, add Postgres SELECT ... FOR
  // UPDATE on the Modelo row inside adjustModeloVariant (or wrap the read-
  // modify-write in a Payload transaction). Out of scope for G-10.
  // ──────────────────────────────────────────────────────────────────────────
  it.todo(
    'TODO (Phase-N): row-locked parallel writes — currently lost-update under true Promise.all'
  );
});
