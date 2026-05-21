/**
 * Generic finite-state-machine factory — F-state-machine-factory / S-9 / G-18.
 *
 * Extracts the structurally-identical shape repeated across the three domain
 * state-machines (`lib/domain/sales/state-machine.ts` G-10,
 * `lib/domain/textiles/state-machine.ts` G-14,
 * `lib/domain/models/state-machine.ts` G-16) into ONE generic builder. The
 * per-machine variation is DATA — the transition table + the optional Spanish
 * label map — not code. A future 5th lifecycle (Pedidos, Clientes, …) declares
 * only its `transitions` (+ optional `labels`); the generic logic lives here
 * once. Pillar-5 family graduation event (S-9 §0); Pillar-7 ADAPTER-NOT-COPIER.
 *
 * Pure functions only; no Payload coupling (Hexagonal §2.4). The Payload
 * adapters in `lib/payload/hooks/{ventas,telas,modelos}-state-machine.ts`
 * remain the imperative boundary.
 *
 * Error-shape flexibility (S-9 §2.3 + AC-10): `labels` is the single switch
 * reproducing the two error formats already in the codebase —
 *   - WITH labels  → human Spanish strings ("Disponible") — Telas/Modelos shape.
 *   - WITHOUT labels → raw state values ("disponible")    — legacy-Ventas shape.
 * The factory supports BOTH so migrating consumers (G-N-B) is non-breaking and
 * the realized Ventas divergence need not be force-converged here.
 */

/**
 * Declarative configuration for one finite state machine.
 *
 * @typeParam S — the union of state literals (e.g. `'pendiente' | 'pagada' …`).
 */
export interface StateMachineConfig<S extends string> {
  /** Adjacency table: for each state, the states it may transition to. */
  transitions: Record<S, S[]>;
  /**
   * Optional Spanish display labels per state. When PRESENT,
   * `invalidTransitionError` renders human labels ("Disponible"); when ABSENT,
   * it renders raw state values ("disponible"). See S-9 §2.3 + AC-10.
   */
  labels?: Record<S, string>;
}

/**
 * The public surface every domain state-machine module re-exports. Member
 * names + signatures are byte-stable so the existing modules keep their exact
 * exports after migrating onto the factory (S-9 §7.3 consumer map).
 */
export interface StateMachine<S extends string> {
  /** The configured adjacency table (same reference as `config.transitions`). */
  VALID_TRANSITIONS: Record<S, S[]>;
  /** True iff `from → to` is an allowed edge. Throws on an unknown `from` (AC-3b). */
  validateTransition(from: S, to: S): boolean;
  /** The states reachable from `state` (the raw row; `[]` for a terminal). */
  getAvailableTransitions(state: S): S[];
  /** True iff `state` has zero outgoing edges. */
  isTerminal(state: S): boolean;
  /** Canonical Spanish error for an invalid transition (labels-if-present + period). */
  invalidTransitionError(from: S, to: S): string;
}

/**
 * Build a state machine from its declarative config.
 *
 * Preserves the legacy unguarded-lookup semantics (S-9 AC-3b): when `from` is
 * not a key of `transitions`, `transitions[from]` is `undefined` and the
 * subsequent `.includes` / `.length` throws a `TypeError` — exactly as the
 * hand-written modules did, which the adapters surface as a thrown error.
 * Hardening unknown-state handling is a deliberate behavior change deferred to
 * a separate task (S-9 §10 follow-up #2).
 */
export function createStateMachine<S extends string>(
  config: StateMachineConfig<S>
): StateMachine<S> {
  const { transitions, labels } = config;

  /** Render a state as its label if labels are configured, else raw value. */
  const display = (state: S): string => (labels ? labels[state] : state);

  function getAvailableTransitions(state: S): S[] {
    return transitions[state];
  }

  function validateTransition(from: S, to: S): boolean {
    return transitions[from].includes(to);
  }

  function isTerminal(state: S): boolean {
    return transitions[state].length === 0;
  }

  function invalidTransitionError(from: S, to: S): string {
    const allowed = getAvailableTransitions(from);
    const allowedDisplay = allowed.length
      ? allowed.map((state) => display(state)).join(', ')
      : 'ninguna (estado final)';
    return (
      `No se puede cambiar el estado de "${display(from)}" a "${display(to)}". ` +
      `Transiciones permitidas: ${allowedDisplay}.`
    );
  }

  return {
    VALID_TRANSITIONS: transitions,
    validateTransition,
    getAvailableTransitions,
    isTerminal,
    invalidTransitionError,
  };
}
