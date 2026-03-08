import type { FieldHook } from 'payload';

export const autoVarianteId: FieldHook = async ({ value, siblingData, req }) => {
  if (value) return value;

  const tela1Id = siblingData?.tela1;
  if (!tela1Id) return value;

  try {
    const tela1 = await req.payload.findByID({
      collection: 'telas',
      id: tela1Id,
    });

    const modelSlug = siblingData?._parentSlug || 'model';
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
