import type { ChamanaModel, Tela, Variante } from '@/lib/domain/catalog/types';
import type { LeadState } from '@/lib/domain/engagement/types';
import type { CartItem } from '@/lib/domain/sales/types';

export function buildTela(overrides?: Partial<Tela>): Tela {
  return {
    codigo: 'LinMenChoc',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Chocolate',
    colorHex: '#8B4513',
    ...overrides,
  };
}

export function buildVariante(overrides?: Partial<Variante>): Variante {
  return {
    id: 'test-var-1',
    tela1: buildTela(),
    ...overrides,
  };
}

export function buildModel(overrides?: Partial<ChamanaModel>): ChamanaModel {
  return {
    slug: 'test-model',
    nombre: 'Test',
    tipo: 'Falda',
    descripcion: 'Test model',
    variantes: [buildVariante()],
    ...overrides,
  };
}

export function buildCartItem(overrides?: Partial<CartItem>): CartItem {
  return {
    modelSlug: 'hechizo',
    modelNombre: 'Hechizo',
    modelTipo: 'Falda',
    varianteId: 'hechizo-linmenchoc',
    tela1Desc: 'Lino Men Chocolate',
    quantity: 1,
    ...overrides,
  };
}

export function buildLeadState(overrides?: Partial<LeadState>): LeadState {
  return {
    email: null,
    subscribedAt: null,
    dismissed: false,
    dismissedAt: null,
    ...overrides,
  };
}
