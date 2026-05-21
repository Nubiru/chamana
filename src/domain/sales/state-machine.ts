import { createStateMachine } from '../shared/state-machine-factory.ts';
import type { VentaEstado } from './types.ts';

/**
 * Venta lifecycle state-machine — G-10, refactored onto the generic factory
 * (`lib/domain/shared/state-machine-factory.ts`, G-18 / S-9) by G-19. The
 * transition table below is the only per-machine DATA; the
 * validate / getAvailable / isTerminal logic now lives once in the factory
 * (Pillar-3 DRY + SOLID-OCP — a future 5th lifecycle declares only its table).
 *
 * NO `labels` argument: the Venta transition-error string is formed inline-raw
 * (raw state values, NO trailing period) by the Payload adapter
 * `lib/payload/hooks/ventas-state-machine.ts`, which is why this module never
 * exported `invalidTransitionError`. Converging that adapter onto the factory's
 * label-formatted `invalidTransitionError` (raw→label) is a deliberately
 * separate TECH_DEBT-LOW task (S-9 AC-10 realized divergence) — NOT done here,
 * so the 18 Ventas assertions stay GREEN with zero edits.
 */
const machine = createStateMachine<VentaEstado>({
  transitions: {
    pendiente: ['pagada', 'cancelada'],
    pagada: ['enviada', 'cancelada'],
    enviada: ['entregada'],
    entregada: [],
    cancelada: [],
  },
});

export const VALID_TRANSITIONS = machine.VALID_TRANSITIONS;
export const validateTransition = machine.validateTransition;
export const getAvailableTransitions = machine.getAvailableTransitions;
export const isTerminal = machine.isTerminal;
