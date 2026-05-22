/**
 * Unit test — G-41 / F-storefront-freshness AC-6 #2 (hook behavior).
 *
 * Guards the makeRevalidateHook factory (ADR-014 HYBRID, the on-mutation half):
 *   (a) it calls revalidatePath once per target (path-only + [path,'page']) and
 *       returns the passed doc (the afterChange contract);
 *   (b) the CONTEXT GUARD — when revalidatePath throws (no Next request context,
 *       i.e. seed/migrate/CLI), the hook does NOT throw and still returns the doc
 *       (a cache hint must never break the originating write);
 *   (c) it performs NO payload write (never touches req.payload.update — loop-safety).
 *
 * `next/cache` is mocked so revalidatePath is observable + throw-injectable.
 * The hook lazy-loads next/cache via `await import('next/cache')` (it must not
 * sit in payload.config.ts's static graph — that crashes the Payload CLI on
 * Node 22), so the hook is async; jest.mock intercepts the dynamic import too,
 * and each test awaits the hook before asserting.
 * G26: every expect can fail. G22: no try/catch in test bodies. G23: no silent skips.
 */

import { type RevalidateTarget, makeRevalidateHook } from '@/payload/hooks/revalidate-storefront';
import { revalidatePath } from 'next/cache';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const mockRevalidatePath = revalidatePath as jest.Mock;

/** Loosen the Payload intersection type to a plain callable for test invocation. */
function callable(targets: RevalidateTarget[]) {
  return makeRevalidateHook(targets) as unknown as (args: {
    doc?: unknown;
    req?: unknown;
  }) => Promise<unknown>;
}

describe('makeRevalidateHook — G-41 storefront cache-invalidation factory', () => {
  beforeEach(() => {
    mockRevalidatePath.mockReset();
  });

  it('calls revalidatePath once per target (path + [path,type]) and returns the doc', async () => {
    const hook = callable(['/x', ['/y', 'page']]);
    const doc = { id: 1, slug: 'demo' };

    const result = await hook({ doc });

    expect(mockRevalidatePath).toHaveBeenCalledWith('/x');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/y', 'page');
    expect(mockRevalidatePath).toHaveBeenCalledTimes(2);
    expect(result).toBe(doc);
  });

  it('CONTEXT GUARD: does not reject and still returns the doc when revalidatePath throws', async () => {
    mockRevalidatePath.mockImplementation(() => {
      throw new Error('Invariant: static generation store missing in revalidatePath');
    });
    const hook = callable(['/tienda']);
    const doc = { id: 2 };

    // The guard swallows the throw from the lazy-imported revalidatePath, so the
    // async hook RESOLVES (does not reject) with the doc — a cache hint must
    // never break the originating write.
    await expect(hook({ doc })).resolves.toBe(doc);
  });

  it('performs NO payload write (never calls req.payload.update — loop-safety)', async () => {
    const update = jest.fn();
    const hook = callable(['/x']);

    await hook({ doc: { id: 3 }, req: { payload: { update } } });

    expect(update).not.toHaveBeenCalled();
  });
});
