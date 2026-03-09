export type VentaEstado = 'pendiente' | 'pagada' | 'enviada' | 'entregada' | 'cancelada';

export interface CartItem {
  modelSlug: string;
  modelNombre: string;
  modelTipo: string;
  varianteId: string;
  tela1Desc: string;
  tela2Desc?: string;
  precio?: number;
  modelImageUrl?: string;
  quantity: number;
}
