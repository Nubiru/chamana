export interface FAQ {
  id: string;
  pregunta: string;
  respuesta: string;
  categorias?: string[];
  global?: boolean;
}

export const FAQS: FAQ[] = [
  {
    id: 'talles',
    pregunta: 'Que talles manejan?',
    respuesta:
      'Nuestras prendas son talle unico, disenadas con cortes amplios y holgados que se adaptan a distintos cuerpos. Si tenes dudas sobre como te quedaria una prenda, escribinos por WhatsApp y te asesoramos.',
    global: true,
  },
  {
    id: 'telas',
    pregunta: 'Que telas utilizan?',
    respuesta:
      'Trabajamos con telas livianas, frescas y de calidad: lino, rib, gabardina, tussor y tejido de punto. Cada tela se elige pensando en la caida, la textura y la comodidad de cada modelo.',
    global: true,
  },
  {
    id: 'cuidado',
    pregunta: 'Como cuido mi prenda?',
    respuesta:
      'Recomendamos lavar a mano o en ciclo delicado con agua fria. No usar secadora. Secar a la sombra y planchar a temperatura baja. Siguiendo estos cuidados, tu prenda va a durar mucho tiempo.',
    global: true,
  },
  {
    id: 'envio',
    pregunta: 'Hacen envios?',
    respuesta:
      'Si, hacemos envios a todo el pais por correo. El costo del envio depende de tu ubicacion. Para Capilla del Monte y alrededores, ofrecemos entrega en mano sin cargo. Consultanos por WhatsApp para mas detalles.',
    global: true,
  },
  {
    id: 'cambios',
    pregunta: 'Puedo cambiar o devolver una prenda?',
    respuesta:
      'Si, tenes 7 dias para cambios y 30 dias para devoluciones completas. La prenda debe estar sin uso, con etiquetas y en su empaque original. Escribinos por WhatsApp para coordinar.',
    global: true,
  },
  {
    id: 'precio',
    pregunta: 'Por que las prendas tienen este precio?',
    respuesta:
      'Cada prenda esta hecha a mano, una por una, con telas de calidad seleccionadas cuidadosamente. No es produccion en serie: es trabajo artesanal con atencion al detalle, confeccionado en las sierras de Cordoba. Estas pagando por una pieza unica, hecha con amor y oficio.',
    global: true,
  },
  {
    id: 'medios-de-pago',
    pregunta: 'Que medios de pago aceptan?',
    respuesta:
      'Aceptamos Mercado Pago (tarjetas de credito y debito), transferencia bancaria y efectivo. Si necesitas pagar en cuotas, consultanos por WhatsApp.',
    global: true,
  },
  {
    id: 'reversible',
    pregunta: 'Como funciona una prenda reversible?',
    respuesta:
      'Nuestros tops reversibles tienen dos caras terminadas, cada una con una tela y color diferente. Simplemente das vuelta la prenda y tenes un look completamente nuevo. Dos prendas en una.',
    categorias: ['Top'],
  },
];

export function getFAQsForProduct(tipo: string): FAQ[] {
  return FAQS.filter(
    (faq) =>
      faq.global ||
      (faq.categorias && faq.categorias.some((c) => c.toLowerCase() === tipo.toLowerCase()))
  );
}
