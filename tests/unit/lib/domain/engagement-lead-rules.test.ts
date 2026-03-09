import { shouldShowPopup } from '@/lib/domain/engagement/lead-rules';
import type { LeadState } from '@/lib/domain/engagement/types';

const MS_PER_DAY = 86_400_000;

function makeState(overrides: Partial<LeadState> = {}): LeadState {
  return {
    email: null,
    subscribedAt: null,
    dismissed: false,
    dismissedAt: null,
    ...overrides,
  };
}

describe('shouldShowPopup', () => {
  const now = new Date('2026-03-09T12:00:00.000Z').getTime();

  describe('when user has email', () => {
    it('returns false regardless of other state', () => {
      const state = makeState({ email: 'test@example.com', dismissed: false });
      expect(shouldShowPopup(state, now)).toBe(false);
    });

    it('returns false even if dismissed', () => {
      const state = makeState({
        email: 'test@example.com',
        dismissed: true,
        dismissedAt: '2026-01-01T00:00:00.000Z',
      });
      expect(shouldShowPopup(state, now)).toBe(false);
    });
  });

  describe('when user has not dismissed', () => {
    it('returns true for fresh visitor (no email, not dismissed)', () => {
      const state = makeState();
      expect(shouldShowPopup(state, now)).toBe(true);
    });
  });

  describe('when dismissed but no dismissedAt date', () => {
    it('returns true (treated as if cooldown expired)', () => {
      const state = makeState({ dismissed: true, dismissedAt: null });
      expect(shouldShowPopup(state, now)).toBe(true);
    });
  });

  describe('when dismissed within cooldown period', () => {
    it('returns false when dismissed 1 day ago (default 7-day cooldown)', () => {
      const oneDayAgo = new Date(now - 1 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: oneDayAgo });
      expect(shouldShowPopup(state, now)).toBe(false);
    });

    it('returns false when dismissed 6 days ago (default 7-day cooldown)', () => {
      const sixDaysAgo = new Date(now - 6 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: sixDaysAgo });
      expect(shouldShowPopup(state, now)).toBe(false);
    });

    it('returns false when dismissed just under 7 days ago', () => {
      const almostSevenDays = new Date(now - 7 * MS_PER_DAY + 1).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: almostSevenDays });
      expect(shouldShowPopup(state, now)).toBe(false);
    });
  });

  describe('when dismissed past cooldown period', () => {
    it('returns true when dismissed exactly 7 days ago', () => {
      const sevenDaysAgo = new Date(now - 7 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: sevenDaysAgo });
      expect(shouldShowPopup(state, now)).toBe(true);
    });

    it('returns true when dismissed 10 days ago', () => {
      const tenDaysAgo = new Date(now - 10 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: tenDaysAgo });
      expect(shouldShowPopup(state, now)).toBe(true);
    });

    it('returns true when dismissed 30 days ago', () => {
      const thirtyDaysAgo = new Date(now - 30 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: thirtyDaysAgo });
      expect(shouldShowPopup(state, now)).toBe(true);
    });
  });

  describe('custom cooldown days', () => {
    it('respects a 3-day cooldown (dismissed 2 days ago -> false)', () => {
      const twoDaysAgo = new Date(now - 2 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: twoDaysAgo });
      expect(shouldShowPopup(state, now, 3)).toBe(false);
    });

    it('respects a 3-day cooldown (dismissed 3 days ago -> true)', () => {
      const threeDaysAgo = new Date(now - 3 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: threeDaysAgo });
      expect(shouldShowPopup(state, now, 3)).toBe(true);
    });

    it('respects a 1-day cooldown', () => {
      const oneDayAgo = new Date(now - 1 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: oneDayAgo });
      expect(shouldShowPopup(state, now, 1)).toBe(true);
    });

    it('respects a 14-day cooldown (dismissed 10 days ago -> false)', () => {
      const tenDaysAgo = new Date(now - 10 * MS_PER_DAY).toISOString();
      const state = makeState({ dismissed: true, dismissedAt: tenDaysAgo });
      expect(shouldShowPopup(state, now, 14)).toBe(false);
    });
  });
});
