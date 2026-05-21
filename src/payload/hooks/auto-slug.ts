import type { FieldHook } from 'payload';
import { slugify } from '../../domain/shared/slug.ts';

export const autoSlug =
  (sourceField: string): FieldHook =>
  ({ data, value }) => {
    if (value) return value;
    const source = data?.[sourceField];
    if (typeof source === 'string' && source.length > 0) {
      return slugify(source);
    }
    return value;
  };
