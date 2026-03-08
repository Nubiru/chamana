export interface Bundle {
  id: string;
  nombre: string;
  descripcion: string;
  modelSlugs: string[];
  descuento: number; // percentage
}

export interface CodigoDescuento {
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  usosMaximos?: number;
  usosActuales?: number;
}

export interface Referido {
  id: string;
  nombre: string;
  descripcion: string;
  recompensaReferente: { tipo: 'porcentaje' | 'fijo'; valor: number };
  recompensaReferido: { tipo: 'porcentaje' | 'fijo'; valor: number };
}

export const BUNDLES: Bundle[] = [];
export const CODIGOS_DESCUENTO: CodigoDescuento[] = [];
export const REFERIDOS: Referido[] = [];

export function getBundleById(id: string): Bundle | undefined {
  return BUNDLES.find((b) => b.id === id);
}

export function getCodigoDescuento(codigo: string): CodigoDescuento | undefined {
  return CODIGOS_DESCUENTO.find(
    (c) => c.codigo.toLowerCase() === codigo.toLowerCase()
  );
}
