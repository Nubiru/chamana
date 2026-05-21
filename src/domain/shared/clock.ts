export interface Clock {
  now(): Date;
  timestamp(): string;
  epochMs(): number;
}

export const systemClock: Clock = {
  now: () => new Date(),
  timestamp: () => new Date().toISOString(),
  epochMs: () => Date.now(),
};

export function fixedClock(date: Date): Clock {
  return {
    now: () => date,
    timestamp: () => date.toISOString(),
    epochMs: () => date.getTime(),
  };
}
