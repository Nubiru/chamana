import { TELAS, type Tela } from './fabrics';

export interface Variante {
  id: string;
  tela1: Tela;
  tela2?: Tela;
}

export interface ChamanaModel {
  slug: string;
  nombre: string;
  tipo: string;
  detalle?: string;
  descripcion: string;
  variantes: Variante[];
}

function v(id: string, tela1Key: string, tela2Key?: string): Variante {
  return {
    id,
    tela1: TELAS[tela1Key],
    ...(tela2Key ? { tela2: TELAS[tela2Key] } : {}),
  };
}

export const MODELOS: ChamanaModel[] = [
  {
    slug: 'hechizo',
    nombre: 'Hechizo',
    tipo: 'Falda',
    detalle: 'Oriental',
    descripcion:
      'Falda oriental que fluye con cada paso, inspirada en el movimiento del aire. Su corte envolvente abraza la silueta con gracia y libertad.',
    variantes: [
      v('hechizo-linmenchoc', 'LinMenChoc'),
      v('hechizo-linmenneg', 'LinMenNeg'),
      v('hechizo-linmennat', 'LinMenNat'),
      v('hechizo-tusneg', 'TusNeg'),
      v('hechizo-tuschoc', 'TusChoc'),
    ],
  },
  {
    slug: 'sagrada',
    nombre: 'Sagrada',
    tipo: 'Falda',
    detalle: 'Bolsillos',
    descripcion:
      'Falda con bolsillos funcionales y silueta orgánica. Cada prenda es una invitación a caminar descalza sobre la tierra, conectada con la naturaleza.',
    variantes: [
      v('sagrada-linmenchoc', 'LinMenChoc'),
      v('sagrada-linmenneg', 'LinMenNeg'),
      v('sagrada-gabneg', 'GabNeg'),
      v('sagrada-gabchoc', 'GabChoc'),
      v('sagrada-gabmil', 'GabMil'),
    ],
  },
  {
    slug: 'espejo',
    nombre: 'Espejo',
    tipo: 'Top',
    detalle: 'Reversible',
    descripcion:
      'Top reversible que refleja la dualidad de la naturaleza. Dos caras, dos esencias, una sola prenda que se adapta a tu estado de ánimo.',
    variantes: [
      v('espejo-ribneg-tejneg', 'RibNeg', 'TejNeg'),
      v('espejo-ribchoc-tejchoc', 'RibChoc', 'TejChoc'),
      v('espejo-ribmil-tejmil', 'RibMil', 'TejMil'),
      v('espejo-ribnat-tejnat', 'RibNat', 'TejNat'),
    ],
  },
  {
    slug: 'reflejo',
    nombre: 'Reflejo',
    tipo: 'Musculosa',
    detalle: 'Reversible',
    descripcion:
      'Musculosa reversible que te ofrece dos looks en una sola prenda. Como el reflejo del agua, cada lado revela una nueva perspectiva.',
    variantes: [
      v('reflejo-ribneg-tejneg', 'RibNeg', 'TejNeg'),
      v('reflejo-ribchoc-tejchoc', 'RibChoc', 'TejChoc'),
      v('reflejo-ribmil-tejmil', 'RibMil', 'TejMil'),
      v('reflejo-ribblanq-tejnat', 'RibBlanq', 'TejNat'),
    ],
  },
  {
    slug: 'ritual',
    nombre: 'Ritual',
    tipo: 'Vestido',
    descripcion:
      'Vestido fluido que acompaña cada ritual cotidiano. Su caída natural envuelve el cuerpo como el agua rodea las piedras de un río.',
    variantes: [
      v('ritual-linmenchoc', 'LinMenChoc'),
      v('ritual-linmenneg', 'LinMenNeg'),
      v('ritual-linmennat', 'LinMenNat'),
      v('ritual-fibneg', 'FibNeg'),
      v('ritual-fibchoc', 'FibChoc'),
    ],
  },
  {
    slug: 'mistica',
    nombre: 'Mística',
    tipo: 'Kimono',
    descripcion:
      'Kimono de corte amplio que evoca la mística del fuego ceremonial. Una pieza envolvente para protegerte del frío con calidez artesanal.',
    variantes: [
      v('mistica-linruschoc', 'LinRusChoc'),
      v('mistica-linrusnat', 'LinRusNat'),
      v('mistica-tejneg', 'TejNeg'),
      v('mistica-tejchoc', 'TejChoc'),
    ],
  },
  {
    slug: 'aurora',
    nombre: 'Aurora',
    tipo: 'Remeron',
    descripcion:
      'Remerón amplio y cómodo como las primeras luces del amanecer. Perfecto para esos días donde la comodidad y el estilo se encuentran.',
    variantes: [
      v('aurora-linmenchoc', 'LinMenChoc'),
      v('aurora-linmenneg', 'LinMenNeg'),
      v('aurora-linmenblanq', 'LinMenBlanq'),
      v('aurora-fibneg', 'FibNeg'),
    ],
  },
  {
    slug: 'brisa',
    nombre: 'Brisa',
    tipo: 'Camisa',
    descripcion:
      'Camisa liviana como la brisa marina. Su corte holgado permite que el aire circule libremente, como la naturaleza lo dispone.',
    variantes: [
      v('brisa-linmenchoc', 'LinMenChoc'),
      v('brisa-linmennat', 'LinMenNat'),
      v('brisa-linmenblanq', 'LinMenBlanq'),
      v('brisa-brodnat', 'BrodNat'),
      v('brisa-brodblanq', 'BrodBlanq'),
    ],
  },
  {
    slug: 'mantra',
    nombre: 'Mantra',
    tipo: 'Palazzo',
    descripcion:
      'Palazzo de pierna ancha que fluye al caminar como un mantra repetido al viento. Su amplitud celebra la libertad de movimiento.',
    variantes: [
      v('mantra-linmenchoc', 'LinMenChoc'),
      v('mantra-linmenneg', 'LinMenNeg'),
      v('mantra-fibneg', 'FibNeg'),
      v('mantra-fibmil', 'FibMil'),
    ],
  },
  {
    slug: 'tierra',
    nombre: 'Tierra',
    tipo: 'Bermuda',
    descripcion:
      'Bermuda de corte relajado, enraizada en la comodidad y la conexión con la tierra. Para los días de explorar senderos y mercados.',
    variantes: [
      v('tierra-linmenchoc', 'LinMenChoc'),
      v('tierra-linmenneg', 'LinMenNeg'),
      v('tierra-gabneg', 'GabNeg'),
      v('tierra-gabmil', 'GabMil'),
    ],
  },
  {
    slug: 'luna',
    nombre: 'Luna',
    tipo: 'Short',
    descripcion:
      'Short cómodo y versátil como las noches de luna llena. Su corte simple y funcional es ideal para el verano y los días cálidos.',
    variantes: [
      v('luna-linmenchoc', 'LinMenChoc'),
      v('luna-linmennat', 'LinMenNat'),
      v('luna-gabneg', 'GabNeg'),
      v('luna-gabchoc', 'GabChoc'),
    ],
  },
  {
    slug: 'raiz',
    nombre: 'Raíz',
    tipo: 'Musculosa',
    descripcion:
      'Musculosa esencial, la raíz de cualquier outfit. Simple, cómoda y perfecta para combinar con cualquier prenda de la colección.',
    variantes: [
      v('raiz-ribneg', 'RibNeg'),
      v('raiz-ribchoc', 'RibChoc'),
      v('raiz-ribnat', 'RibNat'),
      v('raiz-ribmil', 'RibMil'),
      v('raiz-ribblanq', 'RibBlanq'),
    ],
  },
  {
    slug: 'fuego',
    nombre: 'Fuego',
    tipo: 'Top',
    detalle: 'Strapless',
    descripcion:
      'Top strapless que enciende la confianza con su diseño audaz y femenino. Como el fuego, transforma y renueva cada look.',
    variantes: [
      v('fuego-ribneg', 'RibNeg'),
      v('fuego-ribchoc', 'RibChoc'),
      v('fuego-ribnat', 'RibNat'),
      v('fuego-crocnat', 'CrocNat'),
      v('fuego-crocchoc', 'CrocChoc'),
    ],
  },
  {
    slug: 'alma',
    nombre: 'Alma',
    tipo: 'Vestido',
    detalle: 'Largo',
    descripcion:
      'Vestido largo que acaricia el suelo con cada paso. Una pieza que viste el alma con la misma delicadeza con la que la naturaleza viste la tierra.',
    variantes: [
      v('alma-linmenchoc', 'LinMenChoc'),
      v('alma-linmenneg', 'LinMenNeg'),
      v('alma-linmennat', 'LinMenNat'),
      v('alma-fibneg', 'FibNeg'),
      v('alma-fibnat', 'FibNat'),
    ],
  },
];

export function getModelBySlug(slug: string): ChamanaModel | undefined {
  return MODELOS.find((m) => m.slug === slug);
}

export function getVarianteById(model: ChamanaModel, varianteId: string): Variante | undefined {
  return model.variantes.find((v) => v.id === varianteId);
}

export function getModelsByTipo(tipo: string): ChamanaModel[] {
  return MODELOS.filter((m) => m.tipo.toLowerCase() === tipo.toLowerCase());
}
