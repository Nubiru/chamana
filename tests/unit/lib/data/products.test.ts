import { MODELOS, getModelBySlug, getModelsByTipo, getVarianteById } from '@/lib/data/products';

describe('products data', () => {
  it('has exactly 14 models', () => {
    expect(MODELOS).toHaveLength(14);
  });

  it('every model has a unique slug', () => {
    const slugs = MODELOS.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every model has at least one variante', () => {
    for (const model of MODELOS) {
      expect(model.variantes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every variante has a unique id within its model', () => {
    for (const model of MODELOS) {
      const ids = model.variantes.map((v) => v.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('every variante has valid tela1 with colorHex', () => {
    for (const model of MODELOS) {
      for (const v of model.variantes) {
        expect(v.tela1).toBeDefined();
        expect(v.tela1.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('reversible models (Espejo, Reflejo) have tela2 on all variantes', () => {
    const reversibles = MODELOS.filter((m) => m.detalle === 'Reversible');
    expect(reversibles.length).toBeGreaterThanOrEqual(2);
    for (const model of reversibles) {
      for (const v of model.variantes) {
        expect(v.tela2).toBeDefined();
      }
    }
  });
});

describe('getModelBySlug', () => {
  it('returns model for valid slug', () => {
    const model = getModelBySlug('hechizo');
    expect(model).toBeDefined();
    expect(model!.nombre).toBe('Hechizo');
  });

  it('returns undefined for invalid slug', () => {
    expect(getModelBySlug('nonexistent')).toBeUndefined();
  });
});

describe('getModelsByTipo', () => {
  it('returns faldas', () => {
    const faldas = getModelsByTipo('Falda');
    expect(faldas.length).toBeGreaterThanOrEqual(1);
    for (const f of faldas) {
      expect(f.tipo).toBe('Falda');
    }
  });

  it('returns empty for unknown tipo', () => {
    expect(getModelsByTipo('Zapato')).toHaveLength(0);
  });
});

describe('getVarianteById', () => {
  it('returns variante for valid id', () => {
    const model = getModelBySlug('hechizo')!;
    const variante = getVarianteById(model, 'hechizo-linmenchoc');
    expect(variante).toBeDefined();
    expect(variante!.tela1.color).toBe('Chocolate');
  });

  it('returns undefined for invalid id', () => {
    const model = getModelBySlug('hechizo')!;
    expect(getVarianteById(model, 'fake-id')).toBeUndefined();
  });
});
