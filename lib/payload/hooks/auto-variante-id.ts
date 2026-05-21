import type { FieldHook } from 'payload';

/**
 * Auto-generates `varianteId` from `{modelSlug}-{tela1code}[-{tela2code}]`.
 *
 * Wiring contract: `fields.variantes.fields.varianteId.hooks.beforeValidate`.
 * Payload passes `data` = full Modelo document (so `data.slug` is reachable)
 * and `siblingData` = the variant row (so `tela1` / `tela2` are reachable).
 *
 * `siblingData._parentSlug` is supported as a fallback for test fixtures and
 * for non-collection invocations that synthesize the parent slug into the row.
 */
export const autoVarianteId: FieldHook = async ({ value, siblingData, data, req }) => {
  if (value) return value;

  const tela1Id = siblingData?.tela1;
  if (!tela1Id) return value;

  try {
    const tela1 = await req.payload.findByID({
      collection: 'telas',
      id: tela1Id,
    });

    const modelSlug =
      (data as { slug?: unknown } | undefined)?.slug || siblingData?._parentSlug || 'model';
    const tela1Code = tela1?.codigo?.toLowerCase() || 'unknown';

    const tela2Id = siblingData?.tela2;
    if (tela2Id) {
      const tela2 = await req.payload.findByID({
        collection: 'telas',
        id: tela2Id,
      });
      const tela2Code = tela2?.codigo?.toLowerCase() || 'unknown';
      return `${modelSlug}-${tela1Code}-${tela2Code}`;
    }

    return `${modelSlug}-${tela1Code}`;
  } catch {
    return value;
  }
};
