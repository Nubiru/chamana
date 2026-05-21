import type { CollectionBeforeChangeHook } from 'payload';
import { invalidTransitionError, validateTransition } from '../../domain/textiles/state-machine.ts';
import type { TelaEstado } from '../../domain/textiles/types.ts';

/**
 * F-Telas-state-machine AC-6 — Payload adapter for the textiles state-machine.
 *
 * Mirror of `ventas-state-machine.ts` (G-10) shape. Pure domain logic lives in
 * `lib/domain/textiles/state-machine.ts`; this file is the Payload-side wiring
 * that reads originalDoc + incoming data and throws a Spanish error on invalid
 * transitions.
 *
 * Semantics (matches G-10):
 *   - operation 'create' → no transition to validate (estado is whatever
 *     defaultValue or admin-form picked from the closed enum). Return data.
 *   - operation 'update' AND oldStatus === newStatus → no-op (Cintia edited
 *     some other field). Return data unchanged.
 *   - operation 'update' AND oldStatus !== newStatus → call validateTransition.
 *     Invalid → throw with Spanish error message (Payload bubbles it as a
 *     save failure visible in admin). Valid → return data.
 *
 * Defensive: missing oldStatus / newStatus (legacy row pre-migration, or
 * Cintia editing a field that does not touch estado) → no-op. Symmetric to
 * G-10's behavior.
 */
export const telasStateMachine: CollectionBeforeChangeHook = ({ data, originalDoc, operation }) => {
  if (operation === 'create') return data;

  const oldStatus = originalDoc?.estado as TelaEstado | undefined;
  const newStatus = data.estado as TelaEstado | undefined;

  if (!oldStatus || !newStatus || oldStatus === newStatus) return data;

  if (!validateTransition(oldStatus, newStatus)) {
    throw new Error(invalidTransitionError(oldStatus, newStatus));
  }

  return data;
};
