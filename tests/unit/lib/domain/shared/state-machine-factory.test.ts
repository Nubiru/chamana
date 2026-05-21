/**
 * Unit test — F-state-machine-factory / S-9 / G-18 / AC-1+AC-2+AC-3+AC-3a+AC-3b+AC-8.
 *
 * Generic-behavior tests for `lib/domain/shared/state-machine-factory.ts`. These
 * isolate the factory's generic logic against SYNTHETIC mock state-machines —
 * NOT against the real sales/textiles/models modules (those keep their own nets
 * per S-9 AC-7). The synthetic mocks deliberately mirror the real shapes (a
 * with-labels machine that has a terminal, a without-labels machine, a 5-state
 * machine) so every branch of the factory is exercised.
 *
 * Coverage (≥10 cases per AC-8 / S-9 §6):
 *   - construction returns the exact 5-member surface (AC-3).
 *   - VALID_TRANSITIONS exposed and === config.transitions (AC-3).
 *   - validateTransition true/false for known edges; throws on unknown from (AC-3b).
 *   - getAvailableTransitions per state incl. terminal [] (AC-3).
 *   - isTerminal true only for zero-out-edge states (AC-3).
 *   - invalidTransitionError WITH labels → label+period exact (AC-3a).
 *   - invalidTransitionError WITHOUT labels → raw value+period (AC-10 shape).
 *   - invalidTransitionError terminal from → 'ninguna (estado final).' (AC-3a).
 *   - invalidTransitionError multi-target comma-join in config order.
 *   - byte-parity proof reproducing the documented Telas exact string (AC-3a).
 *   - generic across a 2-state and a 5-state mock (AC-8 reusability).
 *
 * Quality gates G22–G26: no try/catch swallowing; every expect can fail; no
 * trivially-true assertions; throw-paths use expect().toThrow.
 */

import { type StateMachine, createStateMachine } from '@/domain/shared/state-machine-factory';

// ── Mock A — WITH labels, includes a terminal state (Telas/Modelos shape) ──
type FlujoEstado = 'inicial' | 'medio' | 'final';

const FLUJO_TRANSITIONS: Record<FlujoEstado, FlujoEstado[]> = {
  inicial: ['medio', 'final'],
  medio: ['final'],
  final: [],
};

const FLUJO_LABELS: Record<FlujoEstado, string> = {
  inicial: 'Inicial',
  medio: 'Medio',
  final: 'Final',
};

function makeFlujo(): StateMachine<FlujoEstado> {
  return createStateMachine<FlujoEstado>({
    transitions: FLUJO_TRANSITIONS,
    labels: FLUJO_LABELS,
  });
}

// ── Mock B — WITHOUT labels (legacy-Ventas raw-value shape) ──
type ToggleEstado = 'on' | 'off';

const TOGGLE_TRANSITIONS: Record<ToggleEstado, ToggleEstado[]> = {
  on: ['off'],
  off: ['on'],
};

function makeToggle(): StateMachine<ToggleEstado> {
  return createStateMachine<ToggleEstado>({ transitions: TOGGLE_TRANSITIONS });
}

describe('createStateMachine — construction + exposed surface (AC-3)', () => {
  it('returns the exact 5-member surface', () => {
    const sm = makeFlujo();
    expect(typeof sm.validateTransition).toBe('function');
    expect(typeof sm.getAvailableTransitions).toBe('function');
    expect(typeof sm.isTerminal).toBe('function');
    expect(typeof sm.invalidTransitionError).toBe('function');
    expect(sm.VALID_TRANSITIONS).toBeDefined();
  });

  it('exposes VALID_TRANSITIONS as the same reference passed in config', () => {
    const sm = makeFlujo();
    expect(sm.VALID_TRANSITIONS).toBe(FLUJO_TRANSITIONS);
    expect(sm.VALID_TRANSITIONS).toEqual({
      inicial: ['medio', 'final'],
      medio: ['final'],
      final: [],
    });
  });
});

describe('createStateMachine — validateTransition (AC-3 + AC-3b)', () => {
  it('returns true for an allowed edge', () => {
    expect(makeFlujo().validateTransition('inicial', 'medio')).toBe(true);
  });

  it('returns false for a disallowed edge between two known states', () => {
    expect(makeFlujo().validateTransition('medio', 'inicial')).toBe(false);
  });

  it('throws a TypeError on an unknown from-state (legacy AC-3b semantics)', () => {
    const sm = makeFlujo();
    expect(() => sm.validateTransition('fantasma' as FlujoEstado, 'medio')).toThrow(TypeError);
  });
});

