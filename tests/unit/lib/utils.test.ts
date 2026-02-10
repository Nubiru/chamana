import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('returns "Consultar precio" for undefined', () => {
    expect(formatPrice()).toBe('Consultar precio');
    expect(formatPrice(undefined)).toBe('Consultar precio');
  });

  it('formats small prices without separator', () => {
    expect(formatPrice(500)).toBe('$500');
  });

  it('formats thousands with dot separator', () => {
    expect(formatPrice(25000)).toBe('$25.000');
  });

  it('formats large prices', () => {
    expect(formatPrice(150000)).toBe('$150.000');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0');
  });
});
