/**
 * Integration test — F-Telas-state-machine / G-13 / AC-8.
 *
 * Verifies the `up` direction of the migration file
 *   src/migrations/20260520_230000_add_telas_estado_leadTimeDias.ts
 *
 * Strategy: mock db.execute to record every SQL fragment the migration issues.
 * Asserts:
 *   - enum type creation (idempotent, DO $$ BEGIN ... duplicate_object guard)
 *   - ALTER TABLE telas ADD COLUMN estado with NOT NULL + DEFAULT 'disponible'
 *     (legacy rows ~30 in prod auto-populate)
 *   - ALTER TABLE telas ADD COLUMN lead_time_dias (nullable numeric)
 *   - CREATE INDEX telas_estado_idx (admin filter performance)
 *   - Migration is also registered in src/migrations/index.ts
 *
 * Migration apply against a live Postgres requires Gabriel-terminal (per
 * AGENTIC_TEST_EXECUTION_PROHIBITION_PROTOCOL). This integration test exercises
 * the SQL shape; the live run is documented in G-13 report §7.
 */

import { migrations } from '@/src/migrations';
import { up } from '@/src/migrations/20260520_230000_add_telas_estado_leadTimeDias';

type SqlCall = { sql: string };

function makeRecordingDb(): { db: { execute: jest.Mock }; calls: SqlCall[] } {
  const calls: SqlCall[] = [];
  const execute = jest.fn(async (arg: unknown) => {
    // @payloadcms/db-postgres sql tag returns an object that stringifies to the SQL.
    const text = String((arg as { strings?: string[]; sql?: string }).sql ?? arg);
    calls.push({ sql: text });
    return { rows: [], rowCount: 0 };
  });
  return { db: { execute }, calls };
}

describe('migration apply — F-Telas-state-machine AC-8', () => {
  it('creates the enum_telas_estado type idempotently', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const enumCall = calls.find(
      (c) => c.sql.includes('CREATE TYPE') && c.sql.includes('enum_telas_estado')
    );
    expect(enumCall).toBeDefined();
    expect(enumCall?.sql).toMatch(/duplicate_object/i);
    expect(enumCall?.sql).toContain("'disponible'");
    expect(enumCall?.sql).toContain("'por_agotarse'");
    expect(enumCall?.sql).toContain("'agotada'");
    expect(enumCall?.sql).toContain("'pedida'");
    expect(enumCall?.sql).toContain("'discontinuada'");
  });

  it("adds estado column NOT NULL DEFAULT 'disponible' (legacy rows auto-populate)", async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const estadoCol = calls.find(
      (c) =>
        c.sql.includes('ALTER TABLE') && c.sql.includes('"telas"') && c.sql.includes('"estado"')
    );
    expect(estadoCol).toBeDefined();
    expect(estadoCol?.sql).toMatch(/NOT NULL/i);
    expect(estadoCol?.sql).toMatch(/DEFAULT\s+'disponible'/i);
    expect(estadoCol?.sql).toMatch(/IF NOT EXISTS/i);
  });

  it('adds lead_time_dias as nullable numeric', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const leadCol = calls.find(
      (c) =>
        c.sql.includes('ALTER TABLE') &&
        c.sql.includes('"telas"') &&
        c.sql.includes('"lead_time_dias"')
    );
    expect(leadCol).toBeDefined();
    expect(leadCol?.sql).toMatch(/numeric/i);
    expect(leadCol?.sql).not.toMatch(/NOT NULL/i);
  });

  it('creates index telas_estado_idx for admin filter performance', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const idx = calls.find((c) => c.sql.includes('telas_estado_idx'));
    expect(idx).toBeDefined();
    expect(idx?.sql).toMatch(/CREATE INDEX IF NOT EXISTS/i);
    expect(idx?.sql).toMatch(/btree\s*\(\s*"estado"\s*\)/i);
  });

  it('migration is registered in src/migrations/index.ts (auto-discovery)', () => {
    const names = migrations.map((m) => m.name);
    expect(names).toContain('20260520_230000_add_telas_estado_leadTimeDias');
  });
});
