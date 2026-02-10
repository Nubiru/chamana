export interface Tela {
  codigo: string;
  tipo: string;
  subtipo?: string;
  color: string;
  colorHex: string;
}

export const TELAS: Record<string, Tela> = {
  // ── Lino Spandex ──
  LinSpanBei: {
    codigo: 'LinSpanBei',
    tipo: 'Lino',
    subtipo: 'Spandex',
    color: 'Beige',
    colorHex: '#D4B896',
  },
  LinSpanCho: {
    codigo: 'LinSpanCho',
    tipo: 'Lino',
    subtipo: 'Spandex',
    color: 'Chocolate',
    colorHex: '#5C3A21',
  },

  // ── Lino Men ──
  LinMenGris: {
    codigo: 'LinMenGris',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Gris',
    colorHex: '#8E8E8E',
  },
  LinMenMili: {
    codigo: 'LinMenMili',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Verde Militar',
    colorHex: '#4B5320',
  },
  LinMenChoc: {
    codigo: 'LinMenChoc',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Chocolate',
    colorHex: '#5C3A21',
  },
  LinMenVerde: {
    codigo: 'LinMenVerde',
    tipo: 'Lino',
    subtipo: 'Men',
    color: 'Verde',
    colorHex: '#3D7A3D',
  },

  // ── Lino Marruecos ──
  LinMarNeg: {
    codigo: 'LinMarNeg',
    tipo: 'Lino',
    subtipo: 'Marruecos',
    color: 'Negro',
    colorHex: '#1A1A1A',
  },
  LinMarCasc: {
    codigo: 'LinMarCasc',
    tipo: 'Lino',
    subtipo: 'Marruecos',
    color: 'Cascarilla',
    colorHex: '#C4A882',
  },
  LinMarCho: {
    codigo: 'LinMarCho',
    tipo: 'Lino',
    subtipo: 'Marruecos',
    color: 'Chocolate',
    colorHex: '#5C3A21',
  },
  LinMarMalv: {
    codigo: 'LinMarMalv',
    tipo: 'Lino',
    subtipo: 'Marruecos',
    color: 'Verde Malva',
    colorHex: '#8B6F8B',
  },

  // ── Lino R. Atenas ──
  LinAtenNeg: {
    codigo: 'LinAtenNeg',
    tipo: 'Lino',
    subtipo: 'R. Atenas',
    color: 'Negro',
    colorHex: '#1A1A1A',
  },

  // ── Tejido Formentera ──
  TejNegro: {
    codigo: 'TejNegro',
    tipo: 'Tejido',
    subtipo: 'Formentera',
    color: 'Negro',
    colorHex: '#1A1A1A',
  },
  TejBeige: {
    codigo: 'TejBeige',
    tipo: 'Tejido',
    subtipo: 'Formentera',
    color: 'Beige',
    colorHex: '#D4B896',
  },
  TejMalva: {
    codigo: 'TejMalva',
    tipo: 'Tejido',
    subtipo: 'Formentera',
    color: 'Verde Malva',
    colorHex: '#8B6F8B',
  },

  // ── Ribb New York ──
  RibNegro: {
    codigo: 'RibNegro',
    tipo: 'Ribb',
    subtipo: 'New York',
    color: 'Negro',
    colorHex: '#1A1A1A',
  },
  RibMilitar: {
    codigo: 'RibMilitar',
    tipo: 'Ribb',
    subtipo: 'New York',
    color: 'Verde Militar',
    colorHex: '#4B5320',
  },
  RibMarino: {
    codigo: 'RibMarino',
    tipo: 'Ribb',
    subtipo: 'New York',
    color: 'Marino',
    colorHex: '#1B3A5C',
  },

  // ── Gabardina Algodon ──
  GabMilitar: {
    codigo: 'GabMilitar',
    tipo: 'Gabardina',
    subtipo: 'Algodon',
    color: 'Verde Militar',
    colorHex: '#4B5320',
  },
  GabAereo: {
    codigo: 'GabAereo',
    tipo: 'Gabardina',
    subtipo: 'Algodon',
    color: 'Verde Aereo',
    colorHex: '#6B8E6B',
  },
  GabNeg: {
    codigo: 'GabNeg',
    tipo: 'Gabardina',
    subtipo: 'Algodon',
    color: 'Negro',
    colorHex: '#1A1A1A',
  },
  GabAzul: {
    codigo: 'GabAzul',
    tipo: 'Gabardina',
    subtipo: 'Algodon',
    color: 'Azul',
    colorHex: '#2E5090',
  },
  GabVerde: {
    codigo: 'GabVerde',
    tipo: 'Gabardina',
    subtipo: 'Algodon',
    color: 'Verde',
    colorHex: '#3D7A3D',
  },

  // ── Tusor ──
  TusNegro: { codigo: 'TusNegro', tipo: 'Tusor', color: 'Negro', colorHex: '#1A1A1A' },
  TusMarino: { codigo: 'TusMarino', tipo: 'Tusor', color: 'Marino', colorHex: '#1B3A5C' },
  TusMaiz: { codigo: 'TusMaiz', tipo: 'Tusor', color: 'Maiz', colorHex: '#E8C840' },
  TusTierra: { codigo: 'TusTierra', tipo: 'Tusor', color: 'Tierra', colorHex: '#8B6914' },
  TusGris: { codigo: 'TusGris', tipo: 'Tusor', color: 'Gris', colorHex: '#8E8E8E' },
  TusAzul: { codigo: 'TusAzul', tipo: 'Tusor', color: 'Azul', colorHex: '#2E5090' },

  // ── Fibrana ──
  FibAgua: { codigo: 'FibAgua', tipo: 'Fibrana', color: 'Verde Agua', colorHex: '#7BC8A4' },
  FibCeleste: { codigo: 'FibCeleste', tipo: 'Fibrana', color: 'Celeste', colorHex: '#87CEEB' },
};

export function telaDescripcion(tela: Tela): string {
  return [tela.tipo, tela.subtipo, tela.color].filter(Boolean).join(' ');
}

export const TIPOS_TELA = [...new Set(Object.values(TELAS).map((t) => t.tipo))];
