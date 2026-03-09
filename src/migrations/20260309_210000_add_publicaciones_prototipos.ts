import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres';

/**
 * Adds Publicaciones + Prototipos collections to existing database.
 * The DB was originally created with push (no migration history).
 * This migration adds only the delta.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. New ENUM types for Publicaciones
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_publicaciones_plataforma" AS ENUM('instagram-feed', 'instagram-story', 'instagram-reel', 'pinterest');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_publicaciones_estado" AS ENUM('pendiente', 'aceptado', 'necesita-cambio', 'rechazado');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_publicaciones_tipo" AS ENUM('naturaleza', 'teaser', 'product-reveal', 'bts', 'brand-story', 'anticipacion');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 2. New ENUM types for Prototipos
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_prototipos_tipo" AS ENUM('Falda', 'Vestido', 'Kimono', 'Remeron', 'Musculosa', 'Top', 'Camisa', 'Bermuda', 'Short', 'Palazzo', 'Campera', 'Chaleco', 'Sweater', 'Remera', 'Poncho', 'Tapado', 'Bufanda', 'Chalina');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_prototipos_estado" AS ENUM('idea', 'en-desarrollo', 'aprobado', 'descartado');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 3. Publicaciones table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "publicaciones" (
      "id" serial PRIMARY KEY NOT NULL,
      "titulo" varchar NOT NULL,
      "imagen_id" integer NOT NULL,
      "caption" varchar,
      "hashtags" varchar,
      "plataforma" "enum_publicaciones_plataforma",
      "fecha_programada" timestamp(3) with time zone,
      "estado" "enum_publicaciones_estado" DEFAULT 'pendiente' NOT NULL,
      "notas_cintia" varchar,
      "coleccion_id" integer,
      "semana" varchar,
      "tipo" "enum_publicaciones_tipo",
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `);

  // 4. Prototipos table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "prototipos" (
      "id" serial PRIMARY KEY NOT NULL,
      "nombre" varchar NOT NULL,
      "tipo" "enum_prototipos_tipo",
      "boceto_id" integer,
      "coleccion_id" integer,
      "inspiracion" varchar,
      "estado" "enum_prototipos_estado" DEFAULT 'idea' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `);

  // 5. Prototipos relationships table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "prototipos_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "telas_id" integer
    );
  `);

  // 6. Add missing columns to payload_locked_documents_rels
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "prototipos_id" integer,
      ADD COLUMN IF NOT EXISTS "publicaciones_id" integer;
  `);

  // 7. Foreign keys for Publicaciones
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_imagen_id_media_id_fk"
        FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_coleccion_id_colecciones_id_fk"
        FOREIGN KEY ("coleccion_id") REFERENCES "public"."colecciones"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 8. Foreign keys for Prototipos
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "prototipos" ADD CONSTRAINT "prototipos_boceto_id_media_id_fk"
        FOREIGN KEY ("boceto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "prototipos" ADD CONSTRAINT "prototipos_coleccion_id_colecciones_id_fk"
        FOREIGN KEY ("coleccion_id") REFERENCES "public"."colecciones"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "prototipos_rels" ADD CONSTRAINT "prototipos_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."prototipos"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "prototipos_rels" ADD CONSTRAINT "prototipos_rels_telas_fk"
        FOREIGN KEY ("telas_id") REFERENCES "public"."telas"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 9. Foreign keys for locked_documents_rels new columns
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prototipos_fk"
        FOREIGN KEY ("prototipos_id") REFERENCES "public"."prototipos"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_publicaciones_fk"
        FOREIGN KEY ("publicaciones_id") REFERENCES "public"."publicaciones"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // 10. Indexes
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "publicaciones_imagen_idx" ON "publicaciones" USING btree ("imagen_id");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "publicaciones_coleccion_idx" ON "publicaciones" USING btree ("coleccion_id");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "publicaciones_updated_at_idx" ON "publicaciones" USING btree ("updated_at");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "publicaciones_created_at_idx" ON "publicaciones" USING btree ("created_at");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "prototipos_boceto_idx" ON "prototipos" USING btree ("boceto_id");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "prototipos_coleccion_idx" ON "prototipos" USING btree ("coleccion_id");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "prototipos_updated_at_idx" ON "prototipos" USING btree ("updated_at");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "prototipos_created_at_idx" ON "prototipos" USING btree ("created_at");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "prototipos_rels_order_idx" ON "prototipos_rels" USING btree ("order");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "prototipos_rels_parent_idx" ON "prototipos_rels" USING btree ("parent_id");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "prototipos_rels_path_idx" ON "prototipos_rels" USING btree ("path");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "prototipos_rels_telas_id_idx" ON "prototipos_rels" USING btree ("telas_id");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_prototipos_id_idx" ON "payload_locked_documents_rels" USING btree ("prototipos_id");`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_publicaciones_id_idx" ON "payload_locked_documents_rels" USING btree ("publicaciones_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "prototipos_rels" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "prototipos" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "publicaciones" CASCADE;`);
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "prototipos_id";`);
  await db.execute(sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "publicaciones_id";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_publicaciones_plataforma";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_publicaciones_estado";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_publicaciones_tipo";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_prototipos_tipo";`);
  await db.execute(sql`DROP TYPE IF EXISTS "public"."enum_prototipos_estado";`);
}
