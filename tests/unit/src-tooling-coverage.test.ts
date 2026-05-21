/**
 * Unit test — G-26 / ADR-010 AC-GUARD (CAND-12).
 *
 * Guards the "silent-failure-trio" fixed by the src/ consolidation: when all
 * application code moved under src/, the tooling that was configured to IGNORE
 * src/ (a former dead-code graveyard) had to be flipped in lockstep, or tsc and
 * biome would silently STOP checking the entire app.
 *
 * GAMMA cannot run the linters/typechecker (AGENTIC_TEST_EXECUTION_PROHIBITION),
 * so this test codifies the rule the linters would otherwise enforce: it
 * text-parses tsconfig.json + biome.json and goes RED if a future edit re-blinds
 * src/. This is CAND-12 (Producer-Cannot-Self-Verify -> Codify-Validation-at-Source).
 *
 * Each assertion can fail (G26): re-add "src" to tsconfig.exclude or
 * biome.files.ignore, or drop the src-rooted include glob, and the suite turns RED.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

function readJson(rel: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(repoRoot, rel), 'utf8'));
}

describe('src/ tooling coverage guard (ADR-010 AC-GUARD / CAND-12)', () => {
  it('tsconfig.json exclude does NOT blind src/', () => {
    const tsconfig = readJson('tsconfig.json');
    const exclude = (tsconfig.exclude as string[]) ?? [];
    expect(Array.isArray(exclude)).toBe(true);
    expect(exclude).not.toContain('src');
  });

  it('tsconfig.json include has at least one src-rooted glob', () => {
    const tsconfig = readJson('tsconfig.json');
    const include = (tsconfig.include as string[]) ?? [];
    const srcGlobs = include.filter((g) => g.startsWith('src/'));
    expect(srcGlobs.length).toBeGreaterThan(0);
  });

  it('biome.json files.ignore does NOT blind src/ wholesale', () => {
    const biome = readJson('biome.json');
    const files = (biome.files as { ignore?: string[] }) ?? {};
    const ignore = files.ignore ?? [];
    expect(Array.isArray(ignore)).toBe(true);
    // A bare "src" entry would re-blind the whole tree. Specific generated
    // sub-paths (e.g. the admin importMap.js) are allowed and not flagged here.
    expect(ignore).not.toContain('src');
  });
});
