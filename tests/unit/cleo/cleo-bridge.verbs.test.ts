/**
 * Unit/integration — Cleo bridge verb contracts for `query` + `restock-fabric`
 * (AC-2: each verb returns the JSON `{ok, result|error}` contract).
 *
 * `sell` and `produce` are covered by their own integration files; this file
 * completes TDD-GATE coverage for the remaining two verbs the bridge exposes.
 */

import os from 'node:os';
import path from 'node:path';
import {
  type BridgeResult,
  type MutationOpts,
  query,
  restockFabric,
} from '../../../scripts/cleo-bridge.ts';
import { buildCleoPayloadStub } from '../../helpers/cleo-payload-stub.ts';

function tmpAudit(): string {
  return path.join(
    os.tmpdir(),
    `cleo-audit-verbs-${Date.now()}-${Math.random().toString(36).slice(2)}.log`
  );
}

function okResult(res: BridgeResult): Record<string, unknown> {
  expect(res.ok).toBe(true);
  return (res as { ok: true; result: Record<string, unknown> }).result;
}

describe('unit — cleo-bridge query (AC-2, read-only)', () => {
  it('returns docs for a collection (no confirm/dry-run needed)', async () => {
    const stub = buildCleoPayloadStub({
      telas: [
        { codigo: 'LinMenChoc', metrosComprados: 10 },
        { codigo: 'RibNegro', metrosComprados: 4 },
      ],
    });
    const result = okResult(await query(stub.payload, { collection: 'telas' }));
    expect((result.docs as unknown[]).length).toBe(2);
  });

  it('refuses a query with no collection', async () => {
    const stub = buildCleoPayloadStub();
    const res = await query(stub.payload, {});
    expect(res.ok).toBe(false);
    expect((res as { ok: false; error: string }).error).toMatch(/colección/i);
  });
});

describe('integration — cleo-bridge restock-fabric (AC-2)', () => {
  it('adds metros to metrosComprados on a confirmed write, resolving by codigo', async () => {
    const stub = buildCleoPayloadStub({
      telas: [{ id: 't1', codigo: 'LinMenChoc', metrosComprados: 10 }],
    });
    const opts: MutationOpts = { dryRun: false, confirm: true, auditPath: tmpAudit() };

    const result = okResult(
      await restockFabric(stub.payload, { codigo: 'LinMenChoc', metros: 5 }, opts)
    );
    expect(result.status).toBe('written');

    expect(stub.store.telas.get('t1')?.metrosComprados).toBe(15);
  });

  it('refuses an unknown tela codigo', async () => {
    const stub = buildCleoPayloadStub({
      telas: [{ id: 't1', codigo: 'LinMenChoc', metrosComprados: 10 }],
    });
    const res = await restockFabric(
      stub.payload,
      { codigo: 'NoExiste', metros: 5 },
      { dryRun: false, confirm: true, auditPath: tmpAudit() }
    );
    expect(res.ok).toBe(false);
    expect((res as { ok: false; error: string }).error).toMatch(/no encontrada/i);
  });

  it('rejects non-positive metros', async () => {
    const stub = buildCleoPayloadStub({
      telas: [{ id: 't1', codigo: 'LinMenChoc', metrosComprados: 10 }],
    });
    const res = await restockFabric(
      stub.payload,
      { codigo: 'LinMenChoc', metros: 0 },
      { dryRun: false, confirm: true, auditPath: tmpAudit() }
    );
    expect(res.ok).toBe(false);
    expect((res as { ok: false; error: string }).error).toMatch(/mayor a cero/i);
  });

  it('dry-run does not write metros', async () => {
    const stub = buildCleoPayloadStub({
      telas: [{ id: 't1', codigo: 'LinMenChoc', metrosComprados: 10 }],
    });
    const result = okResult(
      await restockFabric(
        stub.payload,
        { codigo: 'LinMenChoc', metros: 5 },
        {
          dryRun: true,
          confirm: true,
          auditPath: tmpAudit(),
        }
      )
    );
    expect(result.status).toBe('dry-run');
    expect(stub.store.telas.get('t1')?.metrosComprados).toBe(10); // unchanged
  });
});
