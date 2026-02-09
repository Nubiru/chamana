export interface Tela {
  codigo: string;
  tipo: string;
  subtipo?: string;
  color: string;
  colorHex: string;
}

export const TELAS: Record<string, Tela> = {
  // Lino
  LinMenChoc: {
    codigo: 'LinMenChoc',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Chocolate',
    colorHex: '#5C3A21',
  },
  LinMenNeg: {
    codigo: 'LinMenNeg',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Negro',
    colorHex: '#1A1A1A',
  },
  LinMenNat: {
    codigo: 'LinMenNat',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Natural',
    colorHex: '#E8DCC8',
  },
  LinMenBlanq: {
    codigo: 'LinMenBlanq',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Blanqueado',
    colorHex: '#F5F0E8',
  },
  LinRusNat: {
    codigo: 'LinRusNat',
    tipo: 'Lino',
    subtipo: 'Rústico',
    color: 'Natural',
    colorHex: '#D4C4A8',
  },
  LinRusChoc: {
    codigo: 'LinRusChoc',
    tipo: 'Lino',
    subtipo: 'Rústico',
    color: 'Chocolate',
    colorHex: '#6B4226',
  },

  // Tejido
  TejNeg: { codigo: 'TejNeg', tipo: 'Tejido', color: 'Negro', colorHex: '#1A1A1A' },
  TejChoc: { codigo: 'TejChoc', tipo: 'Tejido', color: 'Chocolate', colorHex: '#5C3A21' },
  TejNat: { codigo: 'TejNat', tipo: 'Tejido', color: 'Natural', colorHex: '#E0D5C1' },
  TejMil: { codigo: 'TejMil', tipo: 'Tejido', color: 'Militar', colorHex: '#4B5320' },

  // Rib
  RibNeg: { codigo: 'RibNeg', tipo: 'Rib', color: 'Negro', colorHex: '#1A1A1A' },
  RibChoc: { codigo: 'RibChoc', tipo: 'Rib', color: 'Chocolate', colorHex: '#5C3A21' },
  RibNat: { codigo: 'RibNat', tipo: 'Rib', color: 'Natural', colorHex: '#E8DCC8' },
  RibMil: { codigo: 'RibMil', tipo: 'Rib', color: 'Militar', colorHex: '#4B5320' },
  RibBlanq: { codigo: 'RibBlanq', tipo: 'Rib', color: 'Blanqueado', colorHex: '#F5F0E8' },

  // Gabardina
  GabNeg: { codigo: 'GabNeg', tipo: 'Gabardina', color: 'Negro', colorHex: '#1A1A1A' },
  GabChoc: { codigo: 'GabChoc', tipo: 'Gabardina', color: 'Chocolate', colorHex: '#5C3A21' },
  GabMil: { codigo: 'GabMil', tipo: 'Gabardina', color: 'Militar', colorHex: '#4B5320' },

  // Tusor
  TusNeg: { codigo: 'TusNeg', tipo: 'Tusor', color: 'Negro', colorHex: '#1A1A1A' },
  TusChoc: { codigo: 'TusChoc', tipo: 'Tusor', color: 'Chocolate', colorHex: '#5C3A21' },
  TusNat: { codigo: 'TusNat', tipo: 'Tusor', color: 'Natural', colorHex: '#E0D5C1' },
  TusMil: { codigo: 'TusMil', tipo: 'Tusor', color: 'Militar', colorHex: '#4B5320' },

  // Fibrana
  FibNeg: { codigo: 'FibNeg', tipo: 'Fibrana', color: 'Negro', colorHex: '#1A1A1A' },
  FibChoc: { codigo: 'FibChoc', tipo: 'Fibrana', color: 'Chocolate', colorHex: '#5C3A21' },
  FibNat: { codigo: 'FibNat', tipo: 'Fibrana', color: 'Natural', colorHex: '#E0D5C1' },
  FibMil: { codigo: 'FibMil', tipo: 'Fibrana', color: 'Militar', colorHex: '#4B5320' },

  // Broderie
  BrodNat: { codigo: 'BrodNat', tipo: 'Broderie', color: 'Natural', colorHex: '#E8DCC8' },
  BrodBlanq: { codigo: 'BrodBlanq', tipo: 'Broderie', color: 'Blanqueado', colorHex: '#F5F0E8' },

  // Crochet
  CrocNat: { codigo: 'CrocNat', tipo: 'Crochet', color: 'Natural', colorHex: '#E0D5C1' },
  CrocChoc: { codigo: 'CrocChoc', tipo: 'Crochet', color: 'Chocolate', colorHex: '#5C3A21' },
};

export function telaDescripcion(tela: Tela): string {
  return [tela.tipo, tela.subtipo, tela.color].filter(Boolean).join(' ');
}

export const TIPOS_TELA = [...new Set(Object.values(TELAS).map((t) => t.tipo))];
