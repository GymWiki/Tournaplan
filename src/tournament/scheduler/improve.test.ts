import { describe, expect, it } from 'vitest';
import { schedule } from './index';
import { randomTournament } from './fixtures';
import { improveSchedule } from './improve';

describe('improveSchedule (via schedule)', () => {
  it('never makes the soft-constraint score worse than the greedy placement alone', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const tournament = randomTournament(seed);
      const withoutImprovement = schedule(tournament, { improvementIterations: 0 });
      const withImprovement = schedule(tournament, { improvementIterations: 200 });
      expect(withImprovement.score).toBeLessThanOrEqual(withoutImprovement.score);
    }
  });
});

describe('improveSchedule', () => {
  it('returns the input unchanged when fewer than 2 matches are scheduled', () => {
    const result = improveSchedule([], new Map(), new Map(), 15, 200, () => 0.5);
    expect(result).toEqual([]);
  });
});
