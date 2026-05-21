import { createStateMachine } from '../shared/state-machine-factory.ts';
import { ESTADO_LABELS, type TelaEstado } from './types.ts';

/**
 * F-Telas-state-machine AC-5/6 — transition matrix + Spanish error, refactored
 * onto the generic factory (`lib/domain/shared/state-machine-factory.ts`,
 * G-18 / S-9) by G-19. The transition table + `ESTADO_LABELS` are the only
 * per-machine DATA; validate / getAvailable / isTerminal / invalidTransitionError
 * live once in the factory (Pillar-3 DRY + SOLID-OCP). Pure functions only; no
 * Payload coupling (Hexagonal §2.4). The Payload adapter lives in
 * `lib/payload/hooks/telas-state-machine.ts`.
 *
 * `labels: ESTADO_LABELS` is passed, so `invalidTransitionError` renders human
 * Spanish strings ("Disponible") + trailing period — the format Cintia reads in
 * admin save errors. Byte-stable exports preserve the 18 Telas assertions.
 *
 * Realism notes per S-6 §3:
 *   - disponible → por_agotarse / agotada / discontinuada (natural depletion).
 *   - por_agotarse → disponible (Cintia recibió buffer no contabilizado),
 *     agotada, pedida (Cintia ya pidió reposición), discontinuada.
 *   - agotada → pedida (reposición) o discontinuada. NUNCA → disponible
 *     directo (la tela no resucita sin un pedido intermedio).
 *   - pedida → disponible (llegó el pedido), por_agotarse (llegó parcial),
 *     discontinuada (proveedor canceló). NUNCA → agotada (un pedido no se
 *     agota antes de llegar).
 *   - discontinuada → ninguna (estado terminal one-way).
 */
const machine = createStateMachine<TelaEstado>({
  transitions: {
    disponible: ['por_agotarse', 'agotada', 'discontinuada'],
    por_agotarse: ['disponible', 'agotada', 'pedida', 'discontinuada'],
    agotada: ['pedida', 'discontinuada'],
    pedida: ['disponible', 'por_agotarse', 'discontinuada'],
    discontinuada: [],
  },
  labels: ESTADO_LABELS,
});

export const VALID_TRANSITIONS = machine.VALID_TRANSITIONS;
export const validateTransition = machine.validateTransition;
export const getAvailableTransitions = machine.getAvailableTransitions;
export const isTerminal = machine.isTerminal;
export const invalidTransitionError = machine.invalidTransitionError;
