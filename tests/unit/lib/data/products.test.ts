import {
  MODELOS,
  getAllProductImages,
  getModelBySlug,
  getModelMaxPrice,
  getModelMinPrice,
  getModelPriceDisplay,
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

  it('count matches total images across all models (45)', () => {
    const images = getAllProductImages();
    const expectedCount = MODELOS.reduce((sum, m) => sum + (m.imagenes?.length ?? 0), 0);
    expect(images).toHaveLength(expectedCount);
    expect(images).toHaveLength(45);
  });
});

describe('price helpers', () => {
  const modelWithPrices = {
    slug: 'test',
    nombre: 'Test',
    tipo: 'Top',
    descripcion: 'Test',
    variantes: [
      { id: 'a', tela1: { codigo: 'X', tipo: 'X', color: 'X', colorHex: '#000' }, precio: 20000 },
      { id: 'b', tela1: { codigo: 'Y', tipo: 'Y', color: 'Y', colorHex: '#000' }, precio: 30000 },
    ],
  };

  const modelNoPrices = {
    slug: 'test2',
    nombre: 'Test2',
    tipo: 'Top',
    descripcion: 'Test',
    variantes: [{ id: 'c', tela1: { codigo: 'Z', tipo: 'Z', color: 'Z', colorHex: '#000' } }],
  };

  const modelSamePrice = {
    slug: 'test3',
    nombre: 'Test3',
    tipo: 'Top',
    descripcion: 'Test',
    variantes: [
      { id: 'd', tela1: { codigo: 'W', tipo: 'W', color: 'W', colorHex: '#000' }, precio: 25000 },
      { id: 'e', tela1: { codigo: 'V', tipo: 'V', color: 'V', colorHex: '#000' }, precio: 25000 },
    ],
  };

  it('getModelMinPrice returns minimum price', () => {
    expect(getModelMinPrice(modelWithPrices)).toBe(20000);
  });

  it('getModelMaxPrice returns maximum price', () => {
    expect(getModelMaxPrice(modelWithPrices)).toBe(30000);
  });

  it('returns undefined when no prices set', () => {
    expect(getModelMinPrice(modelNoPrices)).toBeUndefined();
    expect(getModelMaxPrice(modelNoPrices)).toBeUndefined();
  });

  it('getModelPriceDisplay shows range for different prices', () => {
    expect(getModelPriceDisplay(modelWithPrices)).toBe('Desde $20.000');
  });

  it('getModelPriceDisplay shows single price when all same', () => {
    expect(getModelPriceDisplay(modelSamePrice)).toBe('$25.000');
  });

  it('getModelPriceDisplay shows "Consultar precio" when no prices', () => {
    expect(getModelPriceDisplay(modelNoPrices)).toBe('Consultar precio');
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
