/**
 * Unit test — G-41 / F-storefront-freshness AC-6 #1 (page-config-shape).
 *
 * Source-content assertion (not module import): the storefront pages are RSC
 * server components that pull `@payload-config` + server-only deps into jest, so
 * we read the file text and regex the `export const revalidate = N` instead of
 * importing the module. This guards ADR-014's ISR self-heal net:
 *   - each data-driven page exports the spec's `revalidate` value (3600 / 86400);
 *   - `carrito/page.tsx` (a `'use client'` page) exports NO `revalidate`;
 *   - NO page exports `dynamic` / `'force-dynamic'` (ADR-014 §3 refusal).
 *
 * G26: every expect can fail (a wrong/missing value flips it). G22: no try/catch.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

function read(rel: string): string {
  return readFileSync(path.resolve(process.cwd(), rel), 'utf8');
}

const DATA_DRIVEN_PAGES: Array<{ file: string; revalidate: number }> = [
  { file: 'src/app/(store)/page.tsx', revalidate: 3600 },
  { file: 'src/app/(store)/tienda/page.tsx', revalidate: 3600 },
  { file: 'src/app/(store)/producto/[slug]/page.tsx', revalidate: 3600 },
  { file: 'src/app/(store)/colecciones/page.tsx', revalidate: 3600 },
  { file: 'src/app/(store)/colecciones/[slug]/page.tsx', revalidate: 3600 },
  { file: 'src/app/(store)/desfile/page.tsx', revalidate: 86400 },
];

const REVALIDATE_RE = /export\s+const\s+revalidate\s*=\s*(\d+)/;
const DYNAMIC_RE = /export\s+const\s+dynamic\s*=/;

describe('storefront ISR config — G-41 / F-storefront-freshness AC-1', () => {
  it.each(DATA_DRIVEN_PAGES)(
    '$file exports `revalidate = $revalidate` (the ISR self-heal net)',
    ({ file, revalidate }) => {
      const match = read(file).match(REVALIDATE_RE);
      expect(match).not.toBeNull();
      expect(Number(match?.[1])).toBe(revalidate);
    }
  );

  it('carrito/page.tsx (use client) exports NO revalidate', () => {
    const src = read('src/app/(store)/carrito/page.tsx');
    expect(src).toContain("'use client'");
    expect(REVALIDATE_RE.test(src)).toBe(false);
  });

  const NO_DYNAMIC_PAGES = [
    ...DATA_DRIVEN_PAGES.map((p) => p.file),
    'src/app/(store)/carrito/page.tsx',
  ];

  it.each(NO_DYNAMIC_PAGES)('%s does NOT export `dynamic` (no force-dynamic — ADR-014)', (file) => {
    expect(DYNAMIC_RE.test(read(file))).toBe(false);
  });

  it.each(NO_DYNAMIC_PAGES)('%s contains no `force-dynamic` literal', (file) => {
    expect(read(file)).not.toContain('force-dynamic');
  });
});
