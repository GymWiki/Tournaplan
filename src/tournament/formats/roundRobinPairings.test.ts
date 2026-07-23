import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { roundRobinRounds } from './roundRobinPairings';

function checkProperties(n: number) {
  const items = Array.from({ length: n }, (_, i) => i + 1);
  const rounds = roundRobinRounds(items);

  // Every unordered pair meets exactly once, total.
  const seenPairs = new Map<string, number>();
  for (const round of rounds) {
    for (const [a, b] of round) {
      const key = [a, b].sort((x, y) => x - y).join('-');
      seenPairs.set(key, (seenPairs.get(key) ?? 0) + 1);
    }
  }
  const expectedPairCount = (n * (n - 1)) / 2;
  expect(seenPairs.size).toBe(expectedPairCount);
  for (const count of seenPairs.values()) {
    expect(count).toBe(1);
  }

  // Nobody plays twice in the same round.
  for (const round of rounds) {
    const players = round.flatMap(([a, b]) => [a, b]);
    expect(new Set(players).size).toBe(players.length);
  }

  // At most one rest per round, and rounds count equals ceil to even minus 1.
  const roundSize = n % 2 === 0 ? n / 2 : (n - 1) / 2;
  for (const round of rounds) {
    expect(round.length).toBeLessThanOrEqual(roundSize);
  }
}

describe('roundRobinRounds', () => {
  it('holds the round-robin invariants for every n from 2 to 64', () => {
    for (let n = 2; n <= 64; n++) {
      checkProperties(n);
    }
  });

  it('holds the round-robin invariants under property-based testing', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 64 }), (n) => {
        checkProperties(n);
      }),
      { numRuns: 200 },
    );
  });

  it('returns no rounds for fewer than 2 items', () => {
    expect(roundRobinRounds([])).toEqual([]);
    expect(roundRobinRounds([1])).toEqual([]);
  });

  it('produces n-1 rounds of n/2 matches for an even group', () => {
    const items = [1, 2, 3, 5];
    const rounds = roundRobinRounds(items);
    expect(rounds).toHaveLength(3);
    for (const round of rounds) expect(round).toHaveLength(2);
  });

  it('gives odd-sized groups one rest per round', () => {
    const items = [1, 2, 3];
    const rounds = roundRobinRounds(items);
    expect(rounds).toHaveLength(3);
    for (const round of rounds) expect(round).toHaveLength(1);
  });
});
