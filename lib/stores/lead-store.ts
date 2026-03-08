'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeadStore {
  email: string | null;
  subscribedAt: string | null;
  dismissed: boolean;
  dismissedAt: string | null;
  setEmail: (email: string) => void;
  dismiss: () => void;
  shouldShowPopup: () => boolean;
}

const DISMISS_COOLDOWN_DAYS = 7;

export const useLeadStore = create<LeadStore>()(
  persist(
    (set, get) => ({
      email: null,
      subscribedAt: null,
      dismissed: false,
      dismissedAt: null,

      setEmail: (email) => {
        set({
          email,
          subscribedAt: new Date().toISOString(),
          dismissed: false,
          dismissedAt: null,
        });
      },

      dismiss: () => {
        set({
          dismissed: true,
          dismissedAt: new Date().toISOString(),
        });
      },

      shouldShowPopup: () => {
        const { email, dismissed, dismissedAt } = get();
        if (email) return false;
        if (!dismissed) return true;
        if (!dismissedAt) return true;
        const daysSinceDismiss =
          (Date.now() - new Date(dismissedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceDismiss >= DISMISS_COOLDOWN_DAYS;
      },
    }),
    {
      name: 'chamana-lead',
    }
  )
);
