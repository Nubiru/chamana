# ATDD Pipeline — Concrete Mechanics for Chamana

**Version**: 1.0
**Last Updated**: 2026-05-20
**Owner**: SIGMA (initial); MEGA enforces
**Companion**: `.claude/commands/develop.md` is the EXECUTABLE form of this pipeline. This document explains the WHY — when each phase fires, who owns the deliverable, what tool the layer compiles to on the Chamana stack, and where each phase's acceptance gate lives.

**Substrate**: Tier 3 deliverable per `.context/blocksi-migration.md`. ATDD = Acceptance-Test-Driven Development. The ONLY way to land a change in Chamana v1.0+ is through this 4-phase loop.

---

## Pipeline at a glance

```
Phase 1: SPECIFY      Phase 2: RED          Phase 3: GREEN         Phase 4: INTEGRATE
─────────────────     ──────────────        ──────────────         ──────────────────
SIGMA writes          GAMMA writes          GAMMA implements       GAMMA + DELTA close
WE_EXPECT spec        failing tests         minimum code           Integration + Cintia
                                                                   acceptance + docs
        ↓                     ↓                     ↓                      ↓
RTM cell GAP          test runs RED         test runs GREEN        RTM cell flips
                      (Gabriel terminal)    (Gabriel terminal)     GAP → FULL/PARTIAL
```

---

## Phase 1 — SPECIFY

### Trigger
- A new feature is requested OR an RTM cell shows `GAP` / `PARTIAL` on a hazard the team owes a guard against.
- An OMEGA forensic report surfaces a structural-debt cluster (Pillar 5).
- A Cintia QoL pain point arrives via NOTIFICATIONS.md.

### Owner
**SIGMA** — the spec writer.

### Deliverable
A WE_EXPECT spec at `.context/active/agents/sigma/we-expect/<flow-or-fix-name>.md` OR an S-N.json task file. Either way, eight sections (per `.claude/agents/sigma-readiness.md`):

| § | Content |
|---|---|
| §0 | Pillar 0 ZOOM-OUT-FIRST 4-check (PARADIGM / PATTERN / TOOL / REFLEX answers) |
| §1 | WHAT (META) — name the structure, not the symptom |
| §2 | WHY (REFERENTIAL) — symptom / root-cause / structural-debt layers; cite OMEGA hazards by ID |
| §3 | HOW — AC-1..AC-N, each verifiable, each citing file:line CITE-VERBATIM from the codebase |
| §4 | Option space — STRUCTURAL option ALWAYS included; leaf only if structural's cost explicitly argues against |
| §5 | Recommendation — APPELATIVE voice if Pillar 5 triggered |
| §6 | Tests to write SAME task (per TDD_GATE_PROTOCOL) |
| §7 | filesAffected[] + pairedTests[] + cascadeRationale (per PAIRED_TESTS_GATE_PROTOCOL) |
| §8 | Implementation tasks — atomic decompose, one concern per GAMMA task |

### Tool / Language
- Markdown spec body in English (engineering audience).
- Customer-facing AC strings in Spanish if the AC describes a Cintia/customer-visible artifact.
- §7 filesAffected[] paths follow the PREMISE-VACUOUS rule: NEW paths MUST NOT exist at HEAD; MOD paths MUST exist. Mechanical grep before queueing.

### Acceptance gate
- MEGA reads the spec. If §0 Pillar-0 answers are missing or §4 lacks the STRUCTURAL option, MEGA rejects → SIGMA revises.
- The spec is "ready" when §8 enumerates concrete atomic GAMMA tasks that each carry their own §3 AC subset.

### Anti-pattern
- Skipping Phase 1 (jumping to code) is forbidden. Produces band-aid fixes that don't compose with future changes. Caught by `/develop` workflow refusing to dispatch GAMMA without a spec on disk.

---

## Phase 2 — RED

### Trigger
SIGMA spec accepted; first GAMMA task in §8 is claimed.

### Owner
**GAMMA** — writes tests FIRST.

### Deliverable
Failing test files, located per Chamana convention:

