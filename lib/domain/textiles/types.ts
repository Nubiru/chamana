export type TelaEstado = 'disponible' | 'por_agotarse' | 'agotada' | 'pedida' | 'discontinuada';

export const ESTADO_LABELS: Record<TelaEstado, string> = {
  disponible: 'Disponible',
  por_agotarse: 'Por agotarse',
  agotada: 'Agotada',
  pedida: 'Pedida',
  discontinuada: 'Descontinuada',
};
