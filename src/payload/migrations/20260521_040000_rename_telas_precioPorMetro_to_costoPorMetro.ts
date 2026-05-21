import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres';

/**
 * G-20 / ADR-003 §12 ERRATA-1 §7.1 — value-preserving RENAME of the Telas
 * cost-source column `precio_por_metro` → `costo_por_metro` (cost-not-price
 * relabel; the Payload field name moves `precioPorMetro` → `costoPorMetro`).
 *
 * VALUE-PRESERVING: this is a RENAME COLUMN, NOT a drop-and-add — every existing
 * row keeps its stored cost value. Reversible: `down` renames back.
 *
 * IDEMPOTENT + SAFE: each direction is guarded by an information_schema check so
 * re-applying is a no-op and the rename only fires when the source column exists
 * and the target does not (handles partial / re-run states).
 *
 * ⚠ S-11 FLAG #2 (S-10 finding #5) — Gabriel-verify BEFORE applying on Neon:
 * the LIVE Neon column predates the migration baseline, so its actual name may
 * differ from the Payload snake_case default `precio_por_metro` assumed here.
 * Run, in the Neon SQL console:
 *   SELECT column_name FROM information_schema.columns
 *   WHERE table_name = 'telas' AND column_name ILIKE '%por_metro%';
 * If the live name differs, update the source-column literal below before
 * running. Migration-apply is Gabriel-terminal authority.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'telas' AND column_name = 'precio_por_metro'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'telas' AND column_name = 'costo_por_metro'
      ) THEN
        ALTER TABLE "telas" RENAME COLUMN "precio_por_metro" TO "costo_por_metro";
      END IF;
    END $$;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'telas' AND column_name = 'costo_por_metro'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'telas' AND column_name = 'precio_por_metro'
      ) THEN
        ALTER TABLE "telas" RENAME COLUMN "costo_por_metro" TO "precio_por_metro";
      END IF;
    END $$;
  `);
}
