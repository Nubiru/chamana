import { TELAS, TIPOS_TELA, telaDescripcion } from '@/lib/data/fabrics';

describe('fabrics data', () => {
  it('has at least 20 fabric entries', () => {
    expect(Object.keys(TELAS).length).toBeGreaterThanOrEqual(20);
  });

  it('every fabric has a valid colorHex', () => {
    for (const tela of Object.values(TELAS)) {
      expect(tela.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('every fabric has tipo and color', () => {
    for (const tela of Object.values(TELAS)) {
      expect(tela.tipo).toBeTruthy();
      expect(tela.color).toBeTruthy();
    }
  });

  it('TIPOS_TELA contains expected base materials', () => {
    expect(TIPOS_TELA).toContain('Lino');
    expect(TIPOS_TELA).toContain('Tejido');
    expect(TIPOS_TELA).toContain('Rib');
  });
});

describe('telaDescripcion', () => {
  it('formats tela without subtipo', () => {
    expect(telaDescripcion(TELAS.TejNeg)).toBe('Tejido Negro');
  });

  it('formats tela with subtipo', () => {
    expect(telaDescripcion(TELAS.LinMenChoc)).toBe('Lino Men Chocolate');
  });
});
