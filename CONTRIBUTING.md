# Contributing to Chamana

## Pre-push gate — local == CI (read before you `git push`)

The `.husky/pre-push` hook runs **`npm run verify:like-ci`**, which is an explicit
alias for `npm run qa:ci` — the *exact* gate CI runs in `.github/workflows/ci.yml`:

```
lint  →  typecheck  →  test (FULL jest, not test:unit)  →  build
```

So a push that would turn CI red fails on your machine **first**. This closes the
"green locally / red in CI" class of surprise (CAND-13) whose largest axis was
verifying with the narrower `test:unit` scope locally while CI runs the full `test`.

> The full gate (including `next build`) makes each push slower. That is the
> **accepted** cost of the guardrail — do **not** drop `build` from the gate to
> make pushes fast; that re-opens the build-compile divergence class (G-39). A
> fast/slow split, if ever wanted, is a separate decision.

### Residual env-parity gap — what a green pre-push still does NOT prove (CI-only backstops)

A green `verify:like-ci` is **necessary but not sufficient**. Two divergence
classes are structural to the local machine and CI remains the **authoritative**
gate for them — never claim "CI can no longer surprise us":

1. **Empty-DB build.** CI builds against an empty/unseeded SQLite fallback and can
   hit prerender crashes like `no such table: colecciones`. Your local `next build`
   reads the **populated** `chamana.db`, so it structurally cannot replicate this.
2. **Absent git-ignored files.** CI checks out a fresh tree **without** git-ignored
   substrate (e.g. `.claude/`). A file present on your disk but git-ignored will be
   absent in CI — a passing local read of it is not a passing CI read.

A green pre-push means "the test-scope + lint/typecheck/build-compile classes pass";
CI is still the final word on the two classes above.

## Database migrations & deploy (read before merging a schema change)

Schema reaches production through committed Payload migrations under
`src/payload/migrations/`. **Migrations are applied MANUALLY by Gabriel from his
terminal — they are NOT auto-applied on deploy.**

> ⚠ **Auto-apply-on-build is DEFERRED (G-44, 2026-05-22).** G-40 chained
> `migrate:deploy` into `build` so the production deploy would apply pending
> migrations automatically. That coupling was **removed** because `npm run
> migrate` does not yet run end-to-end: it crashes on config-load with
> `ERR_REQUIRE_ASYNC_MODULE` (a top-level `await` in the static `payload.config.ts`
> import graph; the Payload CLI's require-loader cannot load it — `build` itself
> works only because it uses a different loader path, `--disable-transpile`).
> A command that has never executed must not sit in the prod build's critical
> path — it would fail every production deploy. The migrate path returns to the
> build **only after** the correct CLI invocation is diagnosed (start with
> `--experimental-print-required-tla` to locate the TLA) **and verified** (an
> actual green `npm run migrate:status`). Until then: apply manually.

### How migrations apply

- `npm run migrate` — apply pending migrations against whatever DB
  `POSTGRES_URL` points at (the real Payload CLI binary). **Gabriel-terminal,
  run deliberately against prod once the invocation is verified working.**
- `npm run migrate:status` — list applied vs pending migrations (drift check).
- `npm run migrate:create` — author a new migration (do not hand-write).

Destructive subcommands (`migrate:down`, `migrate:refresh`, `migrate:reset`,
`migrate:fresh`) are intentionally **not** npm scripts. Run them deliberately
via `node_modules/.bin/payload migrate:reset` etc. — never a one-keystroke
`npm run`.

> ⚠ Never use `npm run payload migrate` — there is no `payload` npm script;
> that form fails. The wired path is `npm run migrate`.

### Additive migrations (the safe common case)

New table / column / enum value are backward-compatible. Merge to `main`, let
the production build deploy the new code, then **Gabriel** applies the pending
migration manually via `npm run migrate` against prod (until auto-apply is
re-wired). Additive shapes are tolerant of the brief code-ahead-of-schema
window at Daniela's single-instance, low-traffic scale.

### Rename / drop migrations — expand/contract + Gabriel pre-verify

A **rename or drop** (e.g. `notasCintia → notasRevision`) opens a brief window
where the previously-deployed code meets the new schema. Because migrations are
applied manually, **Gabriel** must, before merging code that depends on the
renamed/dropped shape, either:

1. Run `npm run migrate:status` against prod from his terminal and apply the
   value-preserving migration manually first, **OR**
2. Ship it as a backward-compatible two-step **expand/contract**:
   add-new → backfill → deploy-code → drop-old.

At Daniela's single-instance, low-traffic scale the window is negligible, but
this discipline prevents a careless rename from breaking live reads.
Migration-apply against prod remains Gabriel-terminal authority.

### Post-deploy verification (Gabriel-run)

After applying new migrations against prod:

```bash
# against prod Neon (POSTGRES_URL = prod):
npm run migrate:status   # expect: 0 pending (all migrations applied)
```

Unit tests verify script shape only; this `migrate:status` check is the
runtime gate that proves the schema actually reached prod — **and is also the
gate that must pass green before auto-apply-on-build is re-wired.**
