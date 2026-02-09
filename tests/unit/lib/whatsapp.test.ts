import { generateWhatsAppUrl, generateSingleProductUrl, generateGeneralWhatsAppUrl } from '@/lib/whatsapp';
import type { CartItem } from '@/lib/stores/cart-store';

describe('generateWhatsAppUrl', () => {
  it('generates URL with single item', () => {
    const items: CartItem[] = [
      {
        modelSlug: 'hechizo',
        modelNombre: 'Hechizo',
        modelTipo: 'Falda',
        varianteId: 'hechizo-linmenchoc',
        tela1Desc: 'Lino Men Chocolate',
        quantity: 1,
      },
    ];

    const url = generateWhatsAppUrl(items);
    expect(url).toContain('https://wa.me/542215475727');
    expect(url).toContain('Hechizo');
    expect(url).toContain('Falda');
    expect(url).toContain('Lino%20Men%20Chocolate');
  });

  it('generates URL with reversible item showing both telas', () => {
    const items: CartItem[] = [
      {
        modelSlug: 'espejo',
        modelNombre: 'Espejo',
        modelTipo: 'Top',
        varianteId: 'espejo-ribneg-tejneg',
        tela1Desc: 'Rib Negro',
        tela2Desc: 'Tejido Negro',
        quantity: 1,
      },
    ];

    const url = generateWhatsAppUrl(items);
    expect(url).toContain('Rib%20Negro');
    expect(url).toContain('Tejido%20Negro');
  });

  it('generates URL with multiple items', () => {
    const items: CartItem[] = [
      {
        modelSlug: 'hechizo',
        modelNombre: 'Hechizo',
        modelTipo: 'Falda',
        varianteId: 'hechizo-linmenchoc',
        tela1Desc: 'Lino Men Chocolate',
        quantity: 1,
      },
      {
        modelSlug: 'ritual',
        modelNombre: 'Ritual',
        modelTipo: 'Vestido',
        varianteId: 'ritual-fibneg',
        tela1Desc: 'Fibrana Negro',
        quantity: 1,
      },
    ];

    const url = generateWhatsAppUrl(items);
    expect(url).toContain('Hechizo');
    expect(url).toContain('Ritual');
  });
});

describe('generateSingleProductUrl', () => {
  it('generates URL for single product', () => {
    const url = generateSingleProductUrl('Hechizo', 'Falda', 'Lino Men Chocolate');
    expect(url).toContain('https://wa.me/542215475727');
    expect(url).toContain('Hechizo');
    expect(url).toContain('Falda');
  });

  it('includes both telas for reversible', () => {
    const url = generateSingleProductUrl('Espejo', 'Top', 'Rib Negro', 'Tejido Negro');
    expect(url).toContain('Rib%20Negro');
    expect(url).toContain('Tejido%20Negro');
  });
});

describe('generateGeneralWhatsAppUrl', () => {
  it('generates general contact URL', () => {
    const url = generateGeneralWhatsAppUrl();
    expect(url).toContain('https://wa.me/542215475727');
    expect(url).toContain('CHAMANA');
  });
});
