/**
 * Integration test — F-Telas-state-machine / G-13 / AC-8 rollback half.
 *
 * Verifies the `down` direction of the migration:
 *   src/migrations/20260520_230000_add_telas_estado_leadTimeDias.ts
 *
 * Asserts the reverse order of `up`:
 *   - DROP INDEX telas_estado_idx (first; before columns)
 *   - DROP COLUMN lead_time_dias
 *   - DROP COLUMN estado
 *   - DROP TYPE enum_telas_estado (last; type still in use until columns gone)
 *
 * All DROP statements use IF EXISTS so rollback is idempotent.
 */

import { down } from '@/src/migrations/20260520_230000_add_telas_estado_leadTimeDias';

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

describe('migration rollback — F-Telas-state-machine AC-8 down', () => {
  it('drops the index first (before columns)', async () => {
    const { db, calls } = makeRecordingDb();
    await down({ db, payload: {} as never, req: {} as never });
    const dropIdx = calls.findIndex(
      (c) => c.sql.includes('DROP INDEX') && c.sql.includes('telas_estado_idx')
    );
    const dropEstado = calls.findIndex(
      (c) => c.sql.includes('DROP COLUMN') && c.sql.includes('"estado"')
    );
    expect(dropIdx).toBeGreaterThanOrEqual(0);
    expect(dropEstado).toBeGreaterThanOrEqual(0);
    expect(dropIdx).toBeLessThan(dropEstado);
  });

  it('drops lead_time_dias + estado columns + the enum type idempotently', async () => {
    const { db, calls } = makeRecordingDb();
    await down({ db, payload: {} as never, req: {} as never });
    const sqls = calls.map((c) => c.sql).join('\n');
    expect(sqls).toMatch(/DROP COLUMN IF EXISTS "lead_time_dias"/i);
    expect(sqls).toMatch(/DROP COLUMN IF EXISTS "estado"/i);
    expect(sqls).toMatch(/DROP TYPE IF EXISTS "public"\."enum_telas_estado"/i);
  });

  it('enum type drop is the LAST statement (after column drops; type still referenced until then)', async () => {
    const { db, calls } = makeRecordingDb();
    await down({ db, payload: {} as never, req: {} as never });
    const dropType = calls.findIndex(
      (c) => c.sql.includes('DROP TYPE') && c.sql.includes('enum_telas_estado')
    );
    const dropEstadoCol = calls.findIndex(
      (c) => c.sql.includes('DROP COLUMN') && c.sql.includes('"estado"')
    );
    expect(dropType).toBeGreaterThan(dropEstadoCol);
  });
});
