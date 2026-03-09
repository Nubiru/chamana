# /execute — CHAMANA Multi-Session Agent Pipeline

**Purpose**: Self-governing agent pipeline for CHAMANA. Each agent finds work in its domain, claims it, executes with Writer/Checker/Maintainer subagents, reports, and loops.

**Arguments**: `$ARGUMENTS`

---

## Mode Detection

- `ALPHA`: **RUN** — Marketing & Content agent enters loop
- `BETA`: **RUN** — Development & Architecture agent enters loop
- `GAMMA`: **RUN** — Test Engineering agent enters loop
- `OMEGA`: **RUN** — Quality Guardian agent enters loop
- `status`: **STATUS** — Show all slot states and available work

---

## Agent Domains

**ALPHA — Marketing & Content**
Instagram pipeline, visual direction, collection planning, content calendars, Transmutacion launch.
Files: `lib/pipeline/`, `.context/4.Business/`, content output dirs.
Commands: `/prompt`, `/content`, `/collection`, `/transmutacion`, `/marketing`.
NEVER touches: `app/`, `components/`, `lib/payload/`, `collections/`, `globals/`, `tests/`.

**BETA — Development & Architecture**
Payload CMS, storefront pages, DDD architecture, infra, deployment, production gates 0-8.
Files: `app/`, `components/`, `lib/` (except `lib/pipeline/`), `collections/`, `globals/`, `scripts/`.
Commands: `/plan`, `/fix`, `/task`, `/proceed`.
NEVER touches: `lib/pipeline/`, `.context/4.Business/`.

**GAMMA — Test Engineering**
Test infrastructure, TDD test writing, coverage expansion, fixture factories.
Files: `tests/`, `jest.config.ts`, `jest.setup.js`, test helpers/fixtures.
Commands: `/test`, `/test-evaluation`.
Writes test code ONLY — never implementation code. Tests must fail first (RED), then BETA makes them pass (GREEN).
NEVER touches: `app/`, `components/`, `lib/`, `collections/`, `globals/`.

**OMEGA — Quality Guardian**
Code audits, purity checks, SEO verification, brand consistency, code review.
Files: Audit reports in `.context/`. Read-only on codebase — produces reports and recommendations.
Commands: `/audit`, `/review`, `/purity`, `/refactor`, `/system-health`.
NEVER writes implementation or test code. Evaluates what BETA and GAMMA produce.

---

## Mandatory Reads (Before ANY Phase)

1. `.claude/CLAUDE.md` — Project rules
2. `.context/execute/PROTOCOL.md` — Multi-session coordination rules
3. `.context/execute/BOOTSTRAP.md` — Brand rules + technical standards
4. `.context/execute/ROADMAP.md` — Unified work backlog
5. `.context/execute/{SLOT}/GUARDRAILS.md` — Anti-pattern rules (if exists)

---

## The Self-Governing Loop

```
LOOP:
  Phase 1: EVALUATE  — scan ROADMAP, check claims, select work
  Phase 2: PLAN      — write task.md (claim marker)
  Phase 3: EXECUTE   — launch Writer subagent (TDD for BETA, content gen for ALPHA)
  Phase 4: VALIDATE  — launch Checker subagent (independent audit)
  Phase 5: MAINTAIN  — launch Maintainer subagent (regression, cleanup)
  Phase 6: DOCUMENT  — write report.md, commit + push
  GOTO Phase 1 (immediately — no prompts)
```

**Exit conditions** (only these):
- No unchecked items remain in your domain
- 3+ tasks completed in this session (context window management)
- Unrecoverable blocker after 3 fix attempts

---

## Phase 1: EVALUATE

### Read (in order)
1. `.context/execute/ROADMAP.md` — the unified backlog
2. `.context/execute/{SLOT}/report.md` — your last completed work
3. `.context/execute/{SLOT}/priority.md` — MEGA-assigned priorities (override)

