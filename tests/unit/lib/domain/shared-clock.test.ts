import { fixedClock, systemClock } from '@/lib/domain/shared/clock';

describe('fixedClock', () => {
  const date = new Date('2026-03-09T12:00:00.000Z');
  const clock = fixedClock(date);

  it('now() returns the same date every time', () => {
    expect(clock.now()).toBe(date);
    expect(clock.now()).toBe(date);
  });

  it('now() returns an instance of Date', () => {
    expect(clock.now()).toBeInstanceOf(Date);
  });

  it('timestamp() returns ISO 8601 string', () => {
    expect(clock.timestamp()).toBe('2026-03-09T12:00:00.000Z');
  });

  it('timestamp() matches the fixed date toISOString', () => {
    expect(clock.timestamp()).toBe(date.toISOString());
  });

  it('epochMs() returns the date getTime value', () => {
    expect(clock.epochMs()).toBe(date.getTime());
  });

  it('epochMs() returns a number', () => {
    expect(typeof clock.epochMs()).toBe('number');
  });

  it('all methods are stable across multiple calls', () => {
    const results = Array.from({ length: 5 }, () => ({
      now: clock.now(),
      ts: clock.timestamp(),
      epoch: clock.epochMs(),
    }));
    for (const r of results) {
      expect(r.now).toBe(date);
      expect(r.ts).toBe('2026-03-09T12:00:00.000Z');
      expect(r.epoch).toBe(date.getTime());
    }
  });
});

describe('systemClock', () => {
  it('now() returns a Date instance', () => {
    expect(systemClock.now()).toBeInstanceOf(Date);
  });

  it('timestamp() returns a valid ISO string', () => {
    const ts = systemClock.timestamp();
    expect(typeof ts).toBe('string');
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  it('epochMs() returns a number close to Date.now()', () => {
    const before = Date.now();
    const epoch = systemClock.epochMs();
    const after = Date.now();
    expect(epoch).toBeGreaterThanOrEqual(before);
    expect(epoch).toBeLessThanOrEqual(after);
  });
});
