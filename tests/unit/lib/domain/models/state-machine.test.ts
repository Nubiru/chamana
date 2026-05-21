/**
 * Unit test — F-Variante-metrosRequeridos-Modelo-estado / G-17 / AC-5.
 *
 * Pure-domain tests for `lib/domain/models/state-machine.ts`. No Payload
 * coupling — mirror of `tests/unit/lib/domain/textiles/state-machine.test.ts`
 * (G-14) for the Modelos lifecycle state machine (3rd manifestation of the
 * collection-state-machine pattern).
 *
 * Coverage:
 *   - VALID_TRANSITIONS shape: 5 keys, each value is an array of ModeloEstado.
 *   - All 25 (5×5) transition pairs: validateTransition returns the correct
 *     boolean for each pair per the matrix in S-7 §3 AC-5.
 *   - getAvailableTransitions per state.
 *   - isTerminal: only 'descontinuada' returns true.
 *   - invalidTransitionError: Spanish text uses LABELS not values; lists
 *     allowed transitions; falls back to "ninguna (estado final)" when none.
 */

import {
  VALID_TRANSITIONS,
  getAvailableTransitions,
  invalidTransitionError,
  isTerminal,
  validateTransition,
} from '@/domain/models/state-machine';
import { ESTADO_LABELS, type ModeloEstado } from '@/domain/models/types';

const ALL_ESTADOS: ModeloEstado[] = [
  'nueva',
  'en_produccion',
  'en_stock',
  'sin_stock',
  'descontinuada',
];

const VALID_PAIRS: Array<[ModeloEstado, ModeloEstado]> = [
  ['nueva', 'en_produccion'],
  ['nueva', 'descontinuada'],
  ['en_produccion', 'nueva'],
  ['en_produccion', 'en_stock'],
  ['en_produccion', 'descontinuada'],
  ['en_stock', 'en_produccion'],
  ['en_stock', 'sin_stock'],
  ['en_stock', 'descontinuada'],
  ['sin_stock', 'en_produccion'],
  ['sin_stock', 'en_stock'],
  ['sin_stock', 'descontinuada'],
];

describe('VALID_TRANSITIONS shape', () => {
  it('declares exactly the 5 lifecycle states', () => {
    expect(Object.keys(VALID_TRANSITIONS).sort()).toEqual([
      'descontinuada',
      'en_produccion',
      'en_stock',
      'nueva',
      'sin_stock',
    ]);
  });

  it('each value is an array of ModeloEstado strings', () => {
    for (const from of ALL_ESTADOS) {
      const targets = VALID_TRANSITIONS[from];
      expect(Array.isArray(targets)).toBe(true);
      for (const t of targets) {
        expect(ALL_ESTADOS).toContain(t);
      }
    }
  });

  it('matches the S-7 AC-5 transition table verbatim', () => {
    expect(VALID_TRANSITIONS).toEqual({
      nueva: ['en_produccion', 'descontinuada'],
      en_produccion: ['nueva', 'en_stock', 'descontinuada'],
      en_stock: ['en_produccion', 'sin_stock', 'descontinuada'],
      sin_stock: ['en_produccion', 'en_stock', 'descontinuada'],
      descontinuada: [],
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

  it('returns empty array for descontinuada (terminal)', () => {
    expect(getAvailableTransitions('descontinuada')).toEqual([]);
  });

  it('nueva yields [en_produccion, descontinuada]', () => {
    expect(getAvailableTransitions('nueva')).toEqual(['en_produccion', 'descontinuada']);
  });

  it('en_produccion yields [nueva, en_stock, descontinuada]', () => {
    expect(getAvailableTransitions('en_produccion')).toEqual([
      'nueva',
      'en_stock',
      'descontinuada',
    ]);
  });

  it('en_stock yields [en_produccion, sin_stock, descontinuada]', () => {
    expect(getAvailableTransitions('en_stock')).toEqual([
      'en_produccion',
      'sin_stock',
      'descontinuada',
    ]);
  });

  it('sin_stock yields [en_produccion, en_stock, descontinuada]', () => {
    expect(getAvailableTransitions('sin_stock')).toEqual([
      'en_produccion',
      'en_stock',
      'descontinuada',
    ]);
  });
});

describe('isTerminal', () => {
  it('returns true ONLY for descontinuada', () => {
    expect(isTerminal('descontinuada')).toBe(true);
    expect(isTerminal('nueva')).toBe(false);
    expect(isTerminal('en_produccion')).toBe(false);
    expect(isTerminal('en_stock')).toBe(false);
    expect(isTerminal('sin_stock')).toBe(false);
  });
});

describe('invalidTransitionError — AC-5/6 Spanish error format', () => {
  it('formats with Spanish LABELS not raw values', () => {
    const msg = invalidTransitionError('nueva', 'en_stock');
    expect(msg).toContain('"Nueva"');
    expect(msg).toContain('"En stock"');
    expect(msg).not.toContain('"nueva"');
    expect(msg).not.toContain('"en_stock"');
  });

  it('matches the spec template verbatim for nueva → en_stock', () => {
    const msg = invalidTransitionError('nueva', 'en_stock');
    expect(msg).toBe(
      'No se puede cambiar el estado de "Nueva" a "En stock". ' +
        'Transiciones permitidas: En produccion, Descontinuada.'
    );
  });

  it('matches the spec template verbatim for en_produccion → sin_stock', () => {
    const msg = invalidTransitionError('en_produccion', 'sin_stock');
    expect(msg).toBe(
      'No se puede cambiar el estado de "En produccion" a "Sin stock". ' +
        'Transiciones permitidas: Nueva, En stock, Descontinuada.'
    );
  });

  it("lists 'ninguna (estado final)' when source is terminal", () => {
    const msg = invalidTransitionError('descontinuada', 'en_stock');
    expect(msg).toContain('Transiciones permitidas: ninguna (estado final)');
    expect(msg).toBe(
      'No se puede cambiar el estado de "Descontinuada" a "En stock". ' +
        'Transiciones permitidas: ninguna (estado final).'
    );
  });

  it('uses ESTADO_LABELS canonical Spanish strings', () => {
    expect(ESTADO_LABELS.nueva).toBe('Nueva');
    expect(ESTADO_LABELS.en_produccion).toBe('En produccion');
    expect(ESTADO_LABELS.en_stock).toBe('En stock');
    expect(ESTADO_LABELS.sin_stock).toBe('Sin stock');
    expect(ESTADO_LABELS.descontinuada).toBe('Descontinuada');
  });

  it('handles en_stock → nueva (rejected per matrix)', () => {
    const msg = invalidTransitionError('en_stock', 'nueva');
    expect(msg).toContain('"En stock"');
    expect(msg).toContain('"Nueva"');
    expect(msg).toContain('En produccion, Sin stock, Descontinuada');
  });

  it('handles sin_stock → nueva (rejected per matrix)', () => {
    const msg = invalidTransitionError('sin_stock', 'nueva');
    expect(msg).toContain('"Sin stock"');
    expect(msg).toContain('"Nueva"');
    expect(msg).toContain('En produccion, En stock, Descontinuada');
  });
});
