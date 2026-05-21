/**
 * Integration test — F-Variante-metrosRequeridos-Modelo-estado / G-17 / AC-5/6.
 *
 * Exercises the Payload-adapter wiring at
 * `lib/payload/hooks/modelos-state-machine.ts` against the domain module's
 * transition table. Mirror of `tests/integration/telas-state-machine-hook.test.ts`
 * (G-14) shape — call the exported hook with mocked Payload hook args, assert
 * behavior on each operation/state combo.
 *
 * Companion of `tests/unit/lib/domain/models/state-machine.test.ts` (pure
 * domain) — this file pins the *adapter* contract (what the hook reads from
 * originalDoc + data, what it throws, what it returns).
 */

import { modelosStateMachine } from '@/lib/payload/hooks/modelos-state-machine';

function callHook(
  operation: 'create' | 'update',
  data: Record<string, unknown>,
  originalDoc?: Record<string, unknown>
) {
  return modelosStateMachine({
    data,
    originalDoc: originalDoc as any,
    operation,
    collection: {} as any,
    context: {} as any,
    req: {} as any,
  });
}

describe('modelosStateMachine integration — F AC-5/6', () => {
  // ── CREATE: never validates transition ──

  it('AC-5 create-with-default: estado=nueva passes (no transition to validate)', () => {
    const data = { nombre: 'NewModelo', estado: 'nueva' };
    expect(() => callHook('create', data)).not.toThrow();
    expect(callHook('create', data)).toEqual(data);
  });

  it('AC-5 create-with-en_produccion: passes (initial-state field-constraint enforced)', () => {
    const data = { nombre: 'NewModelo', estado: 'en_produccion' };
    expect(() => callHook('create', data)).not.toThrow();
  });

  it('AC-5 create without estado: passes (defaultValue handled by Payload)', () => {
    const data = { nombre: 'NewModelo' };
    expect(() => callHook('create', data)).not.toThrow();
    expect(callHook('create', data)).toEqual(data);
  });

  // ── UPDATE valid transitions (sample 6 of 11 valid pairs) ──

  it('AC-5 valid update: nueva → en_produccion (Cintia begins production)', () => {
    const result = callHook('update', { estado: 'en_produccion' }, { estado: 'nueva' });
    expect((result as any).estado).toBe('en_produccion');
  });

  it('AC-5 valid update: en_produccion → en_stock (first batch ready)', () => {
    expect(() =>
      callHook('update', { estado: 'en_stock' }, { estado: 'en_produccion' })
    ).not.toThrow();
  });

  it('AC-5 valid update: en_stock → sin_stock (variants depleted)', () => {
    expect(() => callHook('update', { estado: 'sin_stock' }, { estado: 'en_stock' })).not.toThrow();
  });

  it('AC-5 valid update: sin_stock → en_stock (Cintia received unaccounted buffer)', () => {
    expect(() => callHook('update', { estado: 'en_stock' }, { estado: 'sin_stock' })).not.toThrow();
  });

  it('AC-5 valid update: sin_stock → en_produccion (reorder atelier run)', () => {
    expect(() =>
      callHook('update', { estado: 'en_produccion' }, { estado: 'sin_stock' })
    ).not.toThrow();
  });

  it('AC-5 valid update: en_stock → descontinuada (retired terminal)', () => {
    expect(() =>
      callHook('update', { estado: 'descontinuada' }, { estado: 'en_stock' })
    ).not.toThrow();
  });

  // ── UPDATE invalid transitions: Spanish error throws ──

  it('AC-6 invalid update: nueva → en_stock throws with Spanish error containing labels', () => {
    expect(() => callHook('update', { estado: 'en_stock' }, { estado: 'nueva' })).toThrow(
      'No se puede cambiar el estado de "Nueva" a "En stock". ' +
        'Transiciones permitidas: En produccion, Descontinuada.'
    );
  });

  it('AC-6 invalid update: nueva → sin_stock throws (cannot skip production)', () => {
    expect(() => callHook('update', { estado: 'sin_stock' }, { estado: 'nueva' })).toThrow(
      /No se puede cambiar el estado de "Nueva" a "Sin stock"/
    );
  });

  it('AC-6 invalid update: en_produccion → sin_stock throws (cannot agotarse before stock)', () => {
    expect(() => callHook('update', { estado: 'sin_stock' }, { estado: 'en_produccion' })).toThrow(
      /No se puede cambiar el estado de "En produccion" a "Sin stock"/
    );
  });

  it('AC-6 invalid update: en_stock → nueva throws (no return to design phase)', () => {
    expect(() => callHook('update', { estado: 'nueva' }, { estado: 'en_stock' })).toThrow(
      /No se puede cambiar el estado de "En stock" a "Nueva"/
    );
  });

  it('AC-6 invalid update: sin_stock → nueva throws (no return to design)', () => {
    expect(() => callHook('update', { estado: 'nueva' }, { estado: 'sin_stock' })).toThrow(
      /No se puede cambiar el estado de "Sin stock" a "Nueva"/
    );
  });

  // ── No-op flows ──

  it('no-op: oldStatus === newStatus → returns data unchanged (Cintia edited another field)', () => {
    const data = { estado: 'en_stock', featured: true };
    const result = callHook('update', data, { estado: 'en_stock' });
    expect(result).toEqual(data);
  });

  it('no-op: data.estado undefined (Cintia editing only descripcion) → returns data unchanged', () => {
    const data = { descripcion: 'Nueva descripcion poetica' };
    const result = callHook('update', data, { estado: 'en_stock' });
    expect(result).toEqual(data);
  });
});
