import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = join(
  import.meta.dirname,
  '../.context/3.Client/Brand-data/FOTOS DESFILE-20260211T231408Z-1-001/FOTOS DESFILE'
);
const OUTPUT_DIR = join(import.meta.dirname, '../public/images/desfile');
const MAX_WIDTH = 1400;
const QUALITY = 82;

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

const files = readdirSync(SOURCE_DIR)
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort((a, b) => {
    const numA = Number.parseInt(a.match(/\((\d+)\)/)?.[1] ?? '0', 10);
    const numB = Number.parseInt(b.match(/\((\d+)\)/)?.[1] ?? '0', 10);
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

console.log(`Found ${files.length} source images`);

for (let i = 0; i < files.length; i++) {
  const src = join(SOURCE_DIR, files[i]);
  const idx = String(i + 1).padStart(2, '0');
  const out = join(OUTPUT_DIR, `desfile-${idx}.webp`);

  await sharp(src)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out);

  console.log(`  ${files[i]} → desfile-${idx}.webp`);
}

console.log(`\nDone! ${files.length} WebP images written to public/images/desfile/`);
