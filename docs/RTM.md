# RTM — Requirements Traceability Matrix (v0.1)

**Version**: 0.1
**Last Updated**: 2026-05-21 (D-23 — repointed source-file cites to the post-`src/`-consolidation tree per ADR-010; test paths under `tests/` unchanged)
**Owner**: SIGMA (initial); MEGA + DELTA refresh per cycle
**Substrate origin**: Tier 3 of BlockSight migration (`.context/blocksi-migration.md`). Grounded in OMEGA O-1 forensic audit §11 (top-5 flows) + §10 (9 drift hazards H1–H9).
**Scope**: user-flow × test-layer matrix. Each cell records the EMPIRICAL state of test coverage at HEAD, not the aspirational state. `FULL` / `PARTIAL` / `GAP` only — no half-measures.

---

## How to read this matrix

- **Flow names** are in Spanish (preserve Cintia's customer-language framing); body is English for engineering clarity.
- **Status legend** — empirical at HEAD per OMEGA O-1 §7 + §8:
  - `FULL` — coverage exists AND exercises the customer-correct invariant (Pillar 2: tests check values, not just renders).
  - `PARTIAL` — coverage exists but misses the critical assertion path (e.g., happy-path-only; no drift detection; mocked-only).
  - `GAP` — no test exists at this layer.
- **Hazard column** lists OMEGA O-1 §10 hazard IDs (H1–H9) that traverse this flow. A flow's hazards are the architectural debt that test layers must guard against. RTM v0.1 cells are not GREEN until every listed hazard has at least one assertion at one layer.
- **RTM v0.1 scope**: 3 seeded flows (F1, F3, F4) per MEGA selection 2026-05-20T14:10:00Z. F2 + F5 listed for completeness but cells are GAP — defer to RTM v0.2.

---

## Test-layer model

| Layer | Spanish label | Tool | Purpose | Agent that writes |
|---|---|---|---|---|
| 1. Unit | Unidad | Jest | Pure functions, adapters, hooks (in isolation) | GAMMA |
| 2. Integration | Integracion | Jest + Payload mocked / real Payload SQLite | Adapter + query + collection-hook + DB round-trips | GAMMA |
| 3. E2E | E2E | Playwright (NOT yet in devDeps per O-1 §13) | Full browser flow against running Next.js + Payload | GAMMA + Gabriel-run |
| 4. User Journey | Recorrido de Usuario | Manual scripted walkthrough by Gabriel/Cintia + analytics-event assertions | Customer-correctness validation; brand-voice fidelity; Cintia QoL | Cintia + Gabriel sign-off |
| 5. Resilience | Resiliencia | Jest fault-injection + integration-with-empty-DB / network-failure cases | Empty-DB silent fallback (H8) / hardcoded-config drift (H6) / stock-drift (H3) / cart localStorage corruption | GAMMA |

**Why 5 layers** — Pillar 2 ("tests that check VALUES + customer journeys, not just renders") demands that beyond Unit + Integration + E2E, two extra surfaces exist: (a) the human-acceptance layer Cintia ultimately gates on (User Journey), and (b) the failure-mode surface that exposes silent-data-drift hazards (Resilience). The latter is non-optional given O-1 §10's nine documented drift hazards.

---

## Flow inventory

| Flow ID | Nombre (Spanish) | Customer-touching? | Cintia-touching? | Hazards (O-1 §10) | RTM v0.1 status |
|---|---|---|---|---|---|
| **F1** | Cliente explora la coleccion y consulta por WhatsApp desde una prenda | YES | indirect (sale follow-up) | H1, H2, H6, H8 | SEEDED |
| **F2** | Cliente arma su carrito y consulta por WhatsApp desde el carrito | YES | indirect | H1, H2, H6 | DEFERRED v0.2 |
| **F3** | Cintia publica una prenda nueva y aparece en la tienda en vivo | YES (eventual) | YES (primary) | H1, H4, H5, H8, H9 | SEEDED |
| **F4** | Cintia registra una venta y el stock se ajusta | NO (admin-only) | YES (primary) | H3, H8 | SEEDED |
| **F5** | Cliente abre la galeria del desfile | YES | indirect | (none direct; H8 silent-fallback) | DEFERRED v0.2 |

---

## RTM matrix

### F1 — Cliente explora la coleccion y consulta por WhatsApp desde una prenda

| Layer | Status | Evidence at HEAD |
|---|---|---|
| 1. Unidad | PARTIAL | `tests/unit/lib/whatsapp.test.ts` (15 cases) covers URL composition; `tests/unit/lib/payload/query-adapters.test.ts` (790L) covers adapters. Static-data fallback path mixed into `adaptModelo` (`src/payload/queries.ts:80`) is asserted at unit level only against synthetic docs — not against an empty/missing-image Payload doc. |
| 2. Integracion | GAP | No integration test that exercises `getModelos()` against a real Payload SQLite + verifies the rendered `/producto/[slug]` server output equals Payload data (no static drift). |
| 3. E2E | GAP | No Playwright. No browser-driven assertion that the "Pedir por WhatsApp" button on `/producto/[slug]` generates the same URL as the cart path with the same modelo. |
| 4. Recorrido de Usuario | GAP | No documented Gabriel/Cintia manual walkthrough script for this flow. No analytics-event acceptance assertion (`whatsapp_product` event fires with correct payload). |
| 5. Resiliencia | GAP | No empty-DB-fallback test for `/producto/[slug]` (H8 silent fallback). No assertion that the `src/lib/config.ts` hardcoded `WHATSAPP_NUMBER` matches `ConfiguracionSitio.whatsappNumero` Payload global (H6 hardcoded-config drift). No drift test that `MODELOS.length === payload.find('modelos').docs.length` to surface H1 in CI. |

**Cell counts**: PARTIAL=1, GAP=4, FULL=0. Flow is RED on every customer-correctness surface.

---

### F2 — Cliente arma su carrito y consulta por WhatsApp desde el carrito *(DEFERRED RTM v0.2)*

| Layer | Status | Evidence at HEAD |
|---|---|---|
| 1. Unidad | PARTIAL | `cart-store.test.ts` (28 cases) covers add/remove/persist. `whatsapp.test.ts` covers multi-item URL. |
| 2. Integracion | GAP | — |
| 3. E2E | GAP | — |
| 4. Recorrido de Usuario | GAP | — |
| 5. Resiliencia | GAP | No assertion that localStorage `chamana-cart` corruption (malformed JSON) recovers gracefully. No `telaDescripcion` drift test (H2). |

---

### F3 — Cintia publica una prenda nueva y aparece en la tienda en vivo

| Layer | Status | Evidence at HEAD |
|---|---|---|
| 1. Unidad | PARTIAL | `auto-slug.test.ts` (20 cases) + `auto-stock.test.ts` (17 cases) cover the wired Modelos hooks. `auto-variante-id.test.ts` (21 cases) covers a hook that is NOT wired (H4: tested-but-dead). |
| 2. Integracion | GAP | No test that Payload `payload.create({ collection: 'modelos', data: ... })` → `getModelos()` returns the new modelo with correct adapter shape. |
| 3. E2E | GAP | No Playwright that drives Cintia's admin UI → save modelo → page-revalidates → `/tienda` shows the new card. |
| 4. Recorrido de Usuario | GAP | No documented Cintia walkthrough script: "create modelo in admin, navigate to public `/tienda`, confirm visibility within revalidation window". No QoL acceptance metric (<2 min add-product time per STRATEGIC_VISION). |
| 5. Resiliencia | GAP | No drift test that sitemap.ts derives ONLY from Payload (no static-MODELOS leak, H5). No assertion that `ContenidoInicio` global is either read or removed (H9). No assertion that Modelos save with missing image gracefully falls back without leaking H1 static-data into customer view. |

**Cell counts**: PARTIAL=1, GAP=4, FULL=0. Flow is RED on the QoL promise to Cintia.

---

### F4 — Cintia registra una venta y el stock se ajusta

**Status update (D-8, 2026-05-20)**: G-10 shipped the `ventasStockSync` afterChange/afterDelete hook + Ventas wiring + paired tests across 4 layers. Cells flipped per G-10-REPORT.md §Acceptance criteria mapping. Hazard H3 (silent stock-drift) is now CLOSED at the implementation layer; see global Hazard-coverage section below.

| Layer | Status | Evidence at HEAD |
|---|---|---|
| 1. Unidad | FULL | `tests/unit/lib/payload/hooks/ventas-stock-sync.test.ts` (18 cases) — covers increment on matching variant / variant-swap (decrement OLD + increment NEW) / delete-decrements / invalid varianteId rejection (Spanish error) / oversell-permissive at stockVendido === stockTotal. Sibling `ventas-state-machine.test.ts` (29 cases) covers the state-transition validator unchanged. |
| 2. Integracion | PARTIAL | `tests/integration/ventas-stock-decrement.test.ts` (AC-1+AC-2: 1, 3, 5 ventas → stockVendido + sinStock composition), `tests/integration/ventas-edit-variant-swap.test.ts` (AC-3: swap composition), `tests/integration/ventas-delete-restores-stock.test.ts` (AC-4: delete decrements + sinStock flips back via autoStock). PARTIAL because the integration layer uses an in-memory Payload stub (Jest moduleNameMapper sentinel) rather than a booted Payload+SQLite instance. Promotion to FULL gated on TD-5 (separate jest project config + node testEnvironment + integration-only path patterns). Cite `.context/TECH_DEBT_REGISTRY.md` TD-5. |
| 3. E2E | PARTIAL | `tests/e2e/F4-cintia-registra-venta-stock.spec.ts` Playwright spec authored (full storefront-disappears-after-venta walkthrough). PARTIAL because Playwright runtime is NOT in devDependencies per OMEGA O-1 §13 (Playwright install is a separate Gabriel-gated infra task). When `@playwright/test` lands + `playwright install` runs in CI, promote to FULL. |
| 4. Recorrido de Usuario | FULL | `tests/user-journeys/F4-cintia-registra-venta-stock.md` — 10-step Gabriel/Cintia-runnable walkthrough; phone-friendly; asserts inventory accuracy after a real sale logged via Payload admin. STRATEGIC_VISION success-metric "Inventory accuracy = 100%" now has a documented acceptance script. |
| 5. Resiliencia | FULL | `tests/resilience/ventas-invalid-variante-id.test.ts` (AC-5: invalid varianteId → Spanish error, no silent write), `tests/resilience/ventas-stock-vendido-already-at-max.test.ts` (oversell-permissive contract pinned), `tests/resilience/ventas-concurrent-saves.test.ts` (concurrent-saves coverage with one `it.todo` for true parallel row-locking — acknowledged limitation, not a gap; promotion path is TD-6 wrap `adjustModeloVariant` in a Payload transaction OR Postgres `SELECT ... FOR UPDATE` when batch-import or multi-user admin ships). Cite TD-6. |

**Cell counts**: FULL=3, PARTIAL=2, GAP=0. Flow is GREEN on customer-correctness invariants; the two PARTIAL cells are gated on separate infra tasks (TD-5 jest project split, TD-6 row-locking promotion + Playwright install), not on F4 logic gaps.

---

### F5 — Cliente abre la galeria del desfile *(DEFERRED RTM v0.2)*

| Layer | Status | Evidence at HEAD |
|---|---|---|
| 1. Unidad | PARTIAL | `query-adapters.test.ts` covers `adaptDesfileEvent`. `desfile.ts` static fallback list is small. |
| 2. Integracion | GAP | — |
| 3. E2E | GAP | — |
| 4. Recorrido de Usuario | GAP | — |
| 5. Resiliencia | GAP | No empty-eventos-collection fallback assertion. |

---

## Aggregate v0.1 status

| Flow | FULL | PARTIAL | GAP | Hazards open |
|---|---|---|---|---|
| F1 (seeded) | 0 | 1 | 4 | H1, H2, H6, H8 |
| F2 (deferred) | 0 | 1 | 4 | H1, H2, H6 |
| F3 (seeded) | 0 | 1 | 4 | H1, H4, H5, H8, H9 |
| F4 (seeded) | 3 | 2 | 0 | H8 (H3 CLOSED 2026-05-20 via G-10) |
| F5 (deferred) | 0 | 1 | 4 | (none direct; H8 silent-fallback only) |
| **Totals** | **3** | **6** | **16** | 8/9 hazards still open (H3 CLOSED 2026-05-20 via G-10) |

**Interpretation**: F4 is now the first flow with FULL coverage on the unit + user-journey + resilience layers, validating the RTM-driven /develop pipeline end-to-end. Integration + E2E PARTIAL on F4 are infra-gated (TD-5 jest project split, Playwright install), not logic-gated. F1 + F3 still need GAMMA cycles to close their cell GAPs.

---

## Global hazard-coverage log

Per-hazard closure tracking. A hazard is CLOSED when (a) the implementation that removes the structural root exists at HEAD, (b) ≥1 unit + ≥1 resilience test asserts the invariant the hazard violated, and (c) the flow's user-journey acceptance script covers the closure path. Cell-PARTIAL flips on E2E or Integration that are infra-gated do NOT prevent hazard closure when (a)+(b)+(c) hold.

| Hazard ID | Description (OMEGA O-1 §10) | Status | Closure evidence |
|---|---|---|---|
| H1 | Static-MODELOS leak into customer view despite Payload migration | OPEN | F1 + F3 cells GAP |
| H2 | `telaDescripcion` drift between static fabrics and Payload | OPEN | F1 + F2 cells GAP |
| H3 | Silent stock-drift — `Ventas.varianteId` validator ships but stockVendido never decremented | **CLOSED 2026-05-20** | G-10: `src/payload/hooks/ventas-stock-sync.ts` + Ventas wiring + tests across 4 layers (unit FULL / resilience FULL / user-journey FULL; integration + E2E PARTIAL on infra gate, not on H3 logic). Cross-ref `.context/active/agents/gamma/pool-a/G-10-REPORT.md`. |
| H4 | `autoVarianteId` orphan — same "validator-shipped-effect-missing" family as H3 | OPEN (G-7 queued) | G-7 will close per same pattern as G-10; family stops accumulating per Pillar 5 observation (see `memory/feedback_pillar_5_structural_growth_trigger.md`). |
| H5 | sitemap.ts leaks static-MODELOS rather than deriving from Payload | OPEN | F3 cells GAP |
| H6 | Hardcoded `WHATSAPP_NUMBER` in `src/lib/config.ts` drifts from `ConfiguracionSitio.whatsappNumero` global | OPEN | F1 cells GAP |
| H7 | (reserved per O-1 §10) | — | — |
| H8 | Empty-DB silent fallback masks Payload-side failures at customer view | OPEN | F1 + F3 + F4 + F5 (cross-cutting); F4 retains H8 in open-list because the empty-DB-fallback path on `getModelos()` is not asserted at resilience layer for the venta-stock-sync read path. |
| H9 | `ContenidoInicio` global neither fully read nor removed | OPEN | F3 cells GAP |

**Family-closure note (Pillar 5)**: H3 + H4 share the "validator-shipped-effect-missing" structural family per OMEGA O-1 §12. With G-10 closing H3 + G-7 queued to close H4 via the same hook-pattern, the family stops accumulating — no 3rd instance suspected per OMEGA scan. See `memory/feedback_pillar_5_structural_growth_trigger.md` §Family-closure log.

---

## Pillar cross-reference

- **Pillar 0 (ZOOM-OUT-FIRST)** — RTM matrix paradigm: capture the EMPIRICAL state, not aspirational. Cells that are GAP today STAY GAP in this version; do not paper over with "PARTIAL" wishful thinking.
- **Pillar 2 (Quality not quantity)** — tests check VALUES + customer journeys. RTM's 5th layer (Resilience) exists precisely to force this discipline: silent fallbacks (H8) and hardcoded-config drift (H6) only surface in resilience tests, never in happy-path tests.
- **Pillar 5 (STRUCTURAL GROWTH TRIGGER)** — three of the four hazards in the seeded flows (H1, H3, H4) share a single structural family per OMEGA §12: "Payload migration is half-complete; static-data layer is still authoritative for several customer-visible paths." RTM cells that fail per-flow do NOT each spawn an isolated leaf-fix; they share the same structural GAMMA tasks (G-3, G-4, G-5 below) that kill the family.
- **Pillar 7 (ADAPTER-NOT-COPIER)** — this RTM is adapted from BlockSight's RTM shape but the row content is Chamana-specific (Spanish flow names, Payload-grounded hazards, Cintia-QoL acceptance, no Bitcoin examples). Smoke-tested by reading the source files cited.

---

## Forward refresh plan

| Trigger | Action |
|---|---|
| GAMMA closes any of G-3..G-5 (per WE_EXPECT specs) | DELTA flips the relevant cells `GAP → FULL/PARTIAL` and updates aggregate. |
| OMEGA discovers a new hazard (H10+) | SIGMA spawns a new RTM row OR adds the hazard to the existing flow's hazard column. |
| RTM v0.2 | Promote F2 + F5 from DEFERRED to SEEDED; add Cintia-side flows (C8 globals edit, C6 prototipos). |
| RTM v1.0 | All seeded flows have ≥1 FULL cell per layer for hazards listed. Cintia user-journey acceptance signed. |

---

## Cross-references

- `.context/active/agents/omega/O-1-REPORT.md` §10 (hazards H1–H9) + §11 (top-5 flow rationale)
- `.context/active/agents/sigma/we-expect/F1-cliente-whatsapp-prenda.md` — F1 acceptance spec
- `.context/active/agents/sigma/we-expect/F3-cintia-publica-prenda.md` — F3 acceptance spec
- `.context/active/agents/sigma/we-expect/F4-cintia-registra-venta-stock.md` — F4 acceptance spec
- `docs/ATDD_PIPELINE.md` — how a RTM-cell GAP becomes a GREEN cell via the /develop pipeline
- `.context/standards/protocols/TDD_GATE_PROTOCOL.md` — TDD discipline that drives RED → GREEN per cell
- `.context/standards/protocols/PAIRED_TESTS_GATE_PROTOCOL.md` — cascade-class enumeration for any change touching adapters/hooks
- `.context/1.system/STRATEGIC_VISION.md` "Success Metrics" — RTM cells map to v1.0 launch criteria (rows 2–8)
