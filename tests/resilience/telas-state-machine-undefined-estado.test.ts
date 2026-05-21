/**
 * Resilience test — F-Telas-state-machine / G-14 defensive defaults.
 *
 * Defensive cases where estado is undefined on either side of the transition:
 *   - Cintia is editing a non-estado field (e.g. proveedor, leadTimeDias),
 *     so data.estado is undefined → hook is a no-op (legitimate).
 *   - originalDoc.estado is undefined (legacy row created before the migration
 *     landed in a rogue replica, or originalDoc not loaded by Payload for some
 *     hooks contexts) → hook is a no-op rather than crashing.
 *
 * Mirror of G-10 ventas-state-machine's "originalDoc undefined" + "data.estado
 * missing" defensive cases. Closes the class where the hook would otherwise
 * throw `Cannot read properties of undefined` and block Cintia's save for an
 * unrelated edit.
 */

import { telasStateMachine } from '@/lib/payload/hooks/telas-state-machine';

function callHook(data: Record<string, unknown>, originalDoc?: Record<string, unknown>) {
  return telasStateMachine({
    data,
    originalDoc: originalDoc as any,
    operation: 'update',
    collection: {} as any,
    context: {} as any,
    req: {} as any,
  });
}

describe('resilience — undefined estado defensive defaults (G-14)', () => {
  it('data.estado undefined (Cintia editing leadTimeDias only) → returns data unchanged', () => {
    const data = { leadTimeDias: 14 };
    const result = callHook(data, { estado: 'disponible' });
    expect(result).toEqual(data);
  });

  it('originalDoc.estado undefined (legacy pre-migration row) → returns data unchanged', () => {
    const data = { estado: 'disponible' };
    expect(() => callHook(data, {})).not.toThrow();
    const result = callHook(data, {});
    expect(result).toEqual(data);
  });

  it('originalDoc undefined entirely → returns data unchanged (defensive)', () => {
    const data = { estado: 'disponible' };
    expect(() => callHook(data, undefined)).not.toThrow();
  });
});
