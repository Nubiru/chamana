import type { LeadState } from './types';

const MS_PER_DAY = 86_400_000;

export function shouldShowPopup(state: LeadState, nowEpochMs: number, cooldownDays = 7): boolean {
  if (state.email) return false;
  if (!state.dismissed) return true;
  if (!state.dismissedAt) return true;

  const dismissedMs = new Date(state.dismissedAt).getTime();
  const cooldownMs = cooldownDays * MS_PER_DAY;
  return nowEpochMs - dismissedMs >= cooldownMs;
}
