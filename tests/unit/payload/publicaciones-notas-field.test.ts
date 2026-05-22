/**
 * Unit test — G-33 / O-15 (role-not-person RENAME).
 *
 * Verifies the value-preserving RENAME of the Publicaciones review-notes field
 * `notasCintia` → `notasRevision` on collections/Publicaciones.ts. O-15's DB
 * audit found this the SOLE person-name-in-schema smell; the fix is a ROLE name
 * (`revision`), never another person name (`notasDaniela` would repeat the
 * smell). The test guards BOTH halves of the rename so a half-rename (field
 * renamed but the column-migration missing/wrong → schema↔DB desync, Pillar 3)
 * cannot ship silently:
 *   - the field is named `notasRevision`, type textarea, role-name label.
 *   - the label carries no person name (the exact O-15 smell).
 *   - the OLD `notasCintia` name is fully gone (zero dangling — the schema is the
 *     single referent per the O-15 grep).
 *   - a value-preserving rename migration exists + is registered + RENAMEs the
 *     column in both directions, not drop-and-add (source-as-witness, mirroring
 *     payload-config-migration-dir.test.ts — the barrel cannot be imported here
 *     as it runtime-loads the untranspiled-ESM Payload Postgres adapter).
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Publicaciones } from '@/payload/collections/Publicaciones';
import type { Field, TextareaField } from 'payload';

function findField(name: string): Field | undefined {
  return (Publicaciones.fields as Field[]).find(
    (f): f is Field & { name?: string } =>
      typeof (f as { name?: unknown }).name === 'string' && (f as { name: string }).name === name
  );
}

describe('Publicaciones.notasRevision — G-33 role-not-person RENAME field shape', () => {
  it('declares a `notasRevision` field on the Publicaciones collection', () => {
    expect(findField('notasRevision')).toBeDefined();
  });

  it('notasRevision is a textarea field', () => {
    const f = findField('notasRevision') as TextareaField;
    expect(f.type).toBe('textarea');
  });

  it('relabels to the role-name "Notas de revisión" (not a person name)', () => {
    const f = findField('notasRevision') as TextareaField;
    expect(f.label).toBe('Notas de revisión');
  });

  it('the label carries no person name (the O-15 schema smell)', () => {
    const f = findField('notasRevision') as TextareaField;
    const label = String(f.label).toLowerCase();
    expect(label).not.toContain('cintia');
    expect(label).not.toContain('daniela');
  });

  it('the OLD `notasCintia` name is fully removed (zero dangling)', () => {
    expect(findField('notasCintia')).toBeUndefined();
  });
});

describe('Publicaciones notas RENAME migration — value-preserving column rename', () => {
  const migrationsDir = path.resolve(process.cwd(), 'src/payload/migrations');
  const migrationFile = '20260522_100000_rename_publicaciones_notasCintia_to_notasRevision.ts';

  it('a dedicated rename migration file exists at the pinned path', () => {
    expect(existsSync(path.resolve(migrationsDir, migrationFile))).toBe(true);
  });

  it('is registered in the migrations barrel (no orphan migration)', () => {
    const indexSource = readFileSync(path.resolve(migrationsDir, 'index.ts'), 'utf8');
    const registeredNames = [...indexSource.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    expect(registeredNames).toContain(migrationFile.replace(/\.ts$/, ''));
  });

  it('RENAMEs notas_cintia → notas_revision (value-preserving, not drop-and-add)', () => {
    const src = readFileSync(path.resolve(migrationsDir, migrationFile), 'utf8');
    expect(src).toMatch(/RENAME COLUMN "notas_cintia" TO "notas_revision"/);
    // the data column is never dropped — value preservation is the whole point
    expect(src).not.toMatch(/DROP COLUMN[^;]*notas_/i);
  });

  it('is reversible — down() renames back notas_revision → notas_cintia', () => {
    const src = readFileSync(path.resolve(migrationsDir, migrationFile), 'utf8');
    expect(src).toMatch(/RENAME COLUMN "notas_revision" TO "notas_cintia"/);
  });
});
