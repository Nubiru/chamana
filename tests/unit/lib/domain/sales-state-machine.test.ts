import {
  VALID_TRANSITIONS,
  getAvailableTransitions,
  isTerminal,
  validateTransition,
} from '@/lib/domain/sales/state-machine';
import type { VentaEstado } from '@/lib/domain/sales/types';

const ALL_STATES: VentaEstado[] = ['pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'];

describe('validateTransition', () => {
  describe('valid transitions', () => {
    const validCases: [VentaEstado, VentaEstado][] = [
      ['pendiente', 'pagada'],
      ['pendiente', 'cancelada'],
      ['pagada', 'enviada'],
      ['pagada', 'cancelada'],
      ['enviada', 'entregada'],
    ];

    it.each(validCases)('%s -> %s is valid', (from, to) => {
      expect(validateTransition(from, to)).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    const invalidCases: [VentaEstado, VentaEstado][] = [
      ['pendiente', 'enviada'],
      ['pendiente', 'entregada'],
      ['pagada', 'pendiente'],
      ['pagada', 'entregada'],
      ['enviada', 'pendiente'],
      ['enviada', 'pagada'],
      ['enviada', 'cancelada'],
      ['entregada', 'pendiente'],
      ['entregada', 'pagada'],
      ['entregada', 'enviada'],
      ['entregada', 'cancelada'],
      ['cancelada', 'pendiente'],
      ['cancelada', 'pagada'],
      ['cancelada', 'enviada'],
      ['cancelada', 'entregada'],
    ];

    it.each(invalidCases)('%s -> %s is invalid', (from, to) => {
      expect(validateTransition(from, to)).toBe(false);
    });
  });

  it('self-transitions are invalid for all states', () => {
    for (const state of ALL_STATES) {
      expect(validateTransition(state, state)).toBe(false);
    }
  });
});

describe('getAvailableTransitions', () => {
  it('pendiente can transition to pagada or cancelada', () => {
    expect(getAvailableTransitions('pendiente')).toEqual(['pagada', 'cancelada']);
  });

  it('pagada can transition to enviada or cancelada', () => {
    expect(getAvailableTransitions('pagada')).toEqual(['enviada', 'cancelada']);
  });

  it('enviada can only transition to entregada', () => {
    expect(getAvailableTransitions('enviada')).toEqual(['entregada']);
  });

  it('entregada has no available transitions', () => {
    expect(getAvailableTransitions('entregada')).toEqual([]);
  });

  it('cancelada has no available transitions', () => {
    expect(getAvailableTransitions('cancelada')).toEqual([]);
  });
});

describe('isTerminal', () => {
  it('entregada is terminal', () => {
    expect(isTerminal('entregada')).toBe(true);
  });

  it('cancelada is terminal', () => {
    expect(isTerminal('cancelada')).toBe(true);
  });

  it('pendiente is not terminal', () => {
    expect(isTerminal('pendiente')).toBe(false);
  });

  it('pagada is not terminal', () => {
    expect(isTerminal('pagada')).toBe(false);
  });

  it('enviada is not terminal', () => {
    expect(isTerminal('enviada')).toBe(false);
  });
});

describe('VALID_TRANSITIONS map', () => {
  it('covers all five states', () => {
    expect(Object.keys(VALID_TRANSITIONS).sort()).toEqual(ALL_STATES.sort());
  });

  it('all target states are valid VentaEstado values', () => {
    for (const targets of Object.values(VALID_TRANSITIONS)) {
      for (const target of targets) {
        expect(ALL_STATES).toContain(target);
      }
    }
  });
});
