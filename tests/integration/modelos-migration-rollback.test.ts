/**
 * Integration test — F-Variante-metrosRequeridos-Modelo-estado / G-16 / AC-8 rollback half.
 *
 * Verifies the `down` direction of the migration:
 *   src/migrations/20260521_030000_add_modelo_estado_variante_metros.ts
 *
 * Asserts the reverse order of `up`:
 *   - DROP INDEX modelos_estado_idx (first; before columns)
 *   - DROP COLUMN modelos_variantes.metros_requeridos
 *   - DROP COLUMN modelos.estado
 *   - DROP TYPE enum_modelos_estado (last; type still in use until columns gone)
 *
 * All DROP statements use IF EXISTS so rollback is idempotent.
 *
 * Mirror of tests/integration/telas-migration-rollback.test.ts (G-13).
 */

import { down } from '@/src/migrations/20260521_030000_add_modelo_estado_variante_metros';

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

describe('migration rollback — F-Variante-metrosRequeridos-Modelo-estado AC-8 down', () => {
  it('drops the index first (before columns)', async () => {
    const { db, calls } = makeRecordingDb();
    await down({ db, payload: {} as never, req: {} as never });
    const dropIdx = calls.findIndex(
      (c) => c.sql.includes('DROP INDEX') && c.sql.includes('modelos_estado_idx')
    );
    const dropEstado = calls.findIndex(
      (c) =>
        c.sql.includes('DROP COLUMN') &&
        c.sql.includes('"estado"') &&
        !c.sql.includes('"modelos_variantes"')
    );
    expect(dropIdx).toBeGreaterThanOrEqual(0);
    expect(dropEstado).toBeGreaterThanOrEqual(0);
    expect(dropIdx).toBeLessThan(dropEstado);
  });

  it('drops metros_requeridos + estado columns + the enum type idempotently', async () => {
    const { db, calls } = makeRecordingDb();
    await down({ db, payload: {} as never, req: {} as never });
    const sqls = calls.map((c) => c.sql).join('\n');
    expect(sqls).toMatch(/DROP COLUMN IF EXISTS "metros_requeridos"/i);
    expect(sqls).toMatch(/DROP COLUMN IF EXISTS "estado"/i);
    expect(sqls).toMatch(/DROP TYPE IF EXISTS "public"\."enum_modelos_estado"/i);
  });

  it('enum type drop is the LAST statement (after column drops; type still referenced until then)', async () => {
    const { db, calls } = makeRecordingDb();
    await down({ db, payload: {} as never, req: {} as never });
    const dropType = calls.findIndex(
      (c) => c.sql.includes('DROP TYPE') && c.sql.includes('enum_modelos_estado')
    );
    const dropEstadoCol = calls.findIndex(
      (c) =>
        c.sql.includes('DROP COLUMN') &&
        c.sql.includes('"estado"') &&
        !c.sql.includes('"modelos_variantes"')
    );
    expect(dropType).toBeGreaterThan(dropEstadoCol);
  });
});
