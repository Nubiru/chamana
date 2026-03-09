export interface LeadState {
  email: string | null;
  subscribedAt: string | null;
  dismissed: boolean;
  dismissedAt: string | null;
}

export type ConsentStatus = 'unknown' | 'granted' | 'denied';
