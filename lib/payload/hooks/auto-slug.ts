import { slugify } from '@/lib/domain/shared/slug';
import type { FieldHook } from 'payload';

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
