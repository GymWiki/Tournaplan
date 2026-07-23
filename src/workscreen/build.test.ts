import { describe, expect, it } from 'vitest';
import { defaultWorkscreenState, defaultDisciplineDraft } from './types';
import { buildTournamentFromWorkscreenState } from './build';

describe('buildTournamentFromWorkscreenState', () => {
  it('builds a single-discipline tournament from the default state', () => {
    const state = defaultWorkscreenState();
    state.tournamentName = 'Sportdag';
    state.disciplines[0]!.name = 'Voetbal';
    state.disciplines[0]!.entryCount = 6;

    const { tournament, validationByDisciplineId } = buildTournamentFromWorkscreenState(state);

    expect(tournament.name).toBe('Sportdag');
    expect(tournament.disciplines).toHaveLength(1);
    expect(tournament.disciplines[0]!.name).toBe('Voetbal');
    expect(tournament.participants).toHaveLength(6);
    expect(validationByDisciplineId.get(state.disciplines[0]!.id)?.valid).toBe(true);
  });

  it('recomputes immediately with no persisted "generated matches" — a duration change alone changes the built matches', () => {
    const state = defaultWorkscreenState();
    state.disciplines[0]!.entryCount = 4;
    state.disciplines[0]!.matchDurationMinutes = 10;
    const first = buildTournamentFromWorkscreenState(state);

    state.disciplines[0]!.matchDurationMinutes = 25;
    const second = buildTournamentFromWorkscreenState(state);

    expect(first.tournament.disciplines[0]!.matches[0]!.durationMinutes).toBe(10);
    expect(second.tournament.disciplines[0]!.matches[0]!.durationMinutes).toBe(25);
  });

  it('shares a participant by name across two disciplines instead of duplicating', () => {
    const state = defaultWorkscreenState();
    state.disciplines[0]!.name = 'Voetbal';
    state.disciplines[0]!.entryMode = 'names';
    state.disciplines[0]!.participantNamesText = 'Team A\nTeam B';

    const second = defaultDisciplineDraft('Volleybal');
    second.entryMode = 'names';
    second.participantNamesText = 'Team A\nTeam C';
    state.disciplines.push(second);

    const { tournament } = buildTournamentFromWorkscreenState(state);

    expect(tournament.participants.map((p) => p.name)).toEqual(['Team A', 'Team B', 'Team C']);
    const teamAId = tournament.participants.find((p) => p.name === 'Team A')!.id;
    expect(tournament.disciplines[0]!.entries[0]!.participantIds).toEqual([teamAId]);
    expect(tournament.disciplines[1]!.entries[0]!.participantIds).toEqual([teamAId]);
  });

  it('drops blank resource names but keeps the disciplineIds eligibility as given', () => {
    const state = defaultWorkscreenState();
    state.resources = [
      { id: 'r1', name: 'Veld 1', disciplineIds: [] },
      { id: 'r2', name: '  ', disciplineIds: [] },
    ];

    const { tournament } = buildTournamentFromWorkscreenState(state);

    expect(tournament.resources.map((r) => r.name)).toEqual(['Veld 1']);
  });
});
