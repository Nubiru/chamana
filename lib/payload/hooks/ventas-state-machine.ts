import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Valid state transitions for Ventas (ported from src/domains/order-management/entities/Order.ts)
 *
 * pendiente  → pagada | cancelada
 * pagada     → enviada | cancelada
 * enviada    → entregada
 * entregada  → (terminal)
 * cancelada  → (terminal)
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pendiente: ['pagada', 'cancelada'],
  pagada: ['enviada', 'cancelada'],
  enviada: ['entregada'],
  entregada: [],
  cancelada: [],
}

export const ventasStateMachine: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation === 'create') return data

  const oldStatus = originalDoc?.estado
  const newStatus = data.estado

  if (!oldStatus || !newStatus || oldStatus === newStatus) return data

  const allowed = VALID_TRANSITIONS[oldStatus] || []
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `No se puede cambiar el estado de "${oldStatus}" a "${newStatus}". ` +
        `Transiciones permitidas: ${allowed.length ? allowed.join(', ') : 'ninguna (estado final)'}`,
    )
  }

  // Auto-set fechaEnvio when transitioning to 'enviada'
  if (newStatus === 'enviada' && !data.fechaEnvio) {
    data.fechaEnvio = new Date().toISOString()
  }

  return data
}
