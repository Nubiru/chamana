import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres';

/**
 * G-33 / O-15 — value-preserving RENAME of the Publicaciones review-notes column
 * `notas_cintia` → `notas_revision` (role-not-person relabel; the Payload field
 * name moves `notasCintia` → `notasRevision`).
 *
 * O-15 forensic DB audit (2026-05-22) verdict: the schema is built CORRECTLY;
 * the ONLY name-in-schema smell is this sole person-name field. The fix is a
 * ROLE name (`revision`), NOT another person name — renaming person→person
 * (`notasDaniela`) repeats the exact mistake the audit named.
 *
 * VALUE-PRESERVING: this is a RENAME COLUMN, NOT a drop-and-add — every existing
 * row keeps its stored review note. Reversible: `down` renames back.
 *
 * IDEMPOTENT + SAFE: each direction is guarded by an information_schema check so
 * re-applying is a no-op and the rename only fires when the source column exists
 * and the target does not (handles partial / re-run states). Mirrors the
 * 20260521_040000 telas precio→costo rename template.
 *
 * ⚠ Gabriel-verify BEFORE applying on Neon: confirm the live column name. The
 * column was declared `notas_cintia varchar` in 20260309_210000; if the live
 * Neon name differs, update the source-column literal below before running.
 * Migration-apply is Gabriel-terminal authority.
 *   SELECT column_name FROM information_schema.columns
 *   WHERE table_name = 'publicaciones' AND column_name ILIKE 'notas_%';
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'publicaciones' AND column_name = 'notas_cintia'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'publicaciones' AND column_name = 'notas_revision'
      ) THEN
        ALTER TABLE "publicaciones" RENAME COLUMN "notas_cintia" TO "notas_revision";
      END IF;
    END $$;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'publicaciones' AND column_name = 'notas_revision'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'publicaciones' AND column_name = 'notas_cintia'
      ) THEN
        ALTER TABLE "publicaciones" RENAME COLUMN "notas_revision" TO "notas_cintia";
      END IF;
    END $$;
  `);
}
