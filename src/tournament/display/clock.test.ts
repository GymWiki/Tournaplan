import { describe, expect, it } from 'vitest';
import { toClockTime } from './clock';

describe('toClockTime', () => {
  it('returns null when no start time is given', () => {
    expect(toClockTime(90)).toBeNull();
  });

  it('adds the offset to the start time and formats as HH:mm', () => {
    const startTime = new Date('2026-08-01T09:00:00');
    expect(toClockTime(0, startTime)).toBe('09:00');
    expect(toClockTime(90, startTime)).toBe('10:30');
  });

  it('pads single-digit hours and minutes', () => {
    const startTime = new Date('2026-08-01T09:05:00');
    expect(toClockTime(0, startTime)).toBe('09:05');
  });

  it('rolls over past midnight', () => {
    const startTime = new Date('2026-08-01T23:30:00');
    expect(toClockTime(60, startTime)).toBe('00:30');
  });
});
