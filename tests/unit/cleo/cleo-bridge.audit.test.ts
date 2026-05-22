/**
 * Unit — Cleo bridge append-only audit log (AC-8 / ADR-011 §5.3).
 *
 * Every live mutation appends ONE JSON line {tsISO, verb, resolvedArgs,
 * confirmToken, result} to the audit file. A dry-run writes NO mutation line.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { type BridgePayload, type MutationOpts, sell } from '../../../scripts/cleo-bridge.ts';

function spyPayload(): BridgePayload {
  return {
    async create({ data }) {
      return { id: 7, ...data };
    },
    async update({ id, data }) {
      return { id, ...data };
    },
    async find() {
      return { docs: [] };
    },
    async findByID() {
      return null;
    },
  };
}

const validArgs = {
  modeloId: 'm1',
  variante: 'magia-linchoc',
  compradora: 'María',
  precio: 45000,
  fechaVenta: '2026-05-22',
};

function freshAuditPath(tag: string): string {
  return path.join(
    os.tmpdir(),
    `cleo-audit-${tag}-${Date.now()}-${Math.random().toString(36).slice(2)}.log`
  );
}

describe('unit — cleo-bridge audit log (AC-8)', () => {
  it('appends exactly one audit line for a confirmed live mutation', async () => {
    const auditPath = freshAuditPath('confirmed');
    const opts: MutationOpts = {
      dryRun: false,
      confirm: true,
      auditPath,
      now: () => '2026-05-22T10:00:00.000Z',
    };

    await sell(spyPayload(), validArgs, opts);

    expect(fs.existsSync(auditPath)).toBe(true);
    const lines = fs.readFileSync(auditPath, 'utf8').trim().split('\n').filter(Boolean);
    expect(lines).toHaveLength(1);

    const entry = JSON.parse(lines[0]);
    expect(entry.verb).toBe('sell');
    expect(entry.confirmToken).toBe(true);
    expect(entry.tsISO).toBe('2026-05-22T10:00:00.000Z');
    expect(entry.resolvedArgs.compradora).toBe('María');
    expect(entry.result.ok).toBe(true);

    fs.rmSync(auditPath, { force: true });
  });

  it('appends a single line per confirmed write (two sells → two lines)', async () => {
    const auditPath = freshAuditPath('twice');
    const opts: MutationOpts = { dryRun: false, confirm: true, auditPath };

    await sell(spyPayload(), validArgs, opts);
    await sell(spyPayload(), validArgs, opts);

    const lines = fs.readFileSync(auditPath, 'utf8').trim().split('\n').filter(Boolean);
    expect(lines).toHaveLength(2);

    fs.rmSync(auditPath, { force: true });
  });

  it('does NOT write a mutation line for a dry-run', async () => {
    const auditPath = freshAuditPath('dryrun');
    const opts: MutationOpts = { dryRun: true, confirm: true, auditPath };

    await sell(spyPayload(), validArgs, opts);

    // No live mutation occurred → no audit file (or zero lines).
    const lines = fs.existsSync(auditPath)
      ? fs.readFileSync(auditPath, 'utf8').trim().split('\n').filter(Boolean)
      : [];
    expect(lines).toHaveLength(0);

    fs.rmSync(auditPath, { force: true });
  });

  it('does NOT write a mutation line when confirm is absent (read-back only)', async () => {
    const auditPath = freshAuditPath('noconfirm');
    const opts: MutationOpts = { dryRun: false, confirm: false, auditPath };

    await sell(spyPayload(), validArgs, opts);

    const lines = fs.existsSync(auditPath)
      ? fs.readFileSync(auditPath, 'utf8').trim().split('\n').filter(Boolean)
      : [];
    expect(lines).toHaveLength(0);

    fs.rmSync(auditPath, { force: true });
  });
});
