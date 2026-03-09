import { slugify } from '@/lib/domain/shared/slug';

describe('slugify', () => {
  it('converts simple text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips accented characters (Intuición → intuicion)', () => {
    expect(slugify('Intuición')).toBe('intuicion');
  });

  it('handles multiple accented characters', () => {
    expect(slugify('Más Allá del Otoño')).toBe('mas-alla-del-otono');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('luz y sombra')).toBe('luz-y-sombra');
  });

  it('collapses consecutive non-alphanumeric chars into a single hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world');
    expect(slugify('a---b')).toBe('a-b');
    expect(slugify('foo & bar')).toBe('foo-bar');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello');
    expect(slugify('  hello  ')).toBe('hello');
    expect(slugify('!!hello!!')).toBe('hello');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(slugify('   ')).toBe('');
  });

  it('returns empty string for special-characters-only input', () => {
    expect(slugify('!!@@##')).toBe('');
  });

  it('preserves numbers', () => {
    expect(slugify('Colección 2026')).toBe('coleccion-2026');
  });

  it('handles ñ correctly', () => {
    expect(slugify('Corazonada Ñandú')).toBe('corazonada-nandu');
  });

  it('handles already-slugified text', () => {
    expect(slugify('already-slugified')).toBe('already-slugified');
  });
});
