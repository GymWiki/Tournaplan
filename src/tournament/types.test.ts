import { describe, expect, it } from 'vitest';
import type { Match, Slot } from './types';

describe('domain model', () => {
  it('allows constructing a placeholder match with no concrete participants yet', () => {
    const home: Slot = { kind: 'winner_of', matchId: 'm1' };
    const away: Slot = { kind: 'winner_of', matchId: 'm2' };

    const match: Match = {
      id: 'm3',
      disciplineId: 'd1',
      round: 2,
      label: 'Halve finale 1',
      home,
      away,
      durationMinutes: 30,
      dependsOn: ['m1', 'm2'],
    };

    expect(match.home.kind).toBe('winner_of');
    expect(match.resourceId).toBeUndefined();
  });
});
