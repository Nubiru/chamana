import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres';

/**
 * G-16 / F-Variante-metrosRequeridos-Modelo-estado AC-1, AC-2, AC-3, AC-7, AC-8.
 *
 * Adds two coupled aggregate-boundary properties on Modelo:
 *   - Modelo.estado (enum, NOT NULL, default 'nueva') — 5-value commercial
 *     lifecycle. Legacy rows (~14 in prod, ~14 in dev) get 'nueva' via the
 *     column default; Cintia bootstraps them post-deploy (see user-journey
 *     Flow C in tests/user-journeys/F-modelo-estado-variante-metros-G-16.md).
 *   - Modelo.variantes[].metrosRequeridos (numeric, nullable) — per-Variante
 *     fabric-consumption rate. Legacy variants stay NULL (the field is
 *     `required: false`); new variants in upcoming Capa Transmutacion
 *     collections will populate.
 *
 * Pattern mirror of the Telas state-machine migration (G-13,
 * 20260520_230000_add_telas_estado_leadTimeDias). Third manifestation of the
 * collection-state-machine family (Ventas G-10 + Telas G-13 + Modelos G-16);
 * state-machine-factory extraction will be a SIGMA follow-up post G-N+1 hook
 * close (per S-7 §9).
 *
 * Storefront is unaffected: `lib/payload/queries.ts:adaptModelo()` does NOT
 * project `estado`; neither does `adaptVariante()` project `metrosRequeridos`.
 * Both fields are admin-internal (AC-7 verified via the queries.ts grep
 * cited in G-16-REPORT.md §4).
 *
 * Rollback drops the column + the enum type. Existing data on the column is
 * lost (the column itself disappears); idempotent — re-apply re-creates with
 * defaults.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Enum type for Modelo.estado.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_modelos_estado" AS ENUM('nueva', 'en_produccion', 'en_stock', 'sin_stock', 'descontinuada');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 2. Modelos.estado column — NOT NULL with default; legacy rows auto-populate.
  await db.execute(sql`
    ALTER TABLE "modelos"
      ADD COLUMN IF NOT EXISTS "estado" "enum_modelos_estado" NOT NULL DEFAULT 'nueva';
  `);

  // 3. Modelos.variantes[].metrosRequeridos column — nullable numeric.
  //    Payload's array-field convention: <collection>_<arrayField> table.
  await db.execute(sql`
    ALTER TABLE "modelos_variantes"
      ADD COLUMN IF NOT EXISTS "metros_requeridos" numeric;
  `);

  // 4. Index on estado for admin filter performance.
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "modelos_estado_idx" ON "modelos" USING btree ("estado");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "modelos_estado_idx";`);
  await db.execute(sql`ALTER TABLE "modelos_variantes" DROP COLUMN IF EXISTS "metros_requeridos";`);
  await db.execute(sql`ALTER TABLE "modelos" DROP COLUMN IF EXISTS "estado";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_modelos_estado";`);
}
