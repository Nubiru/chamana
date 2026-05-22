import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload';

/**
 * F-storefront-freshness AC-2 (ADR-014 HYBRID) — on-mutation cache invalidation.
 *
 * The storefront is statically prerendered with a per-page ISR `revalidate` net
 * (the coarse self-heal). This factory is the *instant*, event-driven half: wired
 * as a Payload `afterChange` / `afterDelete` hook on the storefront-feeding
 * collections + globals, it calls Next's `revalidatePath` so an admin/Cleo edit
 * reaches the static site WITHOUT a redeploy.
 *
 * Two deliberate non-negotiables (ADR-014 §3):
 *   1. CONTEXT GUARD — `afterChange` also fires during seed / migrate / CLI runs
 *      where there is NO Next request context and `revalidatePath` THROWS. A cache
 *      hint must never break the write that triggered it (e.g. a stock update must
 *      not fail because a revalidation could not run), so the call is try/catch-
 *      swallowed (warn only, mirroring `queries.ts:49`). The ISR net is the
 *      correctness fallback when the in-process hint cannot fire.
 *   2. NO DB WRITES — the hook only emits cache hints. This keeps it loop-safe:
 *      `ventasStockSync` → `payload.update(modelos)` → Modelos `afterChange`
 *      (this hook) does not write, so it cannot re-trigger the chain.
 */

/** A revalidation target: a literal path, or `[path, 'page'|'layout']` for dynamic-route / layout scope. */
export type RevalidateTarget = string | [path: string, type: 'page' | 'layout'];

/**
 * The factory output is wired into collection `afterChange`/`afterDelete` and
 * global `afterChange` slots, so it must satisfy all three Payload hook shapes.
 * A single function cannot be cleanly typed as all three at once (their arg
 * shapes diverge); the boundary cast (below) is the spec-blessed permissive type.
 */
export type StorefrontRevalidateHook = CollectionAfterChangeHook &
  CollectionAfterDeleteHook &
  GlobalAfterChangeHook;

/** Marker property stamped on every factory-made hook so wiring tests + future readers can
 * structurally identify a revalidation hook (Ventas must carry NONE — cascade-by-design). */
export const REVALIDATE_HOOK_MARKER = '__storefrontRevalidate';

/** True iff `fn` is a hook produced by {@link makeRevalidateHook}. */
export function isRevalidateHook(fn: unknown): boolean {
  return typeof fn === 'function' && REVALIDATE_HOOK_MARKER in (fn as object);
}

async function revalidateTargets(targets: RevalidateTarget[]): Promise<void> {
  try {
    // `next/cache` is imported DYNAMICALLY (not at module top level) ON PURPOSE.
    // This hook module lives in payload.config.ts's STATIC import graph (9
    // collections/globals import it). `next/cache` carries a top-level await, and
    // the standalone Payload CLI loads the config through a CJS `require()` path
    // (tsx) that CANNOT require an ESM-with-TLA on Node 22 → it crashes with
    // ERR_REQUIRE_ASYNC_MODULE on `payload migrate` / `migrate:status` and the
    // prod `migrate:deploy` build step. Loading it lazily here keeps next/cache
    // OUT of the static config graph: it is pulled in only when the hook actually
    // fires (a real Next request context). DO NOT hoist this back to a top-level
    // `import { revalidatePath } from 'next/cache'` — that silently re-breaks the
    // Payload CLI and every production migrate:deploy.
    const { revalidatePath } = await import('next/cache');
    for (const target of targets) {
      if (typeof target === 'string') {
        revalidatePath(target);
      } else {
        revalidatePath(target[0], target[1]);
      }
    }
  } catch (err: unknown) {
    // No request context (seed/migrate/CLI) → revalidatePath throws. Swallow:
    // the cache hint is best-effort and must never break the originating write.
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[revalidate-storefront] revalidatePath skipped (no request context): ${msg.slice(0, 80)}`
    );
  }
}

/**
 * Build a Payload `afterChange`/`afterDelete` hook that revalidates `targets`.
 * Returns the passed `doc` (afterChange contract) — harmless/ignored for afterDelete.
 *
 * The hook is `async` because `revalidateTargets` lazily `await import`s
 * `next/cache` (see the rationale on that function). Payload `afterChange` /
 * `afterDelete` / global-`afterChange` hooks may be async and return a
 * `Promise<doc>`; awaiting the revalidation keeps the context-guard's try/catch
 * effective across the dynamic-import boundary.
 */
export function makeRevalidateHook(targets: RevalidateTarget[]): StorefrontRevalidateHook {
  const hook = async (args: { doc?: unknown }) => {
    await revalidateTargets(targets);
    return args.doc;
  };
  (hook as unknown as Record<string, unknown>)[REVALIDATE_HOOK_MARKER] = targets;
  return hook as unknown as StorefrontRevalidateHook;
}
