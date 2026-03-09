import { getAvailableTransitions, validateTransition } from '@/lib/domain/sales/state-machine';
import type { VentaEstado } from '@/lib/domain/sales/types';
import type { CollectionBeforeChangeHook } from 'payload';

export const ventasStateMachine: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation === 'create') return data;

  const oldStatus = originalDoc?.estado as VentaEstado | undefined;
  const newStatus = data.estado as VentaEstado | undefined;

  if (!oldStatus || !newStatus || oldStatus === newStatus) return data;

  if (!validateTransition(oldStatus, newStatus)) {
    const allowed = getAvailableTransitions(oldStatus);
    throw new Error(
      `No se puede cambiar el estado de "${oldStatus}" a "${newStatus}". ` +
        `Transiciones permitidas: ${allowed.length ? allowed.join(', ') : 'ninguna (estado final)'}`
    );
  }

  // Auto-set fechaEnvio when transitioning to 'enviada'
  if (newStatus === 'enviada' && !data.fechaEnvio) {
    data.fechaEnvio = new Date().toISOString();
  }

  return data;
};