| Test layer | Location | Tool | Naming |
|---|---|---|---|
| Unidad | `tests/unit/<mirror-of-source-path>.test.ts` | Jest 30 + RTL (for components) | mirrors source tree |
| Integracion | `tests/integration/<surface>.test.ts` | Jest + `tests/__mocks__/payload-config.ts` for mocked Payload, or a Jest setup spinning real Payload SQLite | one file per surface (collection adapter, hook chain, API route) |
| E2E | `tests/e2e/<flow-name>.spec.ts` | Playwright (NOT yet in devDependencies per O-1 §13 — install gate is part of first E2E task) | one file per flow per RTM row |
| Recorrido de Usuario | `tests/user-journeys/<flow-name>.md` + `tests/user-journeys/<flow-name>.analytics.test.ts` | Manual scripted walkthrough doc + Jest assertion on GA event payloads | one MD + one TS per flow |
| Resiliencia | `tests/resilience/<hazard>.test.ts` | Jest with fault injection (empty DB, malformed JSON, hardcoded-vs-Payload drift) | one file per hazard ID (H1, H3, H6, ...) |

### Test-quality gates (inherited G22-G26 per SOUL.md)
- G22: NO `try/catch` in test bodies. Tests must FAIL when assertions fail.
- G23: NO `if (!ok) return` silent passes. Always `expect(response.ok).toBe(true)`.
- G24: async/WebSocket timeouts > realistic interval × 1.5.
- G25: Loops need final assertion guard (`expect(verified).toBeGreaterThan(0)`).
- G26: NO trivially-true assertions. Every `expect()` must be able to fail.

### Acceptance gate
**Gabriel runs the tests in his terminal** (per `AGENTIC_TEST_EXECUTION_PROHIBITION_PROTOCOL.md` — agents NEVER run tests, no wrapper bypass via `timeout`, `nice`, `env`, `setsid`). Confirms RED. Pastes failure output into the GAMMA task `result` field OR into NOTIFICATIONS.md when a hook blocks the run.

### Anti-pattern
- Writing tests after code (test-after) is forbidden per TDD_GATE_PROTOCOL.
- "Smoke-test only" tests that pass against any implementation are forbidden per G26.

---

## Phase 3 — GREEN

### Trigger
Gabriel-confirmed RED on Phase 2 tests.

### Owner
**GAMMA** — implements the MINIMUM production code to flip RED → GREEN. KISS-CORRECT per Decision Discipline step 3.

### Scope rules
- All `filesAffected[]` from the spec §7 must be edited atomically.
- All `pairedTests[]` consumer-mock fan-out updated in the SAME task (per PAIRED_TESTS_GATE_PROTOCOL).
- TypeScript strict + Biome must pass (`npm run lint`, `npm run typecheck` — Gabriel-run).
- Production code obeys DOMAIN_SCOPE_PROTOCOL: frontend agents touch `app/**` + `components/**`; backend touches `payload.config.ts` + `collections/**` + `lib/**` + `src/domains/**`. Cross-domain edits need Gabriel approval flagged in NOTIFICATIONS.md.

### Tool / Language
- TypeScript strict per `tsconfig.json`. `src/` is currently `exclude`'d (per O-1 §2) — Tier 5 task may lift this exclusion when CRM lands.
- Payload collections in `collections/*.ts`; hooks in `lib/payload/hooks/`; storefront queries in `lib/payload/queries.ts`.
- Brand voice in customer-facing strings comes from `CINTIA_VOICE_GUIDE.md` (Tier 3 deliverable; consult before writing any Spanish copy in JSX).

### Acceptance gate
Gabriel runs the tests again → GREEN. Outputs pasted to task `result`. If GREEN but tests pass against a regressed expectation, GAMMA opens a Pillar 5 trigger — the spec was wrong or the test was over-fit; SIGMA revises.

### Anti-pattern
- Touching files outside §7 filesAffected[] = scope creep; opens NOTIFICATIONS flag for MEGA review.
- Skipping Biome/typecheck = forbidden; CI catches but agents pre-empt by reading the run logs.

---

## Phase 4 — INTEGRATE

### Trigger
Phase 3 GREEN confirmed.