describe('createStateMachine — getAvailableTransitions + isTerminal (AC-3)', () => {
  it('returns the configured row for a non-terminal state', () => {
    expect(makeFlujo().getAvailableTransitions('inicial')).toEqual(['medio', 'final']);
  });

  it('returns an empty array for a terminal state', () => {
    expect(makeFlujo().getAvailableTransitions('final')).toEqual([]);
  });

  it('isTerminal is true ONLY for a zero-out-edge state', () => {
    const sm = makeFlujo();
    expect(sm.isTerminal('final')).toBe(true);
    expect(sm.isTerminal('inicial')).toBe(false);
    expect(sm.isTerminal('medio')).toBe(false);
  });
});

describe('createStateMachine — invalidTransitionError (AC-3a + AC-10)', () => {
  it('WITH labels → renders Spanish labels + trailing period, exact format', () => {
    const msg = makeFlujo().invalidTransitionError('medio', 'inicial');
    expect(msg).toBe(
      'No se puede cambiar el estado de "Medio" a "Inicial". ' + 'Transiciones permitidas: Final.'
    );
  });

  it('WITH labels → lists multiple targets comma-joined in config order', () => {
    const msg = makeFlujo().invalidTransitionError('inicial', 'inicial');
    expect(msg).toBe(
      'No se puede cambiar el estado de "Inicial" a "Inicial". ' +
        'Transiciones permitidas: Medio, Final.'
    );
  });

  it('WITH labels + terminal from → "ninguna (estado final)."', () => {
    const msg = makeFlujo().invalidTransitionError('final', 'inicial');
    expect(msg).toBe(
      'No se puede cambiar el estado de "Final" a "Inicial". ' +
        'Transiciones permitidas: ninguna (estado final).'
    );
  });

  it('WITHOUT labels → renders raw state values + trailing period (Ventas shape)', () => {
    const msg = makeToggle().invalidTransitionError('on', 'on');
    expect(msg).toBe(
      'No se puede cambiar el estado de "on" a "on". ' + 'Transiciones permitidas: off.'
    );
  });

  it('reproduces the documented Telas byte-parity target verbatim (AC-3a)', () => {
    // Same DATA as the real Telas machine, fed through the generic factory, to
    // prove the formatter is byte-identical to lib/domain/textiles output
    // asserted at tests/unit/lib/domain/textiles/state-machine.test.ts:121-127.
    type TelaEstado = 'disponible' | 'por_agotarse' | 'agotada' | 'pedida' | 'discontinuada';
    const sm = createStateMachine<TelaEstado>({
      transitions: {
        disponible: ['por_agotarse', 'agotada', 'discontinuada'],
        por_agotarse: ['disponible', 'agotada', 'pedida', 'discontinuada'],
        agotada: ['pedida', 'discontinuada'],
        pedida: ['disponible', 'por_agotarse', 'discontinuada'],
        discontinuada: [],
      },
      labels: {
        disponible: 'Disponible',
        por_agotarse: 'Por agotarse',
        agotada: 'Agotada',
        pedida: 'Pedida',
        discontinuada: 'Descontinuada',
      },
    });
    expect(sm.invalidTransitionError('agotada', 'disponible')).toBe(
      'No se puede cambiar el estado de "Agotada" a "Disponible". ' +
        'Transiciones permitidas: Pedida, Descontinuada.'
    );
  });
});

describe('createStateMachine — generic reusability across machine sizes (AC-8)', () => {
  it('builds a 2-state machine and answers correctly', () => {
    const sm = makeToggle();
    expect(sm.validateTransition('on', 'off')).toBe(true);
    expect(sm.validateTransition('off', 'off')).toBe(false);
    expect(sm.isTerminal('on')).toBe(false);
  });

  it('builds a 5-state machine and answers correctly', () => {
    type Cinco = 'a' | 'b' | 'c' | 'd' | 'e';
    const sm = createStateMachine<Cinco>({
      transitions: {
        a: ['b', 'c'],
        b: ['c', 'd'],
        c: ['d', 'e'],
        d: ['e'],
        e: [],
      },
    });
    expect(Object.keys(sm.VALID_TRANSITIONS)).toHaveLength(5);
    expect(sm.validateTransition('a', 'c')).toBe(true);
    expect(sm.validateTransition('a', 'e')).toBe(false);
    expect(sm.getAvailableTransitions('c')).toEqual(['d', 'e']);
    expect(sm.isTerminal('e')).toBe(true);
  });
});
