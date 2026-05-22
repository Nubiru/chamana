/**
 * Unit — Cleo bridge dry-run + confirm gating (AC-4, AC-5).
 *
 * confirm-before-mutate is a STRUCTURAL property of the bridge: absent
 * `--confirm`, a mutation verb returns a read-back and does NOT write;
 * `--dry-run` resolves + returns the would-be write without writing and is
 * DEFAULT-ON for prod-pointing invocations.
 */

import {
  type BridgePayload,
  type BridgeResult,
  type MutationOpts,
  resolveDryRun,
  sell,
} from '../../../scripts/cleo-bridge.ts';

function spyPayload(): { payload: BridgePayload; calls: { create: number; update: number } } {
  const calls = { create: 0, update: 0 };
  const payload: BridgePayload = {
    async create({ data }) {
      calls.create += 1;
      return { id: 1, ...data };
    },
    async update({ id, data }) {
      calls.update += 1;
      return { id, ...data };
    },
    async find() {
      return { docs: [] };
    },
    async findByID() {
      return null;
    },
  };
  return { payload, calls };
}

const validArgs = {
  modeloId: 'm1',
  variante: 'magia-linchoc',
  compradora: 'María',
  precio: 45000,
  fechaVenta: '2026-05-22',
};

function okResult(res: BridgeResult): Record<string, unknown> {
  expect(res.ok).toBe(true);
  return (res as { ok: true; result: Record<string, unknown> }).result;
}

describe('unit — cleo-bridge confirm + dry-run (AC-4 / AC-5)', () => {
  it('AC-4: --dry-run resolves + returns the would-be write but does NOT write', async () => {
    const { payload, calls } = spyPayload();
    const opts: MutationOpts = { dryRun: true, confirm: true };

    const result = okResult(await sell(payload, validArgs, opts));
    expect(result.status).toBe('dry-run');
    expect((result.wouldWrite as Record<string, unknown>).compradora).toBe('María');
    expect(calls.create).toBe(0); // no write
  });

  it('AC-5: without --confirm, sell refuses and returns a read-back (no write)', async () => {
    const { payload, calls } = spyPayload();
    const opts: MutationOpts = { dryRun: false, confirm: false };

    const result = okResult(await sell(payload, validArgs, opts));
    expect(result.status).toBe('needs-confirm');
    expect((result.readBack as Record<string, unknown>).precio).toBe(45000);
    expect(calls.create).toBe(0); // no write
  });

  it('AC-5: with --confirm, the live write fires exactly once', async () => {
    const { payload, calls } = spyPayload();
    const opts: MutationOpts = { dryRun: false, confirm: true };

    const result = okResult(await sell(payload, validArgs, opts));
    expect(result.status).toBe('written');
    expect(calls.create).toBe(1);
  });

  it('AC-4: dry-run is DEFAULT-ON for prod-pointing invocations, OFF for dev', () => {
    // prod-pointing → default on
    expect(resolveDryRun({}, { CLEO_TARGET: 'prod' })).toBe(true);
    expect(resolveDryRun({}, { NODE_ENV: 'production' })).toBe(true);
    // dev → default off
    expect(resolveDryRun({}, {})).toBe(false);
    // explicit flags win over the default
    expect(resolveDryRun({ live: true }, { CLEO_TARGET: 'prod' })).toBe(false);
    expect(resolveDryRun({ dryRun: true }, {})).toBe(true);
  });
});
