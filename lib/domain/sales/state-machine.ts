import type { VentaEstado } from './types';

export const VALID_TRANSITIONS: Record<VentaEstado, VentaEstado[]> = {
  pendiente: ['pagada', 'cancelada'],
  pagada: ['enviada', 'cancelada'],
  enviada: ['entregada'],
  entregada: [],
  cancelada: [],
};

export function validateTransition(from: VentaEstado, to: VentaEstado): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function getAvailableTransitions(state: VentaEstado): VentaEstado[] {
  return VALID_TRANSITIONS[state];
}

export function isTerminal(state: VentaEstado): boolean {
  return VALID_TRANSITIONS[state].length === 0;
}
