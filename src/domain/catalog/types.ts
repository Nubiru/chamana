export interface Tela {
  codigo: string;
  tipo: string;
  subtipo?: string;
  color: string;
  colorHex: string;
}

export interface Variante {
  id: string;
  tela1: Tela;
  tela2?: Tela;
  precio?: number;
  precioAnterior?: number;
  descuento?: number;
  sinStock?: boolean;
}

export interface ChamanaModel {
  slug: string;
  nombre: string;
  tipo: string;
  detalle?: string;
  descripcion: string;
  variantes: Variante[];
  imagenes?: string[];
  badge?: string;
  featured?: boolean;
  bundleId?: string;
}

export interface Category {
  slug: string;
  nombre: string;
  count: number;
}

export interface CollectionMeta {
  slug: string;
  nombre: string;
  nombreCompleto: string;
  temporada: 'primavera-verano' | 'otono-invierno';
  anio: number;
  estado: 'planificacion' | 'produccion' | 'activa' | 'archivo';
  descripcion: string;
  ejes: string[];
}
