/**
 * Resilience test — F-Telas-state-machine / G-14.
 *
 * `discontinuada` is the terminal state per the AC-5 matrix. Once a tela is
 * marked discontinued (proveedor stopped fabricating, Cintia retired it), it
 * cannot transition back. This file pins that one-way invariant: every
 * possible target from `discontinuada` MUST throw with the Spanish "ninguna
 * (estado final)" trailer.
 */

import { isTerminal } from '@/domain/textiles/state-machine';
import type { TelaEstado } from '@/domain/textiles/types';
import { telasStateMachine } from '@/payload/hooks/telas-state-machine';

const TARGETS: TelaEstado[] = ['disponible', 'por_agotarse', 'agotada', 'pedida'];

function callHook(data: Record<string, unknown>, originalDoc: Record<string, unknown>) {
  return telasStateMachine({
    data,
    originalDoc: originalDoc as any,
    operation: 'update',
    collection: {} as any,
    context: {} as any,
    req: {} as any,
  });
}

describe('resilience — discontinuada is terminal one-way (G-14)', () => {
  it('isTerminal(discontinuada) is true', () => {
    expect(isTerminal('discontinuada')).toBe(true);
  });

  for (const target of TARGETS) {
    it(`rejects discontinuada → ${target} with "ninguna (estado final)"`, () => {
      expect(() => callHook({ estado: target }, { estado: 'discontinuada' })).toThrow(
        /ninguna \(estado final\)/
      );
    });
  }

  it('no-op: discontinuada → discontinuada (self-loop on terminal)', () => {
    // oldStatus === newStatus → hook is a no-op; does NOT throw.
    expect(() => callHook({ estado: 'discontinuada' }, { estado: 'discontinuada' })).not.toThrow();
  });
});
