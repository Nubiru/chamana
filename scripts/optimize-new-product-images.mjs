import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, '.context/3.Client/products');
const OUT = join(ROOT, 'public/images/models');
const MAX_WIDTH = 1400;
const QUALITY = 82;

// Each entry: [slug, startIndex, sourceFile]
const images = [
  // Dejavu: already has 2, adding 3 and 4
  ['dejavu', 3, join(SRC, 'Palazo Dejavu/IMG_4432.heic2.jpg')],
  ['dejavu', 4, join(SRC, 'Palazo Dejavu/IMG_4462.heic2.jpg')],

  // Simpleza: no images yet, adding 1 and 2
  ['simpleza', 1, join(SRC, 'Short Simpleza/IMG_20260107_130612~3.jpg')],
  ['simpleza', 2, join(SRC, 'Short Simpleza/IMG_4128.heic2.jpg')],

  // Reflejo: already has 2, adding 3 and 4
  ['reflejo', 3, join(SRC, 'Top _Reflejo_ Reversible/IMG_4198.heic3.jpg')],
  ['reflejo', 4, join(SRC, 'Top _Reflejo_ Reversible/IMG_4205.heic2.jpg')],

  // Espejo: already has 4, adding 5
  ['espejo', 5, join(SRC, 'Top Espejo Reversible/Top Espejo Reversible Tejido natural.jpg')],

  // Sabia: already has 3, adding 4
  ['sabia', 4, join(SRC, 'Remeron _Sabia_/IMG_4373.heic2.jpg')],
];

for (const [slug, idx, srcPath] of images) {
  const dir = join(OUT, slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const outPath = join(dir, `${slug}-${idx}.webp`);

  await sharp(srcPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outPath);

  console.log(`  ${slug}-${idx}.webp ← ${srcPath.split('/').pop()}`);
}

console.log(`\nDone! ${images.length} new WebP images optimized.`);
