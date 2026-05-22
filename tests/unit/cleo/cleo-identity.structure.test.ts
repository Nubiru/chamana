/**
 * Unit test — G-32 / ADR-011 §3 + F-cleo-phase1-stock.md AC-1, AC-2, AC-4.
 *
 * Structure-guards `.claude/CLEO.md` — Cleo's Spanish identity file (the file that
 * makes a Claude Code session BE Cleo, analogous to how `.claude/CLAUDE.md` makes a
 * session the orchestrator). The cascade this guards: a CLEO.md missing any of the 7
 * HARD RULES (esp. confirm-before-mutate / never-read-secrets / no-auto-publish) is a
 * SAFETY REGRESSION for an agent that mutates live business data. The test asserts the
 * 7 rule keywords + the persona markers (Cleo / Daniela / español) + the empty
 * Daniela-curated taste section are present (source-as-witness, read as text — the
 * project's `payload-config-migration-dir.test.ts` precedent).
 *
 * GIT-IGNORED SUBSTRATE NOTE (by design, D-20): `.claude/` is git-ignored, so CLEO.md
 * is present on Gabriel's machine (where `npm run qa` runs, AC-GREEN) but absent in a
 * CI checkout. This is NOT a swallowed assertion (G23) — it is an explicit environment
 * gate: where the file exists the assertions run for real and CAN fail; where it is
 * git-ignored-absent the suite skips with a name that says why. The guard is meaningful
 * exactly where the file lives.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const cleoPath = path.resolve(process.cwd(), '.claude/CLEO.md');
const cleoExists = existsSync(cleoPath);

// The 7 HARD RULES (ADR-011 §3.5) — each keyword anchor MUST be present verbatim.
const HARD_RULES: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: '1 CONFIRM-BEFORE-MUTATE', pattern: /CONFIRM-BEFORE-MUTATE/ },
  { label: '2 NEVER SILENTLY CORRUPT STOCK', pattern: /NEVER SILENTLY CORRUPT STOCK/ },
  { label: '3 SPANISH ALWAYS', pattern: /SPANISH ALWAYS/ },
  {
    label: '4 NO CUSTOMER-FACING OUTPUT WITHOUT DANIELA SIGN-OFF',
    pattern: /NO CUSTOMER-FACING OUTPUT WITHOUT DANIELA SIGN-OFF/,
  },
  { label: '5 NEVER READ SECRETS', pattern: /NEVER READ SECRETS/ },
  { label: '6 DESTROY NEVER, RED-FLAG ALWAYS', pattern: /DESTROY NEVER,?\s*RED-FLAG ALWAYS/ },
  { label: '7 NO FABRICATION', pattern: /NO FABRICATION/ },
];

const describeIfPresent = cleoExists ? describe : describe.skip;

describeIfPresent(
  'CLEO.md — Cleo identity structure (git-ignored substrate; runs where present)',
  () => {
    // Jest evaluates a describe.skip callback body to register its nested `it`s,
    // so this read runs even when skipped. Guard it: where CLEO.md is git-ignored-
    // absent (CI, D-20) the `it`s never execute, so '' is never asserted against;
    // where the file is present (Gabriel's machine) the assertions run for real.
    const source = cleoExists ? readFileSync(cleoPath, 'utf8') : '';

    it('is non-empty (the identity file actually has content)', () => {
      expect(source.trim().length).toBeGreaterThan(500);
    });

    it.each(HARD_RULES)('contains HARD RULE $label verbatim (AC-2)', ({ pattern }) => {
      expect(source).toMatch(pattern);
    });

    it('contains all 7 hard rules (no rule silently dropped)', () => {
      const present = HARD_RULES.filter((r) => r.pattern.test(source));
      expect(present).toHaveLength(7);
    });

    it('names the assistant "Cleo" (persona marker, AC-2)', () => {
      expect(source).toMatch(/\bCleo\b/);
    });

    it('addresses the owner as "Daniela" (persona marker, AC-2)', () => {
      expect(source).toMatch(/\bDaniela\b/);
    });

    it('declares Spanish as the language (español/Spanish marker, AC-2)', () => {
      expect(source).toMatch(/español/i);
    });

    it('marks the not-yet-authored voice guide as pendiente, not a live cite (AC-3 / CAND-10)', () => {
      // DANIELA_VOICE_GUIDE.md must appear flagged "(pendiente — aún no escrito)" near its mention,
      // never as a phantom live source. (D-26 renamed CINTIA_VOICE_GUIDE.md → DANIELA_VOICE_GUIDE.md.)
      expect(source).toMatch(/DANIELA_VOICE_GUIDE\.md/);
      expect(source).toMatch(/pendiente — aún no escrito/);
    });

    it('has an empty Daniela-curated taste section with a "Daniela completa esto" note (AC-4)', () => {
      expect(source).toMatch(/##.*Lo que le gusta a Daniela/);
      expect(source).toMatch(/Daniela completa esto/);
    });
  }
);
