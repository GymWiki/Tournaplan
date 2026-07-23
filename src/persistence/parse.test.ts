import { describe, expect, it } from 'vitest';
import type { Tournament } from '../tournament/types';
import { parseTournamentJson, tournamentToJson } from './parse';

function sampleTournament(): Tournament {
  return {
    id: 't1',
    name: 'Zomertoernooi',
    participants: [{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }],
    disciplines: [
      {
        id: 'd1',
        name: 'Voetbal',
        format: 'single_elimination',
        formatConfig: { durationMinutes: 20, includeThirdPlace: true },
        entries: [
          { id: 'd1-e1', disciplineId: 'd1', name: 'Team A', participantIds: ['p1'], seed: 1 },
          { id: 'd1-e2', disciplineId: 'd1', name: 'Team B', participantIds: ['p2'], seed: 2 },
        ],
        matches: [
          {
            id: 'd1-r1-p0',
            disciplineId: 'd1',
            round: 1,
            label: 'Finale',
            home: { kind: 'entry', entryId: 'd1-e1' },
            away: { kind: 'entry', entryId: 'd1-e2' },
            durationMinutes: 20,
            dependsOn: [],
            resourceId: 'r1',
            startsAt: new Date('2026-08-01T09:00:00Z'),
          },
        ],
        timeWindow: { start: new Date('2026-08-01T09:00:00Z'), end: new Date('2026-08-01T18:00:00Z') },
      },
    ],
    resources: [{ id: 'r1', name: 'Veld 1', disciplineIds: ['d1'] }],
  };
}

describe('tournamentToJson / parseTournamentJson', () => {
  it('round-trips a tournament, including Date fields', () => {
    const original = sampleTournament();
    const json = tournamentToJson(original);
    const result = parseTournamentJson(json);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.tournament).toEqual(original);
    expect(result.tournament.disciplines[0]!.matches[0]!.startsAt).toBeInstanceOf(Date);
    expect(result.tournament.disciplines[0]!.timeWindow.start).toBeInstanceOf(Date);
  });

  it('rejects invalid JSON text', () => {
    const result = parseTournamentJson('{not valid json');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toMatch(/JSON/);
  });

  it('rejects JSON that does not match the tournament shape', () => {
    const result = parseTournamentJson(JSON.stringify({ foo: 'bar' }));
    expect(result.success).toBe(false);
  });

  it('rejects a match with an unknown slot kind', () => {
    const tournament = sampleTournament();
    const badJson = tournamentToJson(tournament).replace('"entry"', '"unknown_kind"');
    const result = parseTournamentJson(badJson);
    expect(result.success).toBe(false);
  });
});
