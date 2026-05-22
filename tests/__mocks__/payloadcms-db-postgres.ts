/**
 * Jest mock for `@payloadcms/db-postgres` (G-38 P2).
 *
 * WHY THIS MOCK EXISTS
 * --------------------
 * The real package is published as ESM (`"type": "module"`; dist/index.js uses
 * `import`/`export`) and re-exports `sql` from `drizzle-orm` (also ESM,
 * `export { sql } from 'drizzle-orm'`). The migration suites import a migration
 * file → which imports `sql` from `@payloadcms/db-postgres`, so jest must load
 * the package. next/jest builds `transformIgnorePatterns` by APPENDING any
 * customJestConfig patterns AFTER its own blanket `/node_modules/`
 * (next/dist/build/jest/jest.js:197-209) — and transformIgnorePatterns excludes
 * a file if ANY pattern matches, so a negative-lookahead allowlist can never
 * "un-ignore" the package. Result without this mock:
 *   "SyntaxError: Cannot use import statement outside a module".
 *
 * WHY NOT transpilePackages (let SWC transform the real package)?
 * The migration tests record SQL via `makeRecordingDb`, which reads
 * `String(arg.sql ?? arg)`. The REAL drizzle `sql` tag returns an `SQL` class
 * instance (drizzle-orm/sql/sql.js) with NO `.sql` string property and NO
 * custom `toString()` — `String(sqlInstance)` is "[object Object]", so every
 * `.includes('CREATE TYPE'…)` assertion would fail. The migration suites were
 * authored against THIS mock contract: a `sql` tag whose result is
 * `{ sql: <raw SQL string> }`.
 *
 * SCOPE
 * In jest the only runtime importer of @payloadcms/db-postgres is the migration
 * files (the real payload.config — the other importer — is itself replaced via
 * moduleNameMapper, and payload-config-migration-dir.test.ts reads the barrel as
 * TEXT, never importing it). So this mock affects exactly the migration suites.
 *
 * The migrations issue only static SQL (no `${}` interpolation), but interpolated
 * values are reconstructed defensively so the mock stays faithful if that changes.
 */

/**
 * Template-tag stand-in for drizzle's `sql`. Reconstructs the literal SQL text
 * and returns it under `.sql` — the shape the migration tests read.
 */
export function sql(strings: TemplateStringsArray, ...values: unknown[]): { sql: string } {
  const text = strings.reduce(
    (acc, part, i) => `${acc}${part}${i < values.length ? String(values[i]) : ''}`,
    ''
  );
  return { sql: text };
}
