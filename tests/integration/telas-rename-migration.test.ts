/**
 * Integration test — G-20 / ADR-003 §12 ERRATA-1 §7.1 (cost-source RENAME).
 *
 * Verifies both directions of the migration file
 *   src/migrations/20260521_040000_rename_telas_precioPorMetro_to_costoPorMetro.ts
 *
 * Strategy: mock db.execute to record every SQL fragment the migration issues
 * (mirror of telas-migration-apply/rollback G-13 pattern). Asserts:
 *   - up renames precio_por_metro → costo_por_metro via RENAME COLUMN
 *     (VALUE-PRESERVING — must NOT DROP/ADD the column, which would lose data).
 *   - the rename is guarded by an information_schema EXISTS check (idempotent).
 *   - down reverses costo_por_metro → precio_por_metro.
 *   - migration is registered in src/migrations/index.ts (auto-discovery).
 *
 * Live migration-apply against Neon is Gabriel-terminal (per
 * AGENTIC_TEST_EXECUTION_PROHIBITION_PROTOCOL) and additionally gated on the
 * S-11 #2 live-column-name verification documented in the migration header.
 */

import { migrations } from '@/payload/migrations';
import {
  down,
  up,
} from '@/payload/migrations/20260521_040000_rename_telas_precioPorMetro_to_costoPorMetro';

type SqlCall = { sql: string };

function makeRecordingDb(): { db: { execute: jest.Mock }; calls: SqlCall[] } {
  const calls: SqlCall[] = [];
  const execute = jest.fn(async (arg: unknown) => {
    const text = String((arg as { strings?: string[]; sql?: string }).sql ?? arg);
    calls.push({ sql: text });
    return { rows: [], rowCount: 0 };
  });
  return { db: { execute }, calls };
}

describe('migration apply — G-20 cost-source RENAME up', () => {
  it('renames precio_por_metro → costo_por_metro via RENAME COLUMN', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const sqls = calls.map((c) => c.sql).join('\n');
    expect(sqls).toMatch(
      /ALTER TABLE\s+"telas"\s+RENAME COLUMN\s+"precio_por_metro"\s+TO\s+"costo_por_metro"/i
    );
  });

  it('is VALUE-PRESERVING — never DROP/ADD the cost column (no data loss)', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const sqls = calls.map((c) => c.sql).join('\n');
    expect(sqls).not.toMatch(/DROP COLUMN/i);
    expect(sqls).not.toMatch(/ADD COLUMN/i);
  });

  it('guards the rename with an information_schema EXISTS check (idempotent)', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const sqls = calls.map((c) => c.sql).join('\n');
    expect(sqls).toMatch(/information_schema\.columns/i);
    expect(sqls).toMatch(/IF EXISTS/i);
  });
});

describe('migration rollback — G-20 cost-source RENAME down', () => {
  it('reverses costo_por_metro → precio_por_metro via RENAME COLUMN', async () => {
    const { db, calls } = makeRecordingDb();
    await down({ db, payload: {} as never, req: {} as never });
    const sqls = calls.map((c) => c.sql).join('\n');
    expect(sqls).toMatch(
      /ALTER TABLE\s+"telas"\s+RENAME COLUMN\s+"costo_por_metro"\s+TO\s+"precio_por_metro"/i
    );
    expect(sqls).not.toMatch(/DROP COLUMN/i);
  });
});

describe('migration registration — G-20', () => {
  it('is registered in src/migrations/index.ts (auto-discovery)', () => {
    const names = migrations.map((m) => m.name);
    expect(names).toContain('20260521_040000_rename_telas_precioPorMetro_to_costoPorMetro');
  });
});
