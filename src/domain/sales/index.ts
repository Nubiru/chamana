export type { VentaEstado, CartItem } from './types';
export {
  VALID_TRANSITIONS,
  validateTransition,
  getAvailableTransitions,
  isTerminal,
} from './state-machine';
export { computeCartTotal, computeItemCount } from './cart';
