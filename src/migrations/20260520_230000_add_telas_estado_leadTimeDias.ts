import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres';

/**
 * G-13 / F-Telas-state-machine AC-1, AC-2, AC-8.
 *
 * Adds Telas.estado (enum, NOT NULL, default 'disponible') + Telas.leadTimeDias
 * (numeric, nullable) to existing telas table. Legacy rows (~30 in prod, ~30 in
 * dev) get estado = 'disponible' via the column default; leadTimeDias stays NULL
 * until Cintia marks the tela as pedida.
 *
 * Symmetric to the Ventas-state-machine pattern (G-10) — closes the second
 * lado del invariante stock (telas-side aprovisionamiento). Storefront is
 * unaffected (admin-only field per AC-7).
 *
 * Rollback drops the column + the enum type. Existing data on the column is
 * lost (the column itself disappears); idempotent — re-apply re-creates with
 * defaults.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Enum type for Telas.estado.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_telas_estado" AS ENUM('disponible', 'por_agotarse', 'agotada', 'pedida', 'discontinuada');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 2. estado column — NOT NULL with default; legacy rows auto-populate.
  await db.execute(sql`
    ALTER TABLE "telas"
      ADD COLUMN IF NOT EXISTS "estado" "enum_telas_estado" NOT NULL DEFAULT 'disponible';
  `);

  // 3. leadTimeDias column — nullable numeric.
  await db.execute(sql`
    ALTER TABLE "telas"
      ADD COLUMN IF NOT EXISTS "lead_time_dias" numeric;
  `);

  // 4. Index on estado for admin filter performance.
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "telas_estado_idx" ON "telas" USING btree ("estado");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "telas_estado_idx";`);
  await db.execute(sql`ALTER TABLE "telas" DROP COLUMN IF EXISTS "lead_time_dias";`);
  await db.execute(sql`ALTER TABLE "telas" DROP COLUMN IF EXISTS "estado";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_telas_estado";`);
}
