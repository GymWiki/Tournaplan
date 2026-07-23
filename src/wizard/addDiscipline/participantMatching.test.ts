import { describe, expect, it } from 'vitest';
import type { Participant } from '../../tournament/types';
import { resolveParticipants } from './participantMatching';

describe('resolveParticipants', () => {
  it('reuses an existing participant when the name matches exactly', () => {
    const existing: Participant[] = [{ id: 'p1', name: 'Team Rood' }];
    const { participants, newParticipants } = resolveParticipants(['Team Rood'], existing);
    expect(participants).toEqual([existing[0]]);
    expect(newParticipants).toEqual([]);
  });

  it('matches case- and whitespace-insensitively', () => {
    const existing: Participant[] = [{ id: 'p1', name: 'Team Rood' }];
    const { participants } = resolveParticipants(['  team rood  '], existing);
    expect(participants).toEqual([existing[0]]);
  });

  it('creates a new participant for a name that does not match', () => {
    const existing: Participant[] = [{ id: 'p1', name: 'Team Rood' }];
    const { participants, newParticipants } = resolveParticipants(['Team Blauw'], existing);
    expect(participants[0]!.name).toBe('Team Blauw');
    expect(newParticipants).toHaveLength(1);
    expect(newParticipants[0]!.name).toBe('Team Blauw');
  });

  it('preserves input order and mixes matched and new participants', () => {
    const existing: Participant[] = [
      { id: 'p1', name: 'Team Rood' },
      { id: 'p2', name: 'Team Blauw' },
    ];
    const { participants, newParticipants } = resolveParticipants(['Team Blauw', 'Team Groen', 'Team Rood'], existing);
    expect(participants.map((p) => p.name)).toEqual(['Team Blauw', 'Team Groen', 'Team Rood']);
    expect(participants[0]).toEqual(existing[1]);
    expect(participants[2]).toEqual(existing[0]);
    expect(newParticipants).toHaveLength(1);
    expect(newParticipants[0]!.name).toBe('Team Groen');
  });
});
