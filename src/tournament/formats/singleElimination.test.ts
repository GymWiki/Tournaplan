import { describe, expect, it } from 'vitest';
import type { Entry, Match } from '../types';
import { singleElimination } from './singleElimination';

function makeEntries(n: number): Entry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `e${i + 1}`,
    disciplineId: 'd1',
    name: `Team ${i + 1}`,
    participantIds: [`p${i + 1}`],
    seed: i + 1,
  }));
}

function countRealMatches(matches: Match[]): number {
  return matches.filter((m) => m.label !== 'Troostfinale').length;
}

describe('singleElimination.validate', () => {
  it('rejects 0 and 1 entries', () => {
    expect(singleElimination.validate([], { durationMinutes: 10 }).valid).toBe(false);
    expect(singleElimination.validate(makeEntries(1), { durationMinutes: 10 }).valid).toBe(false);
  });

  it('accepts 2 entries with no bye warning', () => {
    const result = singleElimination.validate(makeEntries(2), { durationMinutes: 10 });
    expect(result.valid).toBe(true);
    expect(result.warnings).toEqual([]);
  });

  it('warns about byes for non-power-of-two counts', () => {
    const result = singleElimination.validate(makeEntries(5), { durationMinutes: 10 });
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBe(1);
  });

  it('rejects duplicate seeds', () => {
    const entries = makeEntries(4);
    entries[1]!.seed = 1;
    expect(singleElimination.validate(entries, { durationMinutes: 10 }).valid).toBe(false);
  });
});

describe('singleElimination.generate — edge cases', () => {
  it('returns no matches for 0 or 1 entries', () => {
    expect(singleElimination.generate([], { durationMinutes: 10 })).toEqual([]);
    expect(singleElimination.generate(makeEntries(1), { durationMinutes: 10 })).toEqual([]);
  });

  it('returns a single final for 2 entries', () => {
    const matches = singleElimination.generate(makeEntries(2), { durationMinutes: 10 });
    expect(matches).toHaveLength(1);
    expect(matches[0]!.label).toBe('Finale');
    expect(matches[0]!.home).toEqual({ kind: 'entry', entryId: 'e1' });
    expect(matches[0]!.away).toEqual({ kind: 'entry', entryId: 'e2' });
  });
});

describe('singleElimination.generate — invariants', () => {
  it('needs exactly entries.length - 1 real matches to produce a champion, for any size', () => {
    for (const n of [2, 3, 4, 5, 6, 7, 8, 9, 13, 16, 24, 32, 47, 64]) {
      const matches = singleElimination.generate(makeEntries(n), { durationMinutes: 10, includeThirdPlace: false });
      expect(countRealMatches(matches)).toBe(n - 1);
    }
  });

  it('gives the top seeds byes rather than the first N entries', () => {
    // 5 entries -> bracket of 8, 3 byes. Standard seeding gives byes to seeds 1, 2 and 3;
    // only seed 4 vs seed 5 actually play in round one.
    const matches = singleElimination.generate(makeEntries(5), { durationMinutes: 10 });
    const round1 = matches.filter((m) => m.round === 1);
    expect(round1).toHaveLength(1);
    expect(round1[0]!.home).toEqual({ kind: 'entry', entryId: 'e4' });
    expect(round1[0]!.away).toEqual({ kind: 'entry', entryId: 'e5' });
  });

  it('never pairs two byes against each other', () => {
    for (const n of [3, 5, 6, 7, 9, 11, 13, 17, 24, 31]) {
      const matches = singleElimination.generate(makeEntries(n), { durationMinutes: 10 });
      for (const m of matches) {
        expect(m.home.kind === 'bye' && m.away.kind === 'bye').toBe(false);
      }
    }
  });

  it('produces unique match ids', () => {
    const matches = singleElimination.generate(makeEntries(13), { durationMinutes: 10 });
    const ids = matches.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('can toggle off the third-place match', () => {
    const withThird = singleElimination.generate(makeEntries(8), { durationMinutes: 10, includeThirdPlace: true });
    const withoutThird = singleElimination.generate(makeEntries(8), { durationMinutes: 10, includeThirdPlace: false });
    expect(withThird.some((m) => m.label === 'Troostfinale')).toBe(true);
    expect(withoutThird.some((m) => m.label === 'Troostfinale')).toBe(false);
    expect(withThird).toHaveLength(withoutThird.length + 1);
  });

  it('labels the final round "Finale" and the one before it "Halve finale"', () => {
    const matches = singleElimination.generate(makeEntries(8), { durationMinutes: 10 });
    expect(matches.filter((m) => m.label === 'Finale')).toHaveLength(1);
    expect(matches.filter((m) => m.label.startsWith('Halve finale'))).toHaveLength(2);
    expect(matches.filter((m) => m.label.startsWith('Kwartfinale'))).toHaveLength(4);
  });

  it('dependsOn always matches the winner_of/loser_of match ids referenced by home/away', () => {
    const matches = singleElimination.generate(makeEntries(16), { durationMinutes: 10 });
    for (const m of matches) {
      const referenced = [m.home, m.away]
        .map((s) => (s.kind === 'winner_of' || s.kind === 'loser_of' ? s.matchId : undefined))
        .filter((id): id is string => id !== undefined);
      expect(new Set(m.dependsOn)).toEqual(new Set(referenced));
    }
  });
});

describe('singleElimination.generate — snapshots', () => {
  it.each([8, 16, 32])('matches the stored bracket for %i entries', (n) => {
    const matches = singleElimination.generate(makeEntries(n), { durationMinutes: 20 });
    expect(matches).toMatchSnapshot();
  });
});
