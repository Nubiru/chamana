export interface Guarantee {
  id: string;
  nombre: string;
  titulo: string;
  descripcion: string;
  detalle: string;
  iconName: 'Repeat' | 'ShieldCheck' | 'Scissors';
}

export const GARANTIAS: Guarantee[] = [
  {
    id: 'calce-sagrado',
    nombre: 'Calce Sagrado',
    titulo: 'Cambio en 7 dias',
    descripcion: 'Si no te queda como esperabas, lo cambiamos sin vueltas.',
    detalle:
      'Tenes 7 dias desde que recibis tu prenda para solicitar un cambio de talle o modelo. La prenda debe estar sin uso, con etiquetas y en su empaque original.',
    iconName: 'Repeat',
  },
  {
    id: 'satisfaccion-30-dias',
    nombre: 'Satisfaccion 30 dias',
    titulo: 'Devolucion completa',
    descripcion: 'Si no te enamoras de tu prenda, te devolvemos el 100%.',
    detalle:
      'Dentro de los 30 dias de recibida tu compra podes solicitar la devolucion completa. La prenda debe estar sin uso, con etiquetas y en su empaque original. El reintegro se realiza por el mismo medio de pago.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'costura-de-por-vida',
    nombre: 'Costura de por Vida',
    titulo: 'Reparacion permanente',
    descripcion: 'Si se descose, la reparamos gratis para siempre.',
    detalle:
      'Todas nuestras prendas tienen garantia de costura de por vida. Si alguna costura se abre o se deshace con el uso normal, la reparamos sin costo. Solo envianos la prenda y nos encargamos.',
    iconName: 'Scissors',
  },
];
