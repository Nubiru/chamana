/**
 * Integration test — F-Variante-metrosRequeridos-Modelo-estado / G-16 / AC-8.
 *
 * Verifies the `up` direction of the migration file
 *   src/migrations/20260521_030000_add_modelo_estado_variante_metros.ts
 *
 * Strategy: mock db.execute to record every SQL fragment the migration issues.
 * Asserts:
 *   - enum type creation (idempotent, DO $$ BEGIN ... duplicate_object guard)
 *   - ALTER TABLE modelos ADD COLUMN estado with NOT NULL + DEFAULT 'nueva'
 *     (legacy ~14 rows auto-populate)
 *   - ALTER TABLE modelos_variantes ADD COLUMN metros_requeridos (nullable numeric)
 *   - CREATE INDEX modelos_estado_idx (admin filter performance)
 *   - Migration is registered in src/migrations/index.ts
 *
 * Migration apply against a live Postgres requires Gabriel-terminal (per
 * AGENTIC_TEST_EXECUTION_PROHIBITION_PROTOCOL). This integration test
 * exercises the SQL shape; live run is documented in G-16-REPORT.md §7.
 *
 * Mirror of tests/integration/telas-migration-apply.test.ts (G-13).
 */

import { migrations } from '@/src/migrations';
import { up } from '@/src/migrations/20260521_030000_add_modelo_estado_variante_metros';

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

describe('migration apply — F-Variante-metrosRequeridos-Modelo-estado AC-8', () => {
  it('creates the enum_modelos_estado type idempotently with all 5 values', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const enumCall = calls.find(
      (c) => c.sql.includes('CREATE TYPE') && c.sql.includes('enum_modelos_estado')
    );
    expect(enumCall).toBeDefined();
    expect(enumCall?.sql).toMatch(/duplicate_object/i);
    expect(enumCall?.sql).toContain("'nueva'");
    expect(enumCall?.sql).toContain("'en_produccion'");
    expect(enumCall?.sql).toContain("'en_stock'");
    expect(enumCall?.sql).toContain("'sin_stock'");
    expect(enumCall?.sql).toContain("'descontinuada'");
  });

  it("adds modelos.estado column NOT NULL DEFAULT 'nueva' (legacy rows auto-populate)", async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const estadoCol = calls.find(
      (c) =>
        c.sql.includes('ALTER TABLE') &&
        c.sql.includes('"modelos"') &&
        c.sql.includes('"estado"') &&
        !c.sql.includes('"modelos_variantes"')
    );
    expect(estadoCol).toBeDefined();
    expect(estadoCol?.sql).toMatch(/NOT NULL/i);
    expect(estadoCol?.sql).toMatch(/DEFAULT\s+'nueva'/i);
    expect(estadoCol?.sql).toMatch(/IF NOT EXISTS/i);
  });

  it('adds modelos_variantes.metros_requeridos as nullable numeric', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const metrosCol = calls.find(
      (c) =>
        c.sql.includes('ALTER TABLE') &&
        c.sql.includes('"modelos_variantes"') &&
        c.sql.includes('"metros_requeridos"')
    );
    expect(metrosCol).toBeDefined();
    expect(metrosCol?.sql).toMatch(/numeric/i);
    expect(metrosCol?.sql).not.toMatch(/NOT NULL/i);
  });

  it('creates index modelos_estado_idx for admin filter performance', async () => {
    const { db, calls } = makeRecordingDb();
    await up({ db, payload: {} as never, req: {} as never });
    const idx = calls.find((c) => c.sql.includes('modelos_estado_idx'));
    expect(idx).toBeDefined();
    expect(idx?.sql).toMatch(/CREATE INDEX IF NOT EXISTS/i);
    expect(idx?.sql).toMatch(/btree\s*\(\s*"estado"\s*\)/i);
  });

  it('migration is registered in src/migrations/index.ts (auto-discovery)', () => {
    const names = migrations.map((m) => m.name);
    expect(names).toContain('20260521_030000_add_modelo_estado_variante_metros');
  });
});
