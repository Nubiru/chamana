/**
 * Integration — Cleo bridge `produce` verb.
 *
 * `produce` updates `variantes[i].stockTotal`; the `autoStock` beforeChange hook
 * (run by the stub on every `modelos.update`) recomputes `sinStock`. The bridge
 * names ONLY stockTotal — proving the derived column stays hook-owned (AC-3).
 */

import os from 'node:os';
import path from 'node:path';
import { type MutationOpts, produce } from '../../../scripts/cleo-bridge.ts';
import { buildCleoPayloadStub } from '../../helpers/cleo-payload-stub.ts';

function tmpAudit(): string {
  return path.join(
    os.tmpdir(),
    `cleo-audit-produce-${Date.now()}-${Math.random().toString(36).slice(2)}.log`
  );
}

function buildStub() {
  return buildCleoPayloadStub({
    modelos: [
      {
        id: 'm1',
        variantes: [
          // Sold out: stockVendido === stockTotal → sinStock currently true.
          { varianteId: 'magia-linchoc', stockTotal: 2, stockVendido: 2, sinStock: true },
        ],
      },
    ],
  });
}

describe('integration — cleo-bridge produce', () => {
  it('adds units to stockTotal and lets autoStock recompute sinStock back to false', async () => {
    const stub = buildStub();
    const opts: MutationOpts = { dryRun: false, confirm: true, auditPath: tmpAudit() };

    const res = await produce(
      stub.payload,
      { modeloId: 'm1', variante: 'magia-linchoc', cantidad: 3 },
      opts
    );
    expect(res.ok).toBe(true);

    const variante = (
      stub.store.modelos.get('m1')?.variantes as Array<{
        stockTotal?: number;
        stockVendido?: number;
        sinStock?: boolean;
      }>
    )[0];
    expect(variante.stockTotal).toBe(5); // 2 + 3 — the legitimate production input
    expect(variante.stockVendido).toBe(2); // untouched by the bridge
    expect(variante.sinStock).toBe(false); // 2 < 5 → autoStock flipped it back
  });

  it('refuses an unknown varianteId without writing', async () => {
    const stub = buildStub();
    const res = await produce(
      stub.payload,
      { modeloId: 'm1', variante: 'no-existe', cantidad: 3 },
      { dryRun: false, confirm: true, auditPath: tmpAudit() }
    );
    expect(res.ok).toBe(false);
    expect((res as { ok: false; error: string }).error).toMatch(/no encontrada/i);
    const variante = (stub.store.modelos.get('m1')?.variantes as Array<{ stockTotal?: number }>)[0];
    expect(variante.stockTotal).toBe(2); // unchanged
  });

  it('rejects a non-positive cantidad', async () => {
    const stub = buildStub();
    const res = await produce(
      stub.payload,
      { modeloId: 'm1', variante: 'magia-linchoc', cantidad: 0 },
      { dryRun: false, confirm: true, auditPath: tmpAudit() }
    );
    expect(res.ok).toBe(false);
    expect((res as { ok: false; error: string }).error).toMatch(/mayor a cero/i);
  });
});