### Owners
**GAMMA** — integration tests + analytics assertion.
**DELTA** — docs updates (RTM cell flip + COMPONENT_BIBLE entry + KNOWLEDGE_INDEX cross-ref if applicable).
**Cintia (for customer-facing flows)** — real-brand acceptance.

### Deliverables
1. **Integration tests** beyond the Phase-2 RED set. These run against real Payload SQLite (or Postgres when Tier 5 lands) and exercise round-trips end-to-end:
   - Payload collection write → query → storefront adapter → rendered output.
   - Hook chains (Modelos `beforeChange` + Ventas afterCreate + Telas relationship resolution).
   - Brand-Assistant text/image route → OpenAI mock → response shape → Cintia-approve flow (Tier 4).
2. **User-journey acceptance** — for customer-facing flows (F1, F2, F5) and Cintia-QoL flows (F3, F4, plus future C8/C10):
   - GAMMA writes the manual walkthrough script (`tests/user-journeys/<flow>.md`).
   - Gabriel runs through the script on `npm run dev` against the local Payload.
   - Cintia signs off in NOTIFICATIONS.md OR Gabriel transcribes her sign-off when she has used the feature on real brand operations.
   - Cintia acceptance is REQUIRED for: product descriptions, IG captions, WhatsApp scripts, pricing changes, brand voice changes. Per CLAUDE.md "Content-Publishing Authority."
3. **RTM cell flip** — DELTA flips `GAP → FULL` (or `GAP → PARTIAL` if not all 5 layers landed in this cycle) in `docs/RTM.md`. Records hazard-IDs neutralized.
4. **COMPONENT_BIBLE entry** (Tier 3+) — if the change touched a customer-facing component, DELTA adds/updates the SMD + WE_EXPECT cross-ref + screenshot.
5. **Commit message** — GAMMA appends to `.context/COMMIT.md` per format `<type>: <task-id> <subject>`. Gabriel reviews + commits + pushes (NEVER agents per CLAUDE.md "Critical rules").
6. **Task close** — GAMMA closes the task via `tools/scripts/set-task-result.cjs` (once G-2 lands; until then Edit-fallback per RED-FLAG-WAIVER pattern).

### Tier-specific gates
| Tier | Phase-4 add-on |
|---|---|
| Tier 3 | RTM-cell flip mandatory; COMPONENT_BIBLE entry if applicable |
| Tier 4 | Brand-Assistant cost-budget assertion (every text/image call logged + under daily cap); Cintia approve-rate metric ≥70% |
| Tier 5 | CRM + inventory: Cintia uses it for ≥1 week of real brand operations before sign-off |

### Anti-pattern
- Marking GREEN as "done" without RTM flip → silent inventory drift; DELTA hygiene catches but the next cycle has unclear state.
- Skipping Cintia acceptance on customer-facing → publishes off-voice content; structural-debt entry mandatory.

---

## Per-flow Phase mapping (RTM v0.1 seeded flows)

### F1 — Cliente WhatsApp single-prenda
| Phase | Concrete artifact |
|---|---|
| SPECIFY | `.context/active/agents/sigma/we-expect/F1-cliente-whatsapp-prenda.md` (this cycle) |
| RED | `tests/integration/payload-storefront-drift.test.ts` (H1 drift assertion); `tests/resilience/empty-modelos-db.test.ts` (H8); `tests/resilience/whatsapp-config-drift.test.ts` (H6); `tests/user-journeys/F1-cliente-whatsapp-prenda.md` + `.analytics.test.ts` |
| GREEN | Remove static-MODELOS imports from 9 client components per G-3 below; introduce Payload-driven helpers in a server-rendered context provider; pull WhatsApp number from `getSiteConfig()` |
| INTEGRATE | RTM F1 cells flip; Cintia signs walkthrough; commit appended |

### F3 — Cintia publica una prenda nueva
| Phase | Concrete artifact |
|---|---|
| SPECIFY | `.context/active/agents/sigma/we-expect/F3-cintia-publica-prenda.md` (this cycle) |
| RED | `tests/integration/modelos-publish-to-storefront.test.ts`; `tests/integration/sitemap-from-payload.test.ts` (H5); `tests/unit/lib/payload/hooks/auto-variante-id.test.ts` re-wired to validate hook IS in collection definition (H4); `tests/user-journeys/F3-cintia-publica-prenda.md` |
| GREEN | Wire `autoVarianteId` into Modelos.variantes hooks; convert `app/sitemap.ts` to Payload-only; close H9 by either wiring `ContenidoInicio` or removing the global |
| INTEGRATE | RTM F3 cells flip; Cintia tests <2 min add-product time; commit appended |

