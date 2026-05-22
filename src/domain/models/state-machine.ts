import { createStateMachine } from '../shared/state-machine-factory.ts';
import { ESTADO_LABELS, type ModeloEstado } from './types.ts';

/**
 * F-Variante-metrosRequeridos-Modelo-estado AC-5/6 — transition matrix +
 * Spanish error, refactored onto the generic factory
 * (`lib/domain/shared/state-machine-factory.ts`, G-18 / S-9) by G-19. The
 * transition table + `ESTADO_LABELS` are the only per-machine DATA;
 * validate / getAvailable / isTerminal / invalidTransitionError live once in the
 * factory (Pillar-3 DRY + SOLID-OCP). Pure functions only; no Payload coupling
 * (Hexagonal §2.4). The Payload adapter lives in
 * `lib/payload/hooks/modelos-state-machine.ts`.
 *
 * `labels: ESTADO_LABELS` is passed, so `invalidTransitionError` renders human
 * Spanish strings ("En stock") + trailing period — the format Daniela reads in
 * admin save errors. Byte-stable exports preserve the 40 Modelos assertions.
 *
 * Realism notes per S-7 §3 AC-5:
 *   - nueva → en_produccion (Daniela decides to begin sewing), descontinuada
 *     (drop the design before any work).
 *   - en_produccion → nueva (cancel the production run, back to design),
 *     en_stock (first batch ready), descontinuada (cancel and retire).
 *   - en_stock ↔ sin_stock bidirectional (stock depletes / Daniela receives
 *     unaccounted buffer or corrects stockVendido), en_produccion (reopen
 *     production for more units), descontinuada.
 *   - sin_stock → en_produccion (reorder atelier run), en_stock (recovered
 *     stock), descontinuada (decide not to restock; terminal).
 *   - descontinuada → ninguna (terminal state, one-way).
 *
 * Prohibited (per S-7 §3):
 *   - nueva → en_stock / sin_stock (cannot skip production; a Modelo physically
 *     gets sewn before it sells).
 *   - en_produccion → sin_stock (cannot be "agotado" without ever being in
 *     stock).
 *   - en_stock → nueva, sin_stock → nueva (no return to design phase).
 *   - descontinuada → anything (terminal).
 */
const machine = createStateMachine<ModeloEstado>({
  transitions: {
    nueva: ['en_produccion', 'descontinuada'],
    en_produccion: ['nueva', 'en_stock', 'descontinuada'],
    en_stock: ['en_produccion', 'sin_stock', 'descontinuada'],
    sin_stock: ['en_produccion', 'en_stock', 'descontinuada'],
    descontinuada: [],
  },
  labels: ESTADO_LABELS,
});

export const VALID_TRANSITIONS = machine.VALID_TRANSITIONS;
export const validateTransition = machine.validateTransition;
export const getAvailableTransitions = machine.getAvailableTransitions;
export const isTerminal = machine.isTerminal;
export const invalidTransitionError = machine.invalidTransitionError;
