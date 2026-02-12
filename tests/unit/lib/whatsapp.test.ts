import type { CartItem } from '@/lib/stores/cart-store';
import {
  generateGeneralWhatsAppUrl,
  generateSingleProductUrl,
  generateWhatsAppUrl,
} from '@/lib/whatsapp';

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
        varianteId: 'espejo-ribmilitar-tejnegro',
        tela1Desc: 'Ribb New York Verde Militar',
        tela2Desc: 'Tejido Formentera Negro',
        quantity: 1,
      },
    ];

    const url = generateWhatsAppUrl(items);
    expect(url).toContain('Ribb%20New%20York%20Verde%20Militar');
    expect(url).toContain('Tejido%20Formentera%20Negro');
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
        modelSlug: 'sabia',
        modelNombre: 'Sabia',
        modelTipo: 'Remeron',
        varianteId: 'sabia-tejnegro',
        tela1Desc: 'Tejido Formentera Negro',
        quantity: 1,
      },
    ];

    const url = generateWhatsAppUrl(items);
    expect(url).toContain('Hechizo');
    expect(url).toContain('Sabia');
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
    const url = generateSingleProductUrl(
      'Espejo',
      'Top',
      'Ribb New York Verde Militar',
      'Tejido Formentera Negro'
    );
    expect(url).toContain('Ribb%20New%20York%20Verde%20Militar');
    expect(url).toContain('Tejido%20Formentera%20Negro');
  });
});

describe('generateWhatsAppUrl with prices', () => {
  it('includes prices and total when all items have prices', () => {
    const items: CartItem[] = [
      {
        modelSlug: 'hechizo',
        modelNombre: 'Hechizo',
        modelTipo: 'Falda',
        varianteId: 'hechizo-linmenchoc',
        tela1Desc: 'Lino Men Chocolate',
        precio: 25000,
        quantity: 1,
      },
      {
        modelSlug: 'sabia',
        modelNombre: 'Sabia',
        modelTipo: 'Remeron',
        varianteId: 'sabia-tejnegro',
        tela1Desc: 'Tejido Formentera Negro',
        precio: 30000,
        quantity: 2,
      },
    ];

    const url = generateWhatsAppUrl(items);
    expect(url).toContain('25.000');
    expect(url).toContain('x2');
    expect(url).toContain('Total');
    expect(url).toContain('85.000');
    expect(url).not.toContain('precios');
  });

  it('omits total when some items lack price', () => {
    const items: CartItem[] = [
      {
        modelSlug: 'hechizo',
        modelNombre: 'Hechizo',
        modelTipo: 'Falda',
        varianteId: 'hechizo-linmenchoc',
        tela1Desc: 'Lino Men Chocolate',
        precio: 25000,
        quantity: 1,
      },
      {
        modelSlug: 'sabia',
        modelNombre: 'Sabia',
        modelTipo: 'Remeron',
        varianteId: 'sabia-tejnegro',
        tela1Desc: 'Tejido Formentera Negro',
        quantity: 1,
      },
    ];

    const url = generateWhatsAppUrl(items);
    expect(url).not.toContain('Total');
    expect(url).toContain('precios');
  });
});

describe('generateSingleProductUrl with price', () => {
  it('includes price when provided', () => {
    const url = generateSingleProductUrl(
      'Hechizo',
      'Falda',
      'Lino Men Chocolate',
      undefined,
      25000
    );
    expect(url).toContain('25.000');
    expect(url).not.toContain('precio!');
  });

  it('asks for price when not provided', () => {
    const url = generateSingleProductUrl('Hechizo', 'Falda', 'Lino Men Chocolate');
    expect(url).toContain('precio');
  });
});

describe('generateGeneralWhatsAppUrl', () => {
  it('generates general contact URL', () => {
    const url = generateGeneralWhatsAppUrl();
    expect(url).toContain('https://wa.me/542215475727');
    expect(url).toContain('CHAMANA');
  });
});