### F4 — Cintia registra venta + stock se ajusta
| Phase | Concrete artifact |
|---|---|
| SPECIFY | `.context/active/agents/sigma/we-expect/F4-cintia-registra-venta-stock.md` (this cycle) |
| RED | `tests/integration/ventas-stock-decrement.test.ts` (H3); `tests/resilience/ventas-invalid-variante-id.test.ts` |
| GREEN | Add Ventas `afterChange` (or `afterCreate`) hook that resolves the linked Modelo + increments `variantes[match].stockVendido` + lets `autoStock` recompute `sinStock` on next save (or computes inline) |
| INTEGRATE | RTM F4 cells flip; Cintia logs a real venta and confirms storefront updates; commit appended |

---

## Stack mapping summary

| Concern | Chamana choice | Where it lives |
|---|---|---|
| Test runner | Jest 30 | `package.json` devDependencies; config at `jest.config.cjs` |
| Component testing | React Testing Library + `jest-environment-jsdom` | colocated `*.test.tsx` or `tests/unit/components/` |
| Browser E2E | Playwright (TO INSTALL when first E2E task lands) | `tests/e2e/` |
| Payload mocks | `tests/__mocks__/payload-config.ts` | shared mock root |
| Linter / formatter | Biome | `biome.json`; runs on lint-staged |
| Type check | TypeScript strict | `tsconfig.json` |
| CI | GitHub Actions | per-PR + per-merge to `main` |
| Deploy | Vercel auto-deploy | per merge to `main` (production) + per PR (preview) |
| Test execution | Gabriel terminal ONLY | per AGENTIC_TEST_EXECUTION_PROHIBITION_PROTOCOL |

---

## Pillar enforcement summary

| Pillar | Enforced where in the pipeline |
|---|---|
| 0 ZOOM-OUT-FIRST | Phase 1 §0 — SIGMA's 4-check is the gate |
| 1 DEPTH not breadth | Phase 1 §8 — one concern per GAMMA task; never batch unrelated work |
| 2 QUALITY not quantity | Phase 2 RED test-quality gates G22-G26 + RTM 5th layer (Resilience) |
| 3 ARCHITECTURE not quick | Phase 1 §2 root-cause layer + Phase 3 KISS-CORRECT |
| 4 STRUCTURE not half | Phase 4 — RTM cell flip + COMPONENT_BIBLE entry happen SAME cycle as code lands |
| 5 STRUCTURAL GROWTH TRIGGER | Phase 1 §4 — STRUCTURAL option ALWAYS present + §5 APPELATIVE when triggered |
| 6 MEGA-DISPATCH-DEFAULT | MEGA dispatches at Phase 1 acceptance; never executes; friction → dispatch GAMMA/DELTA |
| 7 ADAPTER-NOT-COPIER | Phase 3 — when GAMMA ports/adapts utility code, smoke-test before declaring shipped; never verbatim-copy from BlockSight without adapter step |

---

## Cross-references

- `.claude/commands/develop.md` — the executable form
- `.claude/agents/sigma-readiness.md` — Phase 1 owner discipline
- `.claude/agents/gamma-executor.md` — Phase 2-3 owner discipline (Tier 2 deliverable)
- `.context/standards/protocols/TDD_GATE_PROTOCOL.md`
- `.context/standards/protocols/PAIRED_TESTS_GATE_PROTOCOL.md`
- `.context/standards/protocols/AGENTIC_TEST_EXECUTION_PROHIBITION_PROTOCOL.md`
- `.context/standards/protocols/DOMAIN_SCOPE_PROTOCOL.md`
- `docs/RTM.md` — the matrix Phase 4 flips
- `.context/1.system/STRATEGIC_VISION.md` "v1.0 launch criteria"
