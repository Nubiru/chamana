import type { CartItem } from '@/lib/stores/cart-store';

const CINTIA_WHATSAPP = '542215475727';

export function generateWhatsAppUrl(items: CartItem[]): string {
  const lines = items.map((item) => {
    const telaInfo = item.tela2Desc ? `${item.tela1Desc} / ${item.tela2Desc}` : item.tela1Desc;
    return `  - ${item.modelNombre} (${item.modelTipo}) - ${telaInfo}`;
  });

  const message = [
    'Hola Cintia! Me interesan estas prendas de CHAMANA:',
    '',
    ...lines,
    '',
    'Me gustaría consultar disponibilidad y precios!',
  ].join('\n');

  return `https://wa.me/${CINTIA_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function generateSingleProductUrl(
  modelNombre: string,
  modelTipo: string,
  tela1Desc: string,
  tela2Desc?: string
): string {
  const telaInfo = tela2Desc ? `${tela1Desc} / ${tela2Desc}` : tela1Desc;
  const message = `Hola Cintia! Me interesa la prenda ${modelNombre} (${modelTipo}) en ${telaInfo}. Me gustaría consultar disponibilidad y precio!`;

  return `https://wa.me/${CINTIA_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function generateGeneralWhatsAppUrl(): string {
  const message = 'Hola Cintia! Quiero consultar sobre la Colección Magia de CHAMANA!';
  return `https://wa.me/${CINTIA_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
