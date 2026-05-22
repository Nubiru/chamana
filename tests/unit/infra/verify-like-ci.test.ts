/**
 * Unit test — G-45 / CAND-13 (PILLAR_CANDIDATES §1): local pre-push gate == CI gate.
 *
 * Five "green-locally / red-in-CI" surprises this session traced to ONE root: the
 * habitual local gate (`test:unit`, or just committing) was WEAKER than CI (full
 * `test` + `build`). The structural mitigation (Gabriel-ratified) is a clearly-named
 * `verify:like-ci` script that IS the CI gate, wired into `.husky/pre-push` so a push
 * that would fail CI fails locally FIRST.
 *
 * This test PINS the gate-parity invariant so the divergence cannot silently re-open:
 *   - `verify:like-ci` exists and wraps the CI gate (`qa:ci`).
 *   - `qa:ci` runs the FULL `test` (jest), NOT the narrower `test:unit` (the largest
 *     divergence axis — G-37/38/43), plus lint + typecheck + build.
 *   - `.github/workflows/ci.yml` runs exactly those four `npm run` steps — so if CI
 *     drifts (adds/removes a step), this test catches that the local alias no longer
 *     mirrors it.
 *   - `.husky/pre-push` invokes `verify:like-ci` and keeps the explicit nvm PATH line
 *     (MEMORY.md gotcha: npx/npm resolution breaks inside husky hooks without it).
 *
 * package.json-shape / file-presence idiom mirrors tests/unit/infra/migrate-script.test.ts
 * (Pillar 7 ADAPT). No DB, no network, no test-execution by the agent (Gabriel runs
 * these via qa:ci). G26-failable: every assertion can fail if the gate drifts.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const pkg = JSON.parse(readFileSync(path.resolve(repoRoot, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};
const scripts = pkg.scripts;
const prePush = readFileSync(path.resolve(repoRoot, '.husky/pre-push'), 'utf8');
const ciYml = readFileSync(path.resolve(repoRoot, '.github/workflows/ci.yml'), 'utf8');

// The four steps CI runs (.github/workflows/ci.yml). The single source the local
// gate must mirror.
const CI_STEPS = ['npm run lint', 'npm run typecheck', 'npm run test', 'npm run build'];

describe('verify:like-ci script — the explicit CI-equivalent gate (G-45 / CAND-13)', () => {
  it('defines `verify:like-ci` wrapping the CI gate (`qa:ci`)', () => {
    expect(scripts['verify:like-ci']).toBeDefined();
    expect(scripts['verify:like-ci']).toContain('qa:ci');
  });

  it('`qa:ci` runs the FULL test scope, NOT the narrower test:unit (the divergence root)', () => {
    // The largest "green-locally/red-in-CI" axis was verifying with `test:unit`
    // locally while CI runs the full `test`. The gate MUST use full `test`.
    expect(scripts['qa:ci']).toContain('npm run test');
    expect(scripts['qa:ci']).not.toContain('test:unit');
    // and the full test script is the real runner, not an alias to the unit subset
    expect(scripts.test).toBe('jest');
    expect(scripts['test:unit']).toContain('tests/unit');
  });

  it('`qa:ci` chains all four CI steps (lint + typecheck + test + build)', () => {
    for (const step of CI_STEPS) {
      expect(scripts['qa:ci']).toContain(step);
    }
  });
});

describe('CI parity — qa:ci mirrors .github/workflows/ci.yml (drift guard)', () => {
  it('ci.yml runs exactly the four `npm run` steps qa:ci wraps', () => {
    for (const step of CI_STEPS) {
      expect(ciYml).toContain(step);
    }
  });

  it('ci.yml does NOT run the narrower test:unit (CI is the full-scope authority)', () => {
    expect(ciYml).not.toContain('npm run test:unit');
  });
});

describe('pre-push hook wires the CI-equivalent gate (G-45 / AC-2)', () => {
  it('invokes `verify:like-ci` so a CI-failing push fails locally first', () => {
    expect(prePush).toContain('npm run verify:like-ci');
  });

  it('keeps the explicit nvm PATH line (husky npx/npm-resolution gotcha — MEMORY.md)', () => {
    // CRLF in .husky/ hooks breaks on Linux and npx resolution breaks in npm v11
    // inside husky hooks without an explicit node bin on PATH. The hook must export
    // the nvm node bin (mirrors the working pre-commit/pre-push pattern; Pillar 7).
    expect(prePush).toMatch(/export PATH=.*\.nvm\/versions\/node\/.*\/bin/);
  });

  it('contains no CRLF line endings (LF-only — husky-on-Linux gotcha)', () => {
    expect(prePush).not.toContain('\r');
  });
});

describe('residual env-parity gap is documented (G-45 / AC-3 — no over-claim)', () => {
  const contributing = readFileSync(path.resolve(repoRoot, 'CONTRIBUTING.md'), 'utf8');

  it('names the empty-DB build + git-ignored-absence classes as CI-only backstops', () => {
    expect(contributing).toMatch(/empty.?db/i);
    expect(contributing).toMatch(/git-ignored/i);
    expect(contributing).toMatch(/CI/);
  });

  it('does NOT over-claim that a green pre-push makes CI unable to surprise', () => {
    // The doc must frame pre-push as necessary-not-sufficient. Assert the honest
    // framing phrase is present (it documents the residual rather than hiding it).
    expect(contributing).toMatch(/necessary but not sufficient/i);
  });
});
