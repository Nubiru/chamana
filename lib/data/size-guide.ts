export interface SizeGuideEntry {
  tipo: string;
  talleUnico: boolean;
  medidas: { label: string; valor: string }[];
  notas?: string;
}

export const SIZE_GUIDE: SizeGuideEntry[] = [
  {
    tipo: 'Falda',
    talleUnico: true,
    medidas: [
      { label: 'Cintura (elastizada)', valor: '64 - 100 cm' },
      { label: 'Cadera', valor: 'Amplia' },
      { label: 'Largo', valor: '75 cm aprox.' },
    ],
    notas: 'Cintura elastizada que se adapta a distintos cuerpos.',
  },
  {
    tipo: 'Vestido',
    talleUnico: true,
    medidas: [
      { label: 'Busto', valor: '90 - 110 cm' },
      { label: 'Cadera', valor: 'Amplia' },
      { label: 'Largo total', valor: '120 cm aprox.' },
    ],
  },
  {
    tipo: 'Kimono',
    talleUnico: true,
    medidas: [
      { label: 'Ancho espalda', valor: 'Amplio, oversize' },
      { label: 'Largo manga', valor: '55 cm aprox.' },
      { label: 'Largo total', valor: '80 cm aprox.' },
    ],
    notas: 'Corte oversize, pensado para usar suelto y envolvente.',
  },
  {
    tipo: 'Remeron',
    talleUnico: true,
    medidas: [
      { label: 'Busto', valor: '100 - 120 cm' },
      { label: 'Largo total', valor: '75 cm aprox.' },
    ],
    notas: 'Corte amplio oriental, cae suelto desde los hombros.',
  },
  {
    tipo: 'Musculosa',
    talleUnico: true,
    medidas: [
      { label: 'Busto', valor: '85 - 100 cm' },
      { label: 'Largo total', valor: '60 cm aprox.' },
    ],
  },
  {
    tipo: 'Top',
    talleUnico: true,
    medidas: [
      { label: 'Busto', valor: '85 - 100 cm' },
      { label: 'Largo total', valor: '50 cm aprox.' },
    ],
    notas: 'Los modelos reversibles tienen la misma medida en ambas caras.',
  },
  {
    tipo: 'Camisa',
    talleUnico: true,
    medidas: [
      { label: 'Busto', valor: '95 - 115 cm' },
      { label: 'Largo manga', valor: '58 cm aprox.' },
      { label: 'Largo total', valor: '70 cm aprox.' },
    ],
    notas: 'Corte holgado y liviano.',
  },
  {
    tipo: 'Bermuda',
    talleUnico: true,
    medidas: [
      { label: 'Cintura (elastizada)', valor: '64 - 100 cm' },
      { label: 'Cadera', valor: 'Amplia' },
      { label: 'Largo', valor: '55 cm aprox.' },
    ],
  },
  {
    tipo: 'Short',
    talleUnico: true,
    medidas: [
      { label: 'Cintura (elastizada)', valor: '64 - 100 cm' },
      { label: 'Cadera', valor: 'Amplia' },
      { label: 'Largo', valor: '35 cm aprox.' },
    ],
  },
  {
    tipo: 'Palazzo',
    talleUnico: true,
    medidas: [
      { label: 'Cintura (elastizada)', valor: '64 - 100 cm' },
      { label: 'Cadera', valor: 'Amplia' },
      { label: 'Largo', valor: '100 cm aprox.' },
    ],
    notas: 'Corte amplio de pierna ancha. El modelo Capri tiene largo intermedio.',
  },
];

export function getSizeGuide(tipo: string): SizeGuideEntry | undefined {
  return SIZE_GUIDE.find((s) => s.tipo.toLowerCase() === tipo.toLowerCase());
}
