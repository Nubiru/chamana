import { fixedClock } from '@/domain/shared/clock';
import type { Clock } from '@/domain/shared/clock';

export { fixedClock };
export type { Clock };

export const FIXED_DATE = new Date('2026-03-09T12:00:00Z');

export function buildClock(date?: Date): Clock {
  return fixedClock(date ?? FIXED_DATE);
}
