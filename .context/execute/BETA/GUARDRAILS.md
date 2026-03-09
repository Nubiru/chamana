# BETA Guardrails — Anti-Pattern Rules

**Purpose**: Prevent production breakage. Read this BEFORE every task.
**Updated**: 2026-03-09 — Two production incidents in one session.

---

## RULE 1: Payload hooks must use RELATIVE imports with .ts extensions

Payload's `generate:importmap` runs as plain Node ESM — NOT through Next.js.
`@/` path aliases DO NOT RESOLVE.

```ts
// WRONG — breaks production build
import { slugify } from '@/lib/domain/shared/slug';

// CORRECT — explicit relative + .ts extension
import { slugify } from '../../domain/shared/slug.ts';
```

**Applies to**: Everything in `collections/`, `globals/`, `lib/payload/hooks/`, `lib/payload/access.ts`, `payload.config.ts`

**Why**: Payload's `generate:importmap` step runs before `next build`. It uses Node's native ESM resolver which doesn't know about tsconfig path aliases.

---

## RULE 2: New collections/globals REQUIRE a database migration

Adding a collection or global to `payload.config.ts` means new tables/columns in PostgreSQL.
The production Neon DB will NOT auto-update.

**Checklist when adding a collection/global**:
1. Add the collection/global to code
2. Run `payload migrate:create` to generate migration
3. Review the generated SQL — if it tries to CREATE ALL tables, write a surgical migration instead
4. Run `payload migrate` against production BEFORE deploying
5. Commit migration files with the feature

**Why**: The production DB was created with push (dev mode). Payload generates code that references new columns at build time. If the DB doesn't have them → 500 Internal Server Error on `/admin`.

---

## RULE 3: Always verify builds LOCALLY before pushing

```bash
npm run build    # Must complete without errors
```

The `npm run validate` script checks lint + types + tests but does NOT run the full Next.js build, which includes Payload's `generate:importmap` step. Only `npm run build` catches import resolution issues.

---

## RULE 4: Never commit uncommitted refactoring debris

If a refactoring session creates new files (like `lib/config.ts`) that other modified files depend on, ALL changes must be committed together. Partial commits leave the codebase in a broken state.

**Before ending a session**: Run `git status` and commit everything, or stash + document.

---

## RULE 5: Test /admin locally in production mode after schema changes

```bash
npm run build && npx next start -p 3001
# Then visit http://localhost:3001/admin
```

Dev mode auto-pushes schema to local SQLite. Production mode connects to Neon PostgreSQL. Only production mode catches DB schema mismatches.

---

## Production Incident Log

| Date | What Broke | Root Cause | Rule Added |
|------|-----------|------------|------------|
| 2026-03-09 | Vercel build failed (ERR_MODULE_NOT_FOUND) | BETA used `@/lib/domain/...` in Payload hooks | Rule 1 |
| 2026-03-09 | /admin 500 (column publicaciones_id does not exist) | New collection without DB migration | Rule 2 |
| 2026-03-09 | Uncommitted lib/config.ts caused import failures | Partial commit from BETA session | Rule 4 |
