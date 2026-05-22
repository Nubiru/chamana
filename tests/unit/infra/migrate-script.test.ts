/**
 * Unit test — G-40 / SIGMA F-migrate-path-wiring.md §6 (Test-A/B/D); ADR-013 §5.
 * G-44 (2026-05-22) — Test-B INVERTED: build decoupled from the unverified migrate.
 *
 * Guards the migrate script family in package.json + the deploy note. The G-40
 * auto-apply-on-build coupling was REMOVED by G-44 because `migrate` crashes on
 * config-load (ERR_REQUIRE_ASYNC_MODULE / TLA in the static config graph) and was
 * never executed end-to-end — a never-run command must not gate the prod build.
 * Migrations now apply manually via `npm run migrate` (Gabriel-terminal) until the
 * correct CLI invocation is diagnosed (--experimental-print-required-tla) + verified
 * (migrate:status green), then re-wired. Decouple-first is safe + reversible.
 *
 * package.json-shape / doc-presence tests (a NEW idiom — F §0 grep-empty for any
 * existing one). They read the repo file and assert; no DB, no network, no
 * test-execution by the agent (Gabriel runs them via qa:ci).
 *
 *   Test-A — the migrate script family exists, invokes the real payload binary,
 *            and the value does NOT contain `npm run payload` (anti-fabrication
 *            guard institutionalizing the correction of MEGA's earlier
 *            `npm run payload migrate` fabrication — DATA-TRUTH).
 *   Test-B — [INVERTED by G-44] build does NOT chain migrate:deploy/migrate, the
 *            importmap step still precedes next build (pre-G-40 form), and the
 *            migrate:deploy auto-apply hook is removed (no orphan to silently
 *            re-wire). The migrate apply returns once the CLI invocation is verified.
 *   Test-D — the deploy note records the expand/contract + Gabriel-pre-verify
 *            discipline for rename/drop migrations.
 *
 * Test-C (F §3.5) is the prod runtime gate (`npm run migrate:status` → 0 pending)
 * — structurally not a unit test; Gabriel-run after the next prod deploy.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const pkg = JSON.parse(readFileSync(path.resolve(repoRoot, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};
const scripts = pkg.scripts;

const PAYLOAD_BIN = 'node_modules/.bin/payload';

describe('migrate script family — package.json shape (G-40 / F §3.1; Test-A)', () => {
  it('defines `migrate` invoking the real payload binary subcommand', () => {
    expect(scripts.migrate).toBeDefined();
    expect(scripts.migrate).toContain(`${PAYLOAD_BIN} migrate`);
  });

  it('NEVER uses the fabricated `npm run payload` form (anti-fabrication guard)', () => {
    // Institutionalizes the correction of MEGA's earlier `npm run payload migrate`
    // fabrication — there is no `payload` npm script (F §0). This test FAILS if
    // anyone reintroduces that form.
    expect(scripts.migrate).not.toContain('npm run payload');
    expect(scripts['migrate:status']).not.toContain('npm run payload');
    expect(scripts['migrate:create']).not.toContain('npm run payload');
    expect(scripts.payload).toBeUndefined();
  });

  it('defines `migrate:status` (drift check) and `migrate:create` (authoring)', () => {
    expect(scripts['migrate:status']).toBeDefined();
    expect(scripts['migrate:status']).toContain(`${PAYLOAD_BIN} migrate:status`);
    expect(scripts['migrate:create']).toBeDefined();
    expect(scripts['migrate:create']).toContain(`${PAYLOAD_BIN} migrate:create`);
  });

  it('does NOT script destructive subcommands (down/refresh/reset/fresh)', () => {
    // Destructive subcommands stay deliberate-binary-only (DESTRUCTIVE_COMMAND
    // spirit; F §3.1). A one-keystroke `npm run migrate:reset` must not exist.
    expect(scripts['migrate:down']).toBeUndefined();
    expect(scripts['migrate:refresh']).toBeUndefined();
    expect(scripts['migrate:reset']).toBeUndefined();
    expect(scripts['migrate:fresh']).toBeUndefined();
  });
});

describe('build decoupled from the unverified migrate (G-44 de-risk; Test-B inverted)', () => {
  // G-40 chained `npm run migrate:deploy && …` into build, but `migrate` was only
  // ever tested for SCRIPT SHAPE — never executed. Gabriel running migrate:status
  // (G-42 cycle) proved it crashes loading payload.config.ts via the Payload CLI
  // require-loader (ERR_REQUIRE_ASYNC_MODULE — a TLA in the static config graph;
  // G-42's next/cache lazy-import did NOT fix it, so next/cache was not the source).
  // A never-executed command in the prod build's critical path would FAIL every
  // production deploy, so it is removed. The migrate-path returns once the correct
  // CLI invocation is diagnosed (--experimental-print-required-tla) AND verified
  // (migrate:status green) — that re-wire is a separate step, not this one.
  it('build does NOT chain migrate:deploy/migrate (the unverified migrate is off the prod critical path)', () => {
    const build = scripts.build;
    expect(build).toBeDefined();
    expect(build).not.toContain('migrate:deploy');
    expect(build).not.toContain('npm run migrate');
  });

  it('build still generates the importmap before next build (pre-G-40 form preserved)', () => {
    const build = scripts.build;
    expect(build).toContain('generate:importmap');
    expect(build).toContain('next build');
    const importmapAt = build.indexOf('generate:importmap');
    const nextBuildAt = build.indexOf('next build');
    expect(importmapAt).toBeGreaterThanOrEqual(0);
    expect(nextBuildAt).toBeGreaterThan(importmapAt);
  });

  it('migrate:deploy is removed (no orphaned auto-apply deploy hook to silently re-wire)', () => {
    expect(scripts['migrate:deploy']).toBeUndefined();
  });
});

describe('rename/drop deploy-coordination note (G-40 / F §3.4; Test-D)', () => {
  const note = readFileSync(path.resolve(repoRoot, 'CONTRIBUTING.md'), 'utf8');

  it('records the expand/contract pattern for rename/drop migrations', () => {
    expect(note).toMatch(/expand[\s/-]?contract/i);
    expect(note).toMatch(/rename/i);
    expect(note).toMatch(/drop/i);
  });

  it('records the Gabriel pre-verify discipline + migrate:status check', () => {
    expect(note).toContain('migrate:status');
    expect(note).toMatch(/Gabriel/);
    expect(note).toMatch(/before merging/i);
  });
});
