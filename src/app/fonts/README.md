# src/app/fonts/ — next/font/local build inputs

These `.ttf` files are **build inputs for `next/font/local`**, not public static
assets. They are referenced by `src/app/(store)/layout.tsx` via a source-relative
`path:` and consumed at **build time** — Next self-hosts and fingerprints them
into the optimized font CSS (no `@font-face` you write, no `/fonts/` URL you link).

## Why they live here (and not in `public/fonts/`)

`next/font/local` resolves `path:` **relative to the source file**, on the
filesystem — it is NOT a module import, so `tsc` / `jest` / `biome` are all blind
to it; only `next build` resolves it. Colocating the fonts next to the layout that
loads them makes the reference idiomatic and **move-robust**: `../fonts/...` from
`src/app/(store)/` resolves to `src/app/fonts/`, and it survives directory moves
that a fragile cross-tree `../../public/...` path did not (that mismatch was the
`app/` → `src/app/` migration's 3rd build break — see G-28).

## Contents

| File | Used by | CSS var |
|------|---------|---------|
| `serif-flowers/SerifFlowers-Regular.ttf` | `layout.tsx` `serifFlowers` | `--font-titles` |
| `cherolina/Cherolina-Regular.ttf` | `layout.tsx` `cherolina` | `--font-text` |

Only the `.ttf` actually referenced by `layout.tsx` live here. The dead `.otf`
variants and a stray space-named copy that previously sat in `public/fonts/` were
removed in the same migration-finish change.

## Do NOT

- **Do not move these back to `public/`.** `public/` is for runtime-served static
  assets reached by URL; these are compile-time font inputs. Misplacing them in
  `public/` is exactly what made them break on the directory move.
- **Do not change the `path:` in `layout.tsx`** to a cross-tree relative path.
  Keep it source-relative (`../fonts/...`).

> Supersedes the former `public/fonts/README.md` (deleted in the migration-finish
> change). The `globals.css` `--font-text` / "Cherolina" references are CSS-var
> names + comments only — no path, move-immune — and are unrelated to these files.
