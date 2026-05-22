import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres';

/**
 * G-36 / O-17 §3 — adds the Recados comms collection (Daniela→equipo messages).
 *
 * A NEW collection = a NEW table. Mirrors the publicaciones/prototipos add-table
 * idiom (20260309_210000): idempotent enum types (DO-block / duplicate_object),
 * the `recados` table, the `recados_rels` table for the polymorphic `relacion`
 * relationship (modelos / ventas / telas / publicaciones), the
 * `payload_locked_documents_rels.recados_id` column for the admin lock feature,
 * the foreign keys, and the indexes (incl. `estado` for the bridge consume query
 * `where estado=nuevo`).
 *
 * Value-additive (a brand-new table) — no existing-data risk. Idempotent
 * (IF NOT EXISTS / duplicate_object guards) so a re-apply is safe. Gabriel
 * applies it (DB op); agents never run migrations.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Enum types for the Recados select fields.
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_recados_de" AS ENUM('daniela', 'cleo', 'gabriel');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_recados_para" AS ENUM('gabriel', 'daniela', 'equipo');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_recados_estado" AS ENUM('nuevo', 'visto', 'resuelto');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_recados_prioridad" AS ENUM('baja', 'normal', 'alta');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_recados_creado_via" AS ENUM('cleo', 'admin-ui');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 2. Recados table. de/para/estado are required → NOT NULL DEFAULT;
  //    prioridad/creadoVia carry a default but stay nullable.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "recados" (
      "id" serial PRIMARY KEY NOT NULL,
      "mensaje" varchar NOT NULL,
      "de" "enum_recados_de" DEFAULT 'daniela' NOT NULL,
      "para" "enum_recados_para" DEFAULT 'gabriel' NOT NULL,
      "estado" "enum_recados_estado" DEFAULT 'nuevo' NOT NULL,
      "prioridad" "enum_recados_prioridad" DEFAULT 'normal',
      "creado_via" "enum_recados_creado_via" DEFAULT 'admin-ui',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `);

  // 3. Recados relationships table (the polymorphic `relacion` field).
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "recados_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "modelos_id" integer,
      "ventas_id" integer,
      "telas_id" integer,
      "publicaciones_id" integer
    );
  `);

  // 4. locked_documents_rels column (admin edit-lock feature).
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "recados_id" integer;
  `);

  // 5. Foreign keys for recados_rels.
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "recados_rels" ADD CONSTRAINT "recados_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."recados"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "recados_rels" ADD CONSTRAINT "recados_rels_modelos_fk"
        FOREIGN KEY ("modelos_id") REFERENCES "public"."modelos"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "recados_rels" ADD CONSTRAINT "recados_rels_ventas_fk"
        FOREIGN KEY ("ventas_id") REFERENCES "public"."ventas"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "recados_rels" ADD CONSTRAINT "recados_rels_telas_fk"
        FOREIGN KEY ("telas_id") REFERENCES "public"."telas"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "recados_rels" ADD CONSTRAINT "recados_rels_publicaciones_fk"
        FOREIGN KEY ("publicaciones_id") REFERENCES "public"."publicaciones"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recados_fk"
        FOREIGN KEY ("recados_id") REFERENCES "public"."recados"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 6. Indexes — estado drives the bridge consume query; rels columns for joins.
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_estado_idx" ON "recados" USING btree ("estado");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_updated_at_idx" ON "recados" USING btree ("updated_at");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_created_at_idx" ON "recados" USING btree ("created_at");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_rels_order_idx" ON "recados_rels" USING btree ("order");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_rels_parent_idx" ON "recados_rels" USING btree ("parent_id");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_rels_path_idx" ON "recados_rels" USING btree ("path");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_rels_modelos_id_idx" ON "recados_rels" USING btree ("modelos_id");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_rels_ventas_id_idx" ON "recados_rels" USING btree ("ventas_id");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_rels_telas_id_idx" ON "recados_rels" USING btree ("telas_id");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "recados_rels_publicaciones_id_idx" ON "recados_rels" USING btree ("publicaciones_id");`
  );
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_recados_id_idx" ON "payload_locked_documents_rels" USING btree ("recados_id");`
  );
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "recados_rels" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "recados" CASCADE;`);
  await db.execute(
    sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "recados_id";`
  );
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_recados_de";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_recados_para";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_recados_estado";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_recados_prioridad";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_recados_creado_via";`);
}
