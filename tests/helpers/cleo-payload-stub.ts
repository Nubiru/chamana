/**
 * In-memory Payload stub for Cleo-bridge integration tests.
 *
 * This is the repo's established "test Payload instance" idiom (see
 * `tests/integration/ventas-stock-decrement.test.ts`, G-10 "integration test
 * fidelity"): rather than booting a real Payload+SQLite instance (jest mocks
 * `payload.config` to `{}`), it composes the REAL production hooks against an
 * in-memory store. A test that asserts `variant.stockVendido === 1` therefore
 * proves the *hook* fired — not the bridge (AC-3).
 *
 * Faithfully modelled behaviours:
 *   - `ventas.create` runs `ventasStateMachine` (beforeChange) then
 *     `ventasStockSync` (afterChange, +1 the variant's stockVendido). The venta
 *     is persisted ONLY after the afterChange hook succeeds, mirroring Payload's
 *     transactional rollback — so a bad varianteId (the hook throws) leaves NO
 *     partial state (AC-7).
 *   - `modelos.update` runs `autoStock` (beforeChange) so `sinStock` is
 *     recomputed exactly as in production.
 */

import { autoStock } from '@/payload/hooks/auto-stock';
import { ventasStateMachine } from '@/payload/hooks/ventas-state-machine';
import { ventasStockSync } from '@/payload/hooks/ventas-stock-sync';
import type { BridgePayload } from '../../scripts/cleo-bridge.ts';

type Doc = Record<string, unknown>;
type SyncHook = (a: Record<string, unknown>) => Record<string, unknown>;
type AsyncHook = (a: Record<string, unknown>) => Promise<unknown>;

export interface StubOptions {
  modelos?: Doc[];
  telas?: Doc[];
}

export interface CleoStub {
  payload: BridgePayload;
  store: {
    modelos: Map<string | number, Doc>;
    ventas: Map<string | number, Doc>;
    telas: Map<string | number, Doc>;
  };
  ventasCount: () => number;
}

function matchWhere(doc: Doc, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([key, cond]) => {
    if (cond && typeof cond === 'object' && 'equals' in (cond as Doc)) {
      return doc[key] === (cond as { equals: unknown }).equals;
    }
    return doc[key] === cond;
  });
}

export function buildCleoPayloadStub(opts: StubOptions = {}): CleoStub {
  const store = {
    modelos: new Map<string | number, Doc>(),
    ventas: new Map<string | number, Doc>(),
    telas: new Map<string | number, Doc>(),
  };
  let counter = 0;
  const nextId = (): number => {
    counter += 1;
    return counter;
  };

  for (const m of opts.modelos ?? []) {
    const id = (m.id as string | number | undefined) ?? nextId();
    store.modelos.set(id, { ...m, id });
  }
  for (const t of opts.telas ?? []) {
    const id = (t.id as string | number | undefined) ?? nextId();
    store.telas.set(id, { ...t, id });
  }

  const collectionMap = (collection: string): Map<string | number, Doc> | undefined => {
    if (collection === 'modelos') return store.modelos;
    if (collection === 'ventas') return store.ventas;
    if (collection === 'telas') return store.telas;
    return undefined;
  };

  const payload: BridgePayload = {
    async create({ collection, data }) {
      if (collection === 'ventas') {
        const afterBefore = (ventasStateMachine as unknown as SyncHook)({
          data,
          operation: 'create',
          originalDoc: undefined,
        });
        const id = nextId();
        const doc: Doc = { ...(afterBefore ?? data), id };
        // afterChange BEFORE persist → a throw (bad varianteId) leaves no venta.
        await (ventasStockSync as unknown as AsyncHook)({
          operation: 'create',
          doc,
          previousDoc: {},
          req: { payload },
        });
        store.ventas.set(id, doc);
        return doc;
      }
      const id = nextId();
      const doc: Doc = { ...data, id };
      collectionMap(collection)?.set(id, doc);
      return doc;
    },

    async update({ collection, id, data }) {
      if (collection === 'modelos') {
        const recomputed = (autoStock as unknown as SyncHook)({
          data,
          operation: 'update',
        });
        const merged: Doc = { ...(store.modelos.get(id) ?? {}), ...recomputed, id };
        store.modelos.set(id, merged);
        return merged;
      }
      const map = collectionMap(collection);
      const merged: Doc = { ...(map?.get(id) ?? {}), ...data, id };
      map?.set(id, merged);
      return merged;
    },

    async find({ collection, where, limit }) {
      const map = collectionMap(collection);
      let docs = map ? [...map.values()] : [];
      if (where) docs = docs.filter((d) => matchWhere(d, where));
      if (limit != null) docs = docs.slice(0, limit);
      return { docs };
    },

    async findByID({ collection, id }) {
      return collectionMap(collection)?.get(id) ?? null;
    },
  };

  return { payload, store, ventasCount: () => store.ventas.size };
}
