export interface FAQ {
  id: string;
  pregunta: string;
  respuesta: string;
  categorias?: string[];
  global?: boolean;
}

export interface Guarantee {
  id: string;
  nombre: string;
  titulo: string;
  descripcion: string;
  detalle: string;
  iconName: string;
}

export interface SizeGuideEntry {
  tipo: string;
  talleUnico: boolean;
  medidas: { label: string; valor: string }[];
  notas?: string;
}

export interface DesfileImage {
  id: number;
  src: string;
  alt: string;
}

export interface DesfileEvent {
  slug: string;
  title: string;
  displayDate: string;
  location: string;
  description: string;
  images: DesfileImage[];
}
