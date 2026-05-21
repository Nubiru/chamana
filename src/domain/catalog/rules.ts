import type { ChamanaModel, Tela, Variante } from './types';

export function isProximamente(model: ChamanaModel): boolean {
  return model.variantes.length === 0;
}

export function isReversible(variante: Variante): boolean {
  return variante.tela2 != null;
}

export function telaDescripcion(tela: Tela): string {
  return [tela.tipo, tela.subtipo, tela.color].filter(Boolean).join(' ');
}
