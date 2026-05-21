/**
 * Resilience test — F-Variante-metrosRequeridos-Modelo-estado / G-17.
 *
 * `descontinuada` is the terminal state per the AC-5 matrix. Once a Modelo is
 * marked descontinued (Cintia retired it from the line), it cannot transition
 * back. This file pins that one-way invariant: every possible target from
 * `descontinuada` MUST throw with the Spanish "ninguna (estado final)" trailer.
 *
 * Mirror of `tests/resilience/telas-state-machine-discontinuada-terminal.test.ts`
 * (G-14).
 */

import { isTerminal } from '@/lib/domain/models/state-machine';
import type { ModeloEstado } from '@/lib/domain/models/types';
import { modelosStateMachine } from '@/lib/payload/hooks/modelos-state-machine';

const TARGETS: ModeloEstado[] = ['nueva', 'en_produccion', 'en_stock', 'sin_stock'];

function callHook(data: Record<string, unknown>, originalDoc: Record<string, unknown>) {
  return modelosStateMachine({
    data,
    originalDoc: originalDoc as any,
    operation: 'update',
    collection: {} as any,
    context: {} as any,
    req: {} as any,
  });
}

describe('resilience — descontinuada is terminal one-way (G-17)', () => {
  it('isTerminal(descontinuada) is true', () => {
    expect(isTerminal('descontinuada')).toBe(true);
  });

  for (const target of TARGETS) {
    it(`rejects descontinuada → ${target} with "ninguna (estado final)"`, () => {
      expect(() => callHook({ estado: target }, { estado: 'descontinuada' })).toThrow(
        /ninguna \(estado final\)/
      );
    });
  }

  it('no-op: descontinuada → descontinuada (self-loop on terminal)', () => {
    // oldStatus === newStatus → hook is a no-op; does NOT throw.
    expect(() => callHook({ estado: 'descontinuada' }, { estado: 'descontinuada' })).not.toThrow();
  });
});
