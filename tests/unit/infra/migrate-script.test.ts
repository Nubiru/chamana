/**
 * Unit test — G-40 / SIGMA F-migrate-path-wiring.md §6 (Test-A/B/D); ADR-013 §5.
 *
 * Guards the migrate/deploy apply-path wiring in package.json + the deploy note,
 * so committed migrations reach prod Neon DETERMINISTICALLY (the recados table +
 * notasCintia→notasRevision rename were un-applied because the apply leg of the
 * pipeline was never built — F §2 root-cause).
 *
 * package.json-shape / doc-presence tests (a NEW idiom — F §0 grep-empty for any
 * existing one). They read the repo file and assert; no DB, no network, no
 * test-execution by the agent (Gabriel runs them via qa:ci).
 *
 *   Test-A — the migrate script family exists, invokes the real payload binary,
 *            and the value does NOT contain `npm run payload` (anti-fabrication
 *            guard institutionalizing the correction of MEGA's earlier
 *            `npm run payload migrate` fabrication — DATA-TRUTH).
 *   Test-B — migrate:deploy carries the VERCEL_ENV=production guard, and build
 *            invokes migrate:deploy BEFORE next build (fail-closed ordering).
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

describe('production-guarded apply on deploy (G-40 / F §3.2; Test-B)', () => {
  it('migrate:deploy gates the apply on VERCEL_ENV = production', () => {
    const deploy = scripts['migrate:deploy'];
    expect(deploy).toBeDefined();
    expect(deploy).toContain('VERCEL_ENV');
    expect(deploy).toContain('production');
    expect(deploy).toContain('if [');
    // the production branch runs the real migrate; the else branch no-ops
    expect(deploy).toContain('npm run migrate');
    expect(deploy).toContain('skip migrate');
  });

  it('build chains migrate:deploy BEFORE next build (fail-closed ordering)', () => {
    const build = scripts.build;
    expect(build).toBeDefined();
    expect(build).toContain('migrate:deploy');
    expect(build).toContain('next build');
    const deployAt = build.indexOf('migrate:deploy');
    const nextBuildAt = build.indexOf('next build');
    expect(deployAt).toBeGreaterThanOrEqual(0);
    expect(nextBuildAt).toBeGreaterThan(deployAt);
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