### Check Claims (MANDATORY)
Read ALL `.context/execute/*/task.md` files. If another slot claimed an item, skip it.

### Priority Override
If `.context/execute/{SLOT}/priority.md` has a MEGA-assigned task: use it directly, skip claim checking for that item.

### Self-Directed Selection
Scan ROADMAP.md for unchecked `[ ]` items. For each:
1. **Is it in my domain?** Match Track numbers: ALPHA=Track 3, BETA=Track 1+2+5, GAMMA=Track 2 (Gate 6 tests), OMEGA=Track 4.
2. **Is it claimed?** Check all `*/task.md`.
3. **Dependencies met?** Don't pick items that require prior items to complete first.

Select the **highest-priority unclaimed item**.

**If NO work**: Report idle and stop.

---

## Phase 2: PLAN

### Write `.context/execute/{SLOT}/task.md`

```markdown
# Task: [Name]

**Agent**: {SLOT}
**Roadmap**: Track X.Y — "[exact item text]"
**Date**: {today}
**Status**: CLAIMED

## Goal
[1-3 sentences]

## Files to Create/Modify
- path/to/file

## DONE WHEN
- [ ] Implementation complete
- [ ] Tests pass (BETA) / Content generated (ALPHA) / Audit complete (OMEGA)
- [ ] Quality checks pass
```

---

## Phase 3: EXECUTE (Writer Subagent)

Launch a **Writer subagent** via the Agent tool with task.md content.

### ALPHA Writer Instructions
```
You are a Marketing Writer for CHAMANA. Your job: generate content per task.md.

STEPS:
1. Read task.md for assignment
2. Read relevant CHAMANA brand docs (BOOTSTRAP.md, VOCABULARIO_CINTIA.md)
3. Read lib/pipeline/ modules for data context
4. Generate content (prompts, captions, packets, calendar entries)
5. Write output files to specified locations

RULES:
- All copy in Spanish (Argentina)
- Follow brand voice: nature, transformation, feminine power
- Use Cintia's vocabulary clusters
- CAPA not ONDA
- No literal element imagery in AI prompts
- No git commands

RETURN: Files created + content summary.
```

### BETA Writer Instructions
```
You are a Developer Writer for CHAMANA. Your job: TDD implementation.

STEPS:
1. Read task.md for assignment
2. Read .context/execute/BETA/GUARDRAILS.md — MANDATORY anti-pattern rules
3. Read relevant gate spec from .context/2.development/roadmap-production/
4. Write test file FIRST (RED phase)
5. Write implementation — make all tests GREEN
6. Run: npm run build — FULL BUILD including Payload importmap
7. Run: npm run lint && npx tsc --noEmit && npm run test
8. GATE: 0 warnings, 0 failures. Fix and re-run if needed.

RULES:
- TypeScript strict mode
- Biome linting (not ESLint)
- Domain layer: ZERO imports from infrastructure/presentation
- Pure functions: no Date.now(), no process.env, no console.log in domain
- Spanish labels for CMS, English for code
- Payload hooks/collections/globals: RELATIVE imports only, .ts extensions, NO @/ aliases
- New collections/globals: MUST create DB migration in src/migrations/
- No git commands

RETURN: Files created + test output + build output.
```

### GAMMA Writer Instructions

```text
You are a Test Engineer for CHAMANA. Your job: write tests and test infrastructure.

STEPS:
1. Read task.md for assignment
2. Read existing tests in tests/ — follow conventions
3. Write test file FIRST (RED phase — tests that SHOULD pass but currently fail)
4. Run: npm run test — confirm new tests fail for the right reason
5. Run: npm run validate — ensure existing code still builds
6. Coordinate with BETA for implementation (GREEN phase)

RULES:
- Tests go in tests/ directory only (unit/, integration/, e2e/)
- Use factory functions from tests/helpers/fixtures.ts
- Deterministic tests: inject time, mock I/O, no flaky assertions
- Never write implementation code — only test code + test helpers
- No git commands

RETURN: Test files created + test output (expected failures documented).
```

