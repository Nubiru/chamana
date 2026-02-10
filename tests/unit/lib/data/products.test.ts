import {
  MODELOS,
  getAllProductImages,
  getModelBySlug,
  getModelsByTipo,
  getVarianteById,
} from '@/lib/data/products';

describe('products data', () => {
  it('has exactly 14 models', () => {
    expect(MODELOS).toHaveLength(14);
  });

  it('every model has a unique slug', () => {
    const slugs = MODELOS.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('models with variantes have unique ids within each model', () => {
    for (const model of MODELOS) {
      if (model.variantes.length === 0) continue;
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

  it('proximamente models have empty variantes', () => {
    const sagrada = getModelBySlug('sagrada');
    const corazonada = getModelBySlug('corazonada');
    const luzYSombra = getModelBySlug('luz-y-sombra');
    expect(sagrada?.variantes).toHaveLength(0);
    expect(corazonada?.variantes).toHaveLength(0);
    expect(luzYSombra?.variantes).toHaveLength(0);
  });
});

describe('getModelBySlug', () => {
  it('returns model for valid slug', () => {
    const model = getModelBySlug('hechizo');
    expect(model).toBeDefined();
    expect(model?.nombre).toBe('Hechizo');
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

describe('getAllProductImages', () => {
  it('returns array of { src, model } objects', () => {
    const images = getAllProductImages();
    for (const entry of images) {
      expect(entry).toHaveProperty('src');
      expect(entry).toHaveProperty('model');
    }
  });

  it('all src values are strings starting with /images/models/', () => {
    const images = getAllProductImages();
    for (const { src } of images) {
      expect(typeof src).toBe('string');
      expect(src).toMatch(/^\/images\/models\//);
    }
  });

  it('all model references are valid ChamanaModel objects', () => {
    const images = getAllProductImages();
    for (const { model } of images) {
      expect(model.slug).toBeDefined();
      expect(model.nombre).toBeDefined();
      expect(model.tipo).toBeDefined();
    }
  });

  it('count matches total images across all models (24)', () => {
    const images = getAllProductImages();
    const expectedCount = MODELOS.reduce((sum, m) => sum + (m.imagenes?.length ?? 0), 0);
    expect(images).toHaveLength(expectedCount);
    expect(images).toHaveLength(24);
  });
});

describe('getVarianteById', () => {
  it('returns variante for valid id', () => {
    const model = getModelBySlug('hechizo');
    expect(model).toBeDefined();
    const variante = getVarianteById(model as NonNullable<typeof model>, 'hechizo-linmenchoc');
    expect(variante).toBeDefined();
    expect(variante?.tela1.color).toBe('Chocolate');
  });

  it('returns undefined for invalid id', () => {
    const model = getModelBySlug('hechizo');
    expect(model).toBeDefined();
    expect(getVarianteById(model as NonNullable<typeof model>, 'fake-id')).toBeUndefined();
  });
});
