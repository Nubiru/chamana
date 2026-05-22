# Contributing to Chamana

## Database migrations & deploy (read before merging a schema change)

Schema reaches production through committed Payload migrations under
`src/payload/migrations/`. The apply leg is wired into the **production**
deploy — it is not a remembered manual step.

### How migrations apply

- `npm run migrate` — apply pending migrations against whatever DB
  `POSTGRES_URL` points at (the real Payload CLI binary).
- `npm run migrate:status` — list applied vs pending migrations (drift check).
- `npm run migrate:create` — author a new migration (do not hand-write).
- `npm run migrate:deploy` — the deploy hook. It runs `migrate` **only** when
  `VERCEL_ENV = production`; on previews and in CI (`VERCEL_ENV` unset) it
  no-ops with a skip echo. It is chained into `build` **before** `next build`,
  so a failed migration aborts the deploy (fail-closed) — a half-migrated DB
  never ships a live build.

Destructive subcommands (`migrate:down`, `migrate:refresh`, `migrate:reset`,
`migrate:fresh`) are intentionally **not** npm scripts. Run them deliberately
via `node_modules/.bin/payload migrate:reset` etc. — never a one-keystroke
`npm run`.

> ⚠ Never use `npm run payload migrate` — there is no `payload` npm script;
> that form fails. The wired path is `npm run migrate`.

### Additive migrations (the safe common case)

New table / column / enum value are backward-compatible. The merge to `main`
that fires the production build IS Gabriel's deliberate deploy trigger, so
auto-apply binds the apply to the deploy he chose — it does not bypass his
authority. Nothing extra to do.

### Rename / drop migrations — expand/contract + Gabriel pre-verify

A **rename or drop** (e.g. `notasCintia → notasRevision`) opens a brief window
where the previously-deployed code meets the new schema. Before merging code
that depends on the renamed/dropped shape, **Gabriel** must either:

1. Run `npm run migrate:status` against prod from his terminal and apply the
   value-preserving migration manually first, **OR**
2. Ship it as a backward-compatible two-step **expand/contract**:
   add-new → backfill → deploy-code → drop-old.

At Daniela's single-instance, low-traffic scale the window is negligible, but
this discipline prevents a careless rename from breaking live reads.
Migration-apply against prod remains Gabriel-terminal authority.

### Post-deploy verification (Gabriel-run)

After the first production deploy that carries new migrations:

```bash
# against prod Neon (POSTGRES_URL = prod):
npm run migrate:status   # expect: 0 pending (all migrations applied)
```

Unit tests verify script shape only; this `migrate:status` check is the
runtime gate that proves the schema actually reached prod.
