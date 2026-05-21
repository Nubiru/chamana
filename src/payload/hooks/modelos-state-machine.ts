import type { CollectionBeforeChangeHook } from 'payload';
import { invalidTransitionError, validateTransition } from '../../domain/models/state-machine.ts';
import type { ModeloEstado } from '../../domain/models/types.ts';

/**
 * F-Variante-metrosRequeridos-Modelo-estado AC-5/6 — Payload adapter for the
 * Modelo lifecycle state-machine.
 *
 * Mirror of `telas-state-machine.ts` (G-14) and `ventas-state-machine.ts`
 * (G-10) shape — 3rd manifestation of the collection-state-machine pattern.
 * Pure domain logic lives in `lib/domain/models/state-machine.ts`; this file
 * is the Payload-side wiring that reads originalDoc + incoming data and
 * throws a Spanish error on invalid transitions.
 *
 * Semantics (matches G-10 / G-14):
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
 * G-10 / G-14 behavior.
 */
export const modelosStateMachine: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation === 'create') return data;

  const oldStatus = originalDoc?.estado as ModeloEstado | undefined;
  const newStatus = data.estado as ModeloEstado | undefined;

  if (!oldStatus || !newStatus || oldStatus === newStatus) return data;

  if (!validateTransition(oldStatus, newStatus)) {
    throw new Error(invalidTransitionError(oldStatus, newStatus));
  }

  return data;
};
