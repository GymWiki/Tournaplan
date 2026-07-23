import { describe, expect, it } from 'vitest';
import type { Entry, Match } from '../tournament/types';
import { slotLabel } from './slotLabel';

const entryById = new Map<string, Entry>([['e1', { id: 'e1', disciplineId: 'd1', name: 'Team A', participantIds: ['p1'] }]]);
const matchById = new Map<string, Match>([
  [
    'm1',
    {
      id: 'm1',
      disciplineId: 'd1',
      round: 1,
      label: 'Kwartfinale 1',
      home: { kind: 'bye' },
      away: { kind: 'bye' },
      durationMinutes: 10,
      dependsOn: [],
    },
  ],
]);

describe('slotLabel', () => {
  it('resolves an entry slot to its name', () => {
    expect(slotLabel({ kind: 'entry', entryId: 'e1' }, entryById, matchById)).toBe('Team A');
  });

  it('falls back gracefully for an unknown entry', () => {
    expect(slotLabel({ kind: 'entry', entryId: 'missing' }, entryById, matchById)).toBe('Onbekende deelnemer');
  });

  it('describes a winner_of placeholder using the referenced match label', () => {
    expect(slotLabel({ kind: 'winner_of', matchId: 'm1' }, entryById, matchById)).toBe('Winnaar van Kwartfinale 1');
  });

  it('describes a loser_of placeholder using the referenced match label', () => {
    expect(slotLabel({ kind: 'loser_of', matchId: 'm1' }, entryById, matchById)).toBe('Verliezer van Kwartfinale 1');
  });

  it('describes a group_rank placeholder', () => {
    expect(slotLabel({ kind: 'group_rank', groupId: 'A', rank: 2 }, entryById, matchById)).toBe('Nr. 2 Poule A');
  });

  it('describes a bye', () => {
    expect(slotLabel({ kind: 'bye' }, entryById, matchById)).toBe('Bye');
  });
});
