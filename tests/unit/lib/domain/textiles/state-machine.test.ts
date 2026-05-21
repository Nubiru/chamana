/**
 * Unit test — F-Telas-state-machine / G-14 / AC-5 + AC-6.
 *
 * Pure-domain tests for `lib/domain/textiles/state-machine.ts`. No Payload
 * coupling — same shape as `tests/unit/lib/payload/hooks/ventas-state-machine`
 * but for the textiles state machine.
 *
 * Coverage:
 *   - VALID_TRANSITIONS shape: 5 keys, each value is an array of TelaEstado.
 *   - All 25 (5×5) transition pairs: validateTransition returns the correct
 *     boolean for each pair per the matrix in S-6 §3 AC-5.
 *   - getAvailableTransitions per state.
 *   - isTerminal: only 'discontinuada' returns true.
 *   - invalidTransitionError: Spanish text uses LABELS not values; lists
 *     allowed transitions; falls back to "ninguna (estado final)" when none.
 */

import {
  VALID_TRANSITIONS,
  getAvailableTransitions,
  invalidTransitionError,
  isTerminal,
  validateTransition,
} from '@/domain/textiles/state-machine';
import { ESTADO_LABELS, type TelaEstado } from '@/domain/textiles/types';

const ALL_ESTADOS: TelaEstado[] = [
  'disponible',
  'por_agotarse',
  'agotada',
  'pedida',
  'discontinuada',
];

const VALID_PAIRS: Array<[TelaEstado, TelaEstado]> = [
  ['disponible', 'por_agotarse'],
  ['disponible', 'agotada'],
  ['disponible', 'discontinuada'],
  ['por_agotarse', 'disponible'],
  ['por_agotarse', 'agotada'],
  ['por_agotarse', 'pedida'],
  ['por_agotarse', 'discontinuada'],
  ['agotada', 'pedida'],
  ['agotada', 'discontinuada'],
  ['pedida', 'disponible'],
  ['pedida', 'por_agotarse'],
  ['pedida', 'discontinuada'],
];

describe('VALID_TRANSITIONS shape', () => {
  it('declares exactly the 5 lifecycle states', () => {
    expect(Object.keys(VALID_TRANSITIONS).sort()).toEqual([
      'agotada',
      'discontinuada',
      'disponible',
      'pedida',
      'por_agotarse',
    ]);
  });

  it('each value is an array of TelaEstado strings', () => {
    for (const from of ALL_ESTADOS) {
      const targets = VALID_TRANSITIONS[from];
      expect(Array.isArray(targets)).toBe(true);
      for (const t of targets) {
        expect(ALL_ESTADOS).toContain(t);
      }
    }
  });

  it('matches the S-6 AC-5 transition table verbatim', () => {
    expect(VALID_TRANSITIONS).toEqual({
      disponible: ['por_agotarse', 'agotada', 'discontinuada'],
      por_agotarse: ['disponible', 'agotada', 'pedida', 'discontinuada'],
      agotada: ['pedida', 'discontinuada'],
      pedida: ['disponible', 'por_agotarse', 'discontinuada'],
      discontinuada: [],
    });
  });
});

describe('validateTransition — 25 (5×5) coverage matrix', () => {
  // Generate one test per pair so failures pinpoint the exact cell.
  for (const from of ALL_ESTADOS) {
    for (const to of ALL_ESTADOS) {
      const isValid = VALID_PAIRS.some(([f, t]) => f === from && t === to);
      it(`${from} → ${to} ⇒ ${isValid ? 'valid' : 'invalid'}`, () => {
        expect(validateTransition(from, to)).toBe(isValid);
      });
    }
  }
});

describe('getAvailableTransitions', () => {
  it('returns the exact VALID_TRANSITIONS row for each estado', () => {
    for (const from of ALL_ESTADOS) {
      expect(getAvailableTransitions(from)).toEqual(VALID_TRANSITIONS[from]);
    }
  });

  it('returns empty array for discontinuada (terminal)', () => {
    expect(getAvailableTransitions('discontinuada')).toEqual([]);
  });
});

describe('isTerminal', () => {
  it('returns true ONLY for discontinuada', () => {
    expect(isTerminal('discontinuada')).toBe(true);
    expect(isTerminal('disponible')).toBe(false);
    expect(isTerminal('por_agotarse')).toBe(false);
    expect(isTerminal('agotada')).toBe(false);
    expect(isTerminal('pedida')).toBe(false);
  });
});

describe('invalidTransitionError — AC-6 Spanish error format', () => {
  it('formats with Spanish LABELS not raw values', () => {
    const msg = invalidTransitionError('agotada', 'disponible');
    expect(msg).toContain('"Agotada"');
    expect(msg).toContain('"Disponible"');
    expect(msg).not.toContain('"agotada"');
    expect(msg).not.toContain('"por_agotarse"');
  });

  it('matches the spec template verbatim (AC-6 contract)', () => {
    const msg = invalidTransitionError('agotada', 'disponible');
    expect(msg).toBe(
      'No se puede cambiar el estado de "Agotada" a "Disponible". ' +
        'Transiciones permitidas: Pedida, Descontinuada.'
    );
  });

  it("lists 'ninguna (estado final)' when source is terminal", () => {
    const msg = invalidTransitionError('discontinuada', 'disponible');
    expect(msg).toContain('Transiciones permitidas: ninguna (estado final)');
  });

  it('uses ESTADO_LABELS canonical Spanish strings', () => {
    // Spot-check each label resolves to the value it documents.
    expect(ESTADO_LABELS.disponible).toBe('Disponible');
    expect(ESTADO_LABELS.por_agotarse).toBe('Por agotarse');
    expect(ESTADO_LABELS.agotada).toBe('Agotada');
    expect(ESTADO_LABELS.pedida).toBe('Pedida');
    expect(ESTADO_LABELS.discontinuada).toBe('Descontinuada');
  });

  it('handles pedida → agotada (rejected per matrix)', () => {
    const msg = invalidTransitionError('pedida', 'agotada');
    expect(msg).toContain('"Pedida"');
    expect(msg).toContain('"Agotada"');
    expect(msg).toContain('Disponible, Por agotarse, Descontinuada');
  });
});
