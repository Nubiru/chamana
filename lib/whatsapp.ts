import type { CartItem } from '@/lib/stores/cart-store';
import { formatPrice } from '@/lib/utils';

const CINTIA_WHATSAPP = '542215475727';

export function generateWhatsAppUrl(items: CartItem[]): string {
  const allHavePrices = items.length > 0 && items.every((item) => item.precio != null);

  const lines = items.map((item) => {
    const telaInfo = item.tela2Desc ? `${item.tela1Desc} / ${item.tela2Desc}` : item.tela1Desc;
    const qtyStr = item.quantity > 1 ? ` x${item.quantity}` : '';
    const priceStr =
      item.precio != null
        ? ` - ${formatPrice(item.precio)}${item.quantity > 1 ? ` (${formatPrice(item.precio * item.quantity)})` : ''}`
        : '';
    return `  - ${item.modelNombre} (${item.modelTipo}) - ${telaInfo}${qtyStr}${priceStr}`;
  });

  const total = allHavePrices
    ? items.reduce((sum, item) => sum + (item.precio ?? 0) * item.quantity, 0)
    : null;

  const message = [
    'Hola Cintia! Me interesan estas prendas de CHAMANA:',
    '',
    ...lines,
    '',
    ...(total != null ? [`Total: ${formatPrice(total)}`, ''] : []),
    allHavePrices
      ? 'Me gustaría consultar disponibilidad!'
      : 'Me gustaría consultar disponibilidad y precios!',
  ].join('\n');

  return `https://wa.me/${CINTIA_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function generateSingleProductUrl(
  modelNombre: string,
  modelTipo: string,
  tela1Desc: string,
  tela2Desc?: string,
  precio?: number
): string {
  const telaInfo = tela2Desc ? `${tela1Desc} / ${tela2Desc}` : tela1Desc;
  const priceStr = precio != null ? ` (${formatPrice(precio)})` : '';
  const consultaStr = precio != null ? 'disponibilidad' : 'disponibilidad y precio';
  const message = `Hola Cintia! Me interesa la prenda ${modelNombre} (${modelTipo}) en ${telaInfo}${priceStr}. Me gustaría consultar ${consultaStr}!`;

  return `https://wa.me/${CINTIA_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function generateGeneralWhatsAppUrl(): string {
  const message = 'Hola Cintia! Quiero consultar sobre la Colección Magia de CHAMANA!';
  return `https://wa.me/${CINTIA_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
