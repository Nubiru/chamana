/**
 * Integration — Cleo bridge `sell` verb (AC-3, AC-7, AC-9).
 *
 * Composes the bridge's `sell` against the in-memory Payload stub that runs the
 * REAL production hooks (`ventasStockSync` + `autoStock`). Asserting
 * `variant.stockVendido === 1` therefore proves the HOOK fired (+1), not the
 * bridge (AC-3) — the bridge writes only the `ventas` domain record.
 */

import os from 'node:os';
import path from 'node:path';
import { type BridgeResult, type MutationOpts, sell } from '../../../scripts/cleo-bridge.ts';
import { buildCleoPayloadStub } from '../../helpers/cleo-payload-stub.ts';

function tmpAudit(): string {
  return path.join(
    os.tmpdir(),
    `cleo-audit-sell-${Date.now()}-${Math.random().toString(36).slice(2)}.log`
  );
}

function okResult(res: BridgeResult): Record<string, unknown> {
  expect(res.ok).toBe(true);
  return (res as { ok: true; result: Record<string, unknown> }).result;
}

function buildStub() {
  return buildCleoPayloadStub({
    modelos: [
      {
        id: 'm1',
        nombre: 'Magia',
        variantes: [
          { varianteId: 'magia-linchoc', stockTotal: 5, stockVendido: 0, sinStock: false },
        ],
      },
    ],
  });
}

const validArgs = {
  modeloId: 'm1',
  variante: 'magia-linchoc',
  compradora: 'María',
  precio: 45000,
  fechaVenta: '2026-05-22',
};

describe('integration — cleo-bridge sell (AC-3 / AC-7 / AC-9)', () => {
  it('AC-3: a confirmed sell creates ONE venta and the hook (+1) increments stockVendido', async () => {
    const stub = buildStub();
    const opts: MutationOpts = { dryRun: false, confirm: true, auditPath: tmpAudit() };

    const res = await sell(stub.payload, validArgs, opts);
    const result = okResult(res);
    expect(result.status).toBe('written');

    expect(stub.ventasCount()).toBe(1);
    const modelo = stub.store.modelos.get('m1');
    expect(modelo).toBeDefined();
    const variante = (modelo?.variantes as Array<{ stockVendido?: number }>)[0];
    expect(variante.stockVendido).toBe(1); // proves ventasStockSync fired, not the bridge
  });

  it('AC-7: an unknown varianteId surfaces the hook throw and leaves NO partial state', async () => {
    const stub = buildStub();
    const opts: MutationOpts = { dryRun: false, confirm: true, auditPath: tmpAudit() };

    const res = await sell(stub.payload, { ...validArgs, variante: 'no-existe' }, opts);

    expect(res.ok).toBe(false);
    expect((res as { ok: false; error: string }).error).toMatch(/no encontrada/i);
    // No partial state: venta not persisted, stock untouched.
    expect(stub.ventasCount()).toBe(0);
    const variante = (
      stub.store.modelos.get('m1')?.variantes as Array<{ stockVendido?: number }>
    )[0];
    expect(variante.stockVendido).toBe(0);
  });

  it('AC-9: the Daniela C2 journey — read-back first, then confirm creates exactly one record', async () => {
    const stub = buildStub();
    const auditPath = tmpAudit();

    // Step 1: no --confirm → read-back, NO write (the confirm-before-mutate guard).
    const readBack = await sell(stub.payload, validArgs, {
      dryRun: false,
      confirm: false,
      auditPath,
    });
    const rb = okResult(readBack);
    expect(rb.status).toBe('needs-confirm');
    expect((rb.readBack as Record<string, unknown>).compradora).toBe('María');
    expect((rb.readBack as Record<string, unknown>).precio).toBe(45000);
    expect(stub.ventasCount()).toBe(0);

    // Step 2: Daniela says "sí" → --confirm → exactly one venta with the right fields.
    const written = await sell(stub.payload, validArgs, {
      dryRun: false,
      confirm: true,
      auditPath,
    });
    expect(written.ok).toBe(true);
    expect(stub.ventasCount()).toBe(1);

    const venta = [...stub.store.ventas.values()][0];
    expect(venta.modelo).toBe('m1');
    expect(venta.variante).toBe('magia-linchoc');
    expect(venta.precio).toBe(45000);
    expect(venta.compradora).toBe('María');
    expect(venta.fechaVenta).toBe('2026-05-22');

    const variante = (
      stub.store.modelos.get('m1')?.variantes as Array<{ stockVendido?: number }>
    )[0];
    expect(variante.stockVendido).toBe(1);
  });
});
