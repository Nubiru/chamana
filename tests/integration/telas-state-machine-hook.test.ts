/**
 * Integration test — F-Telas-state-machine / G-14 / AC-5 + AC-6.
 *
 * Exercises the Payload-adapter wiring at `lib/payload/hooks/telas-state-machine.ts`
 * against the domain module's transition table. Strategy follows G-10's
 * ventas-stock-sync integration pattern: call the exported hook with mocked
 * Payload hook args, assert behavior on each operation/state combo.
 *
 * Companion of `tests/unit/lib/domain/textiles/state-machine.test.ts` (pure
 * domain) — this file pins the *adapter* contract (what the hook reads from
 * originalDoc + data, what it throws, what it returns).
 */

import { telasStateMachine } from '@/payload/hooks/telas-state-machine';

function callHook(
  operation: 'create' | 'update',
  data: Record<string, unknown>,
  originalDoc?: Record<string, unknown>
) {
  return telasStateMachine({
    data,
    originalDoc: originalDoc as any,
    operation,
    collection: {} as any,
    context: {} as any,
    req: {} as any,
  });
}

describe('telasStateMachine integration — F-Telas-state-machine AC-5/6', () => {
  // ── CREATE: never validates transition ──

  it('AC-5 create-with-default: estado=disponible passes (no transition to validate)', () => {
    const data = { codigo: 'NewTela', estado: 'disponible' };
    expect(() => callHook('create', data)).not.toThrow();
    expect(callHook('create', data)).toEqual(data);
  });

  it('AC-5 create-with-pedida: passes (initial-state enumeration handled by field constraint)', () => {
    const data = { codigo: 'NewTela', estado: 'pedida' };
    expect(() => callHook('create', data)).not.toThrow();
  });

  // ── UPDATE valid transitions ──

  it('AC-5 valid update: disponible → por_agotarse (Cintia marks low-stock)', () => {
    const result = callHook('update', { estado: 'por_agotarse' }, { estado: 'disponible' });
    expect((result as any).estado).toBe('por_agotarse');
  });

  it('AC-5 valid update: agotada → pedida (Cintia orders reposición)', () => {
    expect(() => callHook('update', { estado: 'pedida' }, { estado: 'agotada' })).not.toThrow();
  });

  it('AC-5 valid update: pedida → disponible (Cintia receives shipment)', () => {
    expect(() => callHook('update', { estado: 'disponible' }, { estado: 'pedida' })).not.toThrow();
  });

  // ── UPDATE invalid transitions: Spanish error throws ──

  it('AC-6 invalid update: agotada → disponible throws with Spanish error containing labels', () => {
    expect(() => callHook('update', { estado: 'disponible' }, { estado: 'agotada' })).toThrow(
      'No se puede cambiar el estado de "Agotada" a "Disponible". ' +
        'Transiciones permitidas: Pedida, Descontinuada.'
    );
  });

  it('AC-6 invalid update: pedida → agotada throws (a pedido cannot agotarse before arriving)', () => {
    expect(() => callHook('update', { estado: 'agotada' }, { estado: 'pedida' })).toThrow(
      /No se puede cambiar el estado de "Pedida" a "Agotada"/
    );
  });

  // ── No-op flows ──

  it('no-op: oldStatus === newStatus → returns data unchanged (Cintia edited another field)', () => {
    const data = { estado: 'disponible', leadTimeDias: 14 };
    const result = callHook('update', data, { estado: 'disponible' });
    expect(result).toEqual(data);
  });

  it('no-op: data.estado undefined (Cintia editing only leadTimeDias) → returns data unchanged', () => {
    const data = { leadTimeDias: 7 };
    const result = callHook('update', data, { estado: 'disponible' });
    expect(result).toEqual(data);
  });
});
