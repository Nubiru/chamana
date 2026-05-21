/**
 * Resilience test — F-Variante-metrosRequeridos-Modelo-estado / G-17 defensive
 * defaults.
 *
 * Defensive cases where estado is undefined on either side of the transition:
 *   - Cintia is editing a non-estado field (e.g. descripcion, imagenes,
 *     variantes), so data.estado is undefined → hook is a no-op (legitimate).
 *   - originalDoc.estado is undefined (legacy row created before the migration
 *     landed in a rogue replica, or originalDoc not loaded by Payload for some
 *     hook contexts) → hook is a no-op rather than crashing.
 *
 * Mirror of G-10 / G-14 "originalDoc undefined" + "data.estado missing"
 * defensive cases. Closes the class where the hook would otherwise throw
 * `Cannot read properties of undefined` and block Cintia's save for an
 * unrelated edit.
 */

import { modelosStateMachine } from '@/lib/payload/hooks/modelos-state-machine';

function callHook(data: Record<string, unknown>, originalDoc?: Record<string, unknown>) {
  return modelosStateMachine({
    data,
    originalDoc: originalDoc as any,
    operation: 'update',
    collection: {} as any,
    context: {} as any,
    req: {} as any,
  });
}

describe('resilience — undefined estado defensive defaults (G-17)', () => {
  it('data.estado undefined (Cintia editing descripcion only) → returns data unchanged', () => {
    const data = { descripcion: 'Nueva descripcion poetica' };
    const result = callHook(data, { estado: 'en_stock' });
    expect(result).toEqual(data);
  });

  it('originalDoc.estado undefined (legacy pre-migration row) → returns data unchanged', () => {
    const data = { estado: 'en_stock' };
    expect(() => callHook(data, {})).not.toThrow();
    const result = callHook(data, {});
    expect(result).toEqual(data);
  });

  it('originalDoc undefined entirely → returns data unchanged (defensive)', () => {
    const data = { estado: 'nueva' };
    expect(() => callHook(data, undefined)).not.toThrow();
  });

  it('both data.estado and originalDoc.estado undefined → returns data unchanged', () => {
    const data = { featured: true };
    expect(() => callHook(data, {})).not.toThrow();
    const result = callHook(data, {});
    expect(result).toEqual(data);
  });
});
