import type { FieldHook } from 'payload'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const autoSlug =
  (sourceField: string): FieldHook =>
  ({ data, value }) => {
    if (value) return value
    const source = data?.[sourceField]
    if (typeof source === 'string' && source.length > 0) {
      return slugify(source)
    }
    return value
  }
