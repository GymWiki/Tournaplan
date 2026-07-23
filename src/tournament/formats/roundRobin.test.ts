import { describe, expect, it } from 'vitest';
import type { Entry } from '../types';
import { roundRobin } from './roundRobin';

function makeEntries(n: number): Entry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `e${i + 1}`,
    disciplineId: 'd1',
    name: `Team ${i + 1}`,
    participantIds: [`p${i + 1}`],
  }));
}

describe('roundRobin.validate', () => {
  it('rejects 0 and 1 entries', () => {
    expect(roundRobin.validate([], { durationMinutes: 10 }).valid).toBe(false);
    expect(roundRobin.validate(makeEntries(1), { durationMinutes: 10 }).valid).toBe(false);
  });

  it('warns about odd entry counts', () => {
    const result = roundRobin.validate(makeEntries(5), { durationMinutes: 10 });
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('roundRobin.generate', () => {
  it('returns no matches for 0, 1 entries', () => {
    expect(roundRobin.generate([], { durationMinutes: 10 })).toEqual([]);
    expect(roundRobin.generate(makeEntries(1), { durationMinutes: 10 })).toEqual([]);
  });

  it('produces one match for 2 entries', () => {
    const matches = roundRobin.generate(makeEntries(2), { durationMinutes: 10 });
    expect(matches).toHaveLength(1);
    expect(matches[0]!.home).toEqual({ kind: 'entry', entryId: 'e1' });
    expect(matches[0]!.away).toEqual({ kind: 'entry', entryId: 'e2' });
  });

  it('every match has an empty dependsOn (no ordering constraints between round-robin matches)', () => {
    const matches = roundRobin.generate(makeEntries(7), { durationMinutes: 10 });
    expect(matches.every((m) => m.dependsOn.length === 0)).toBe(true);
  });

  it('produces n(n-1)/2 matches total for n entries', () => {
    for (const n of [3, 4, 5, 8, 9]) {
      const matches = roundRobin.generate(makeEntries(n), { durationMinutes: 10 });
      expect(matches).toHaveLength((n * (n - 1)) / 2);
    }
  });

  it('assigns unique ids and stamps the configured duration and disciplineId', () => {
    const matches = roundRobin.generate(makeEntries(6), { durationMinutes: 25 });
    const ids = matches.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(matches.every((m) => m.durationMinutes === 25 && m.disciplineId === 'd1')).toBe(true);
  });
});