### OMEGA Writer Instructions

```text
You are a Quality Auditor for CHAMANA. Your job: produce audit reports and recommendations.

STEPS:
1. Read task.md for assignment
2. Scan target code for quality issues using available commands
3. Write audit reports with prioritized findings
4. Produce actionable recommendations for BETA and GAMMA

RULES:
- Audit reports go to .context/ directories
- NEVER write implementation code or test code
- Read-only on codebase — observe, evaluate, report
- Quality commands: /audit, /purity, /refactor, /system-health
- No git commands

RETURN: Audit reports + prioritized findings + recommendations for other agents.
```

---

## Phase 4: VALIDATE (Checker Subagent)

Launch a **Checker subagent** after Writer completes.

```
You are a Checker for CHAMANA. Validate these files: [list from Writer]

CHECKS:
1. BUILD: npm run build — zero errors (includes Payload importmap step!)
2. LINT: npm run lint — zero warnings
3. TYPECHECK: npx tsc --noEmit — clean
4. TESTS: npm run test — 0 failures
5. NAMING: Spanish for user-facing, English for code
6. DOMAIN PURITY: No process.env/Date.now() in lib/domain/
7. BRAND: Colors match OKLCH palette, CHAMANA uppercase, CAPA not ONDA
8. PAYLOAD IMPORTS: No @/ aliases in collections/, globals/, lib/payload/hooks/, payload.config.ts
9. DB MIGRATION: If new collection/global added, migration file exists in src/migrations/

RETURN: PASS or FAIL with specific findings.
```

**On FAIL**: Send findings to new Writer subagent for fixes. Re-check. After 3 FAILs: write escalation.md.

---

## Phase 5: MAINTAIN (Maintainer Subagent)

```
You are a Maintainer for CHAMANA. Post-delivery sweep.

FILES: [list from Writer]

CHECKS:
1. REGRESSION: npm run test — all tests still pass
2. DEAD CODE: Every export is used somewhere
3. TODO AUDIT: No naked TODOs
4. DUPLICATION: No overlap with existing code
5. IMPORT CHECK: No circular dependencies

RETURN: PASS, WARN (non-blocking), or CRITICAL (blocking).
```

---

## Phase 6: DOCUMENT

### Write report.md (prepend)

```markdown
## [{date}] Task: {title}

**Status**: COMPLETE
**Roadmap**: Track X.Y
**Files**: {list}
**Checker**: PASS
**Maintainer**: PASS
**Next candidate**: Track X.Z
```

### Git Commit + Push

```bash
git add [specific files only]
git commit -m "feat(agent-{SLOT}): {module} — {description}

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git stash --include-untracked && git pull --rebase origin main && git push origin main && git stash pop
```

### Update ROADMAP.md
Change `[ ]` to `[x]` for the completed item.

### Auto-Continue
Loop immediately to Phase 1. No prompts.

---

## STATUS Mode

When `$ARGUMENTS` is `status`:

1. Read all `*/task.md` and `*/report.md` in `.context/execute/`
2. Scan ROADMAP.md: count `[ ]` vs `[x]` per track
3. Report:

```markdown
## Execute Status

| Slot | Status | Current Task | Last Completed |
|------|--------|-------------|----------------|
| ALPHA | {idle/active} | {task or —} | {last report entry} |
| BETA | {idle/active} | {task or —} | {last report entry} |
| GAMMA | {idle/active} | {task or —} | {last report entry} |
| OMEGA | {idle/active} | {task or —} | {last report entry} |

## Roadmap Progress
- Track 1 (Ship): {done}/{total}
- Track 2 (Architecture): {done}/{total}
- Track 3 (Marketing): {done}/{total}
- Track 4 (Quality): {done}/{total}
- Track 5 (Vision): {done}/{total}
```
