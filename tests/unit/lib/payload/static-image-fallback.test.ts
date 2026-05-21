import { STATIC_MODEL_IMAGES } from '@/payload/static-image-fallback';

/**
 * STATIC_MODEL_IMAGES is the build-time SSG image fallback that replaced the static
 * `MODELOS[].imagenes` lookup (G-30). These tests prove it resolves the SAME paths the
 * deleted array did, so the SSG render of tienda/home/producto produces identical image src.
 */
describe('STATIC_MODEL_IMAGES', () => {
  it('includes the 4 real-image models (intuicion, sabia, espejo, luz-y-sombra)', () => {
    for (const slug of ['intuicion', 'sabia', 'espejo', 'luz-y-sombra']) {
      expect(STATIC_MODEL_IMAGES[slug]).toBeDefined();
      expect(STATIC_MODEL_IMAGES[slug].length).toBeGreaterThan(0);
    }
  });

  it('omits the un-imaged models (simbolo, corazonada) so their fallback resolves to []', () => {
    expect(STATIC_MODEL_IMAGES.simbolo).toBeUndefined();
    expect(STATIC_MODEL_IMAGES.corazonada).toBeUndefined();
    // The adapter reads `STATIC_MODEL_IMAGES[slug] ?? []`, so an absent slug yields [].
    expect(STATIC_MODEL_IMAGES.simbolo ?? []).toEqual([]);
  });

  it('every path is a /images/models/<slug>/ webp under its own slug folder', () => {
    let checked = 0;
    for (const [slug, paths] of Object.entries(STATIC_MODEL_IMAGES)) {
      for (const path of paths) {
        expect(path).toMatch(new RegExp(`^/images/models/${slug}/`));
        expect(path.endsWith('.webp')).toBe(true);
        checked++;
      }
    }
    // Guard: the loop actually asserted on real paths.
    expect(checked).toBeGreaterThan(0);
  });

  it('preserves the byte-identical paths from the former static array (hechizo example)', () => {
    expect(STATIC_MODEL_IMAGES.hechizo).toEqual([
      '/images/models/hechizo/hechizo-1.webp',
      '/images/models/hechizo/hechizo-2.webp',
    ]);
  });

  it('totals 45 image paths — the same count the deleted getAllProductImages reported', () => {
    const total = Object.values(STATIC_MODEL_IMAGES).reduce((sum, paths) => sum + paths.length, 0);
    expect(total).toBe(45);
  });

  it('has no duplicate paths within any model', () => {
    for (const paths of Object.values(STATIC_MODEL_IMAGES)) {
      expect(new Set(paths).size).toBe(paths.length);
    }
  });
});
