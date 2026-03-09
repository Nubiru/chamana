'use client';

import { shouldShowPopup as domainShouldShowPopup } from '@/lib/domain/engagement/lead-rules';
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
        const state = get();
        return domainShouldShowPopup(state, Date.now());
      },
    }),
    {
      name: 'chamana-lead',
    }
  )
);
