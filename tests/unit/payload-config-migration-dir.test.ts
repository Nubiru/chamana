/**
 * Unit test — G-23 / ADR-007 §6 (GAP-1); migration paths updated G-26 / ADR-010.
 *
 * Guards the explicit `db.migrationDir` pin in src/payload/payload.config.ts.
 * Before G-23 the migration binding was IMPLICIT (Payload convention) — a
 * silent prod-schema desync risk if the migrations dir ever moves
 * (DATA_TRUTH_PROTOCOL). The ADR-010 src/ consolidation moved both the config
 * (-> src/payload/payload.config.ts) and the migrations (-> src/payload/migrations),
 * so the pin is now `path.resolve(dirname, 'migrations')` (config-relative).
 *
 * The test couples three facts so the pin can never silently drift:
 *   1. payload.config.ts SOURCE contains a `migrationDir` pin -> 'migrations'
 *      (resolved beside the config in src/payload/), bound into BOTH db adapters
 *      (postgres + sqlite).
 *      (Read as text — jest moduleNameMapper maps the real config to a mock,
 *       so the resolved value cannot be imported; the source is the witness.)
 *   2. The pinned location exists and holds the migration files.
 *   3. `src/payload/migrations/index.ts` registers exactly the migration files
 *      present (no orphan file, no phantom registration).
 *      (Read as text — importing the barrel runtime-loads @payloadcms/db-postgres,
 *       an untranspiled-ESM node_module jest cannot parse; the index source is the
 *       witness here too, mirroring fact 1's config-as-text design.)
 *
 * If migrations move without updating the pin (or vice-versa), fact 1↔2
 * mismatch fails the test — exactly the GAP-1 failure mode this pin de-risks.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const configPath = path.resolve(repoRoot, 'src/payload/payload.config.ts');
const migrationsDir = path.resolve(repoRoot, 'src/payload/migrations');

describe('payload.config.ts — explicit db.migrationDir pin (G-23 / ADR-007 §6; G-26 paths)', () => {
  const configSource = readFileSync(configPath, 'utf8');

  it('pins migrationDir to migrations (beside the config) in the config source', () => {
    expect(configSource).toMatch(/migrationDir/);
    expect(configSource).toMatch(/path\.resolve\(\s*dirname\s*,\s*['"]migrations['"]\s*\)/);
  });

  it('binds the pin into both db adapters (postgres + sqlite)', () => {
    // shorthand `migrationDir,` reference inside each adapter config object
    const references = configSource.match(/migrationDir,/g) ?? [];
    expect(references.length).toBeGreaterThanOrEqual(2);
  });

  it('resolves to a real directory that exists', () => {
    expect(existsSync(migrationsDir)).toBe(true);
    expect(statSync(migrationsDir).isDirectory()).toBe(true);
  });

  it('discovers exactly the registered migrations at the pinned path', () => {
    const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts');

    // Parse the registered migration names from the index SOURCE as text — the
    // barrel cannot be imported here (it runtime-loads the Payload Postgres
    // adapter, untranspiled ESM jest rejects). Same source-is-the-witness
    // pattern fact 1 uses for the config.
    const indexSource = readFileSync(path.resolve(migrationsDir, 'index.ts'), 'utf8');
    const registeredNames = [...indexSource.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);

    expect(files.length).toBeGreaterThan(0);
    expect(registeredNames.length).toBeGreaterThan(0);

    // every registered migration name has a matching file at the pinned path
    for (const name of registeredNames) {
      expect(files).toContain(`${name}.ts`);
    }

    // and every file at the pinned path is registered (no forgotten migration)
    for (const file of files) {
      expect(registeredNames).toContain(file.replace(/\.ts$/, ''));
    }
  });
});
