import { isProximamente, isReversible, telaDescripcion } from '@/lib/domain/catalog/rules';
import type { ChamanaModel, Tela, Variante } from '@/lib/domain/catalog/types';

// --- Inline factories ---

function makeTela(overrides: Partial<Tela> = {}): Tela {
  return {
    codigo: 'T01',
    tipo: 'Lino',
    color: 'Negro',
    colorHex: '#000000',
    ...overrides,
  };
}

function makeVariante(overrides: Partial<Variante> = {}): Variante {
  return {
    id: 'v-1',
    tela1: makeTela(),
    ...overrides,
  };
}

function makeModel(overrides: Partial<ChamanaModel> = {}): ChamanaModel {
  return {
    slug: 'test-model',
    nombre: 'Test',
    tipo: 'vestido',
    descripcion: 'Un modelo de prueba',
    variantes: [],
    ...overrides,
  };
}

// --- Tests ---

describe('isProximamente', () => {
  it('returns true when model has empty variantes array', () => {
    const model = makeModel({ variantes: [] });
    expect(isProximamente(model)).toBe(true);
  });

  it('returns false when model has at least one variante', () => {
    const model = makeModel({
      variantes: [makeVariante()],
    });
    expect(isProximamente(model)).toBe(false);
  });

  it('returns false when model has multiple variantes', () => {
    const model = makeModel({
      variantes: [
        makeVariante({ id: 'v-1' }),
        makeVariante({ id: 'v-2' }),
        makeVariante({ id: 'v-3' }),
      ],
    });
    expect(isProximamente(model)).toBe(false);
  });
});

describe('isReversible', () => {
  it('returns true when variante has tela2', () => {
    const variante = makeVariante({
      tela2: makeTela({ codigo: 'T02', tipo: 'Tusor', color: 'Blanco', colorHex: '#FFFFFF' }),
    });
    expect(isReversible(variante)).toBe(true);
  });

  it('returns false when variante has no tela2 (undefined)', () => {
    const variante = makeVariante({ tela2: undefined });
    expect(isReversible(variante)).toBe(false);
  });

  it('returns false when variante omits tela2 entirely', () => {
    const variante = makeVariante();
    expect(isReversible(variante)).toBe(false);
  });
});

describe('telaDescripcion', () => {
  it('joins tipo, subtipo, and color with spaces', () => {
    const tela = makeTela({ tipo: 'Lino', subtipo: 'Men', color: 'Chocolate' });
    expect(telaDescripcion(tela)).toBe('Lino Men Chocolate');
  });

  it('omits subtipo when undefined', () => {
    const tela = makeTela({ tipo: 'Tusor', subtipo: undefined, color: 'Negro' });
    expect(telaDescripcion(tela)).toBe('Tusor Negro');
  });

  it('omits subtipo when empty string (falsy)', () => {
    const tela = makeTela({ tipo: 'Ribb', subtipo: '', color: 'Crudo' });
    expect(telaDescripcion(tela)).toBe('Ribb Crudo');
  });

  it('handles all fields populated', () => {
    const tela = makeTela({ tipo: 'Tejido', subtipo: 'Artesanal', color: 'Natural' });
    expect(telaDescripcion(tela)).toBe('Tejido Artesanal Natural');
  });
});
