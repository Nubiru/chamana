/**
 * Build-time SSG image fallback: model slug → static /public webp paths.
 *
 * Used by `adaptModelo` (queries.ts) when a Payload modelo has no uploaded image
 * relationships — the product photos currently live as static `/public/images/models/<slug>/`
 * assets, NOT as Payload Media uploads. This is an honest static-asset manifest (image paths
 * only — no prices, descriptions, or other catalog data Payload owns), generated from the
 * former static `MODELOS[].imagenes` arrays (paths byte-identical). Models without photos yet
 * (simbolo, corazonada) are intentionally absent; their fallback resolves to `[]`.
 */
export const STATIC_MODEL_IMAGES: Record<string, string[]> = {
  hechizo: ['/images/models/hechizo/hechizo-1.webp', '/images/models/hechizo/hechizo-2.webp'],
  sagrada: ['/images/models/sagrada/sagrada-1.webp', '/images/models/sagrada/sagrada-2.webp'],
  intuicion: [
    '/images/models/intuicion/intuicion-1.webp',
    '/images/models/intuicion/intuicion-2.webp',
    '/images/models/intuicion/intuicion-3.webp',
    '/images/models/intuicion/intuicion-4.webp',
    '/images/models/intuicion/intuicion-5.webp',
    '/images/models/intuicion/intuicion-6.webp',
  ],
  sabia: [
    '/images/models/sabia/sabia-1.webp',
    '/images/models/sabia/sabia-2.webp',
    '/images/models/sabia/sabia-3.webp',
    '/images/models/sabia/sabia-4.webp',
  ],
  magnetica: [
    '/images/models/magnetica/magnetica-1.webp',
    '/images/models/magnetica/magnetica-2.webp',
    '/images/models/magnetica/magnetica-3.webp',
    '/images/models/magnetica/magnetica-4.webp',
  ],
  espejo: [
    '/images/models/espejo/espejo-1.webp',
    '/images/models/espejo/espejo-2.webp',
    '/images/models/espejo/espejo-3.webp',
    '/images/models/espejo/espejo-4.webp',
    '/images/models/espejo/espejo-5.webp',
  ],
  reflejo: [
    '/images/models/reflejo/reflejo-1.webp',
    '/images/models/reflejo/reflejo-2.webp',
    '/images/models/reflejo/reflejo-3.webp',
    '/images/models/reflejo/reflejo-4.webp',
  ],
  guerrera: ['/images/models/guerrera/guerrera-1.webp', '/images/models/guerrera/guerrera-2.webp'],
  simpleza: ['/images/models/simpleza/simpleza-1.webp', '/images/models/simpleza/simpleza-2.webp'],
  dejavu: [
    '/images/models/dejavu/dejavu-1.webp',
    '/images/models/dejavu/dejavu-2.webp',
    '/images/models/dejavu/dejavu-3.webp',
    '/images/models/dejavu/dejavu-4.webp',
  ],
  'luz-y-sombra': [
    '/images/models/luz-y-sombra/luz-y-sombra-1.webp',
    '/images/models/luz-y-sombra/luz-y-sombra-2.webp',
    '/images/models/luz-y-sombra/luz-y-sombra-3.webp',
    '/images/models/luz-y-sombra/luz-y-sombra-4.webp',
    '/images/models/luz-y-sombra/luz-y-sombra-5.webp',
  ],
  mistica: [
    '/images/models/mistica/mistica-1.webp',
    '/images/models/mistica/mistica-2.webp',
    '/images/models/mistica/mistica-3.webp',
    '/images/models/mistica/mistica-4.webp',
    '/images/models/mistica/mistica-5.webp',
  ],
};
