export type ModeloEstado = 'nueva' | 'en_produccion' | 'en_stock' | 'sin_stock' | 'descontinuada';

/**
 * Spanish labels for the Modelo lifecycle states.
 *
 * Labels match the unaccented Spanish convention used by collections/Modelos.ts
 * (G-16 ship). Daniela sees these strings verbatim both in the admin select
 * dropdown and in transition-error messages thrown by the state-machine hook.
 */
export const ESTADO_LABELS: Record<ModeloEstado, string> = {
  nueva: 'Nueva',
  en_produccion: 'En produccion',
  en_stock: 'En stock',
  sin_stock: 'Sin stock',
  descontinuada: 'Descontinuada',
};
