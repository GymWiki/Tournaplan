import { describe, expect, it } from 'vitest';
import { defaultDraft } from './draft';
import { buildTournamentFromDraft } from './build';

function draftWithParticipants(n: number) {
  const draft = defaultDraft();
  draft.tournamentName = 'Zomertoernooi';
  draft.disciplineName = 'Voetbal';
  draft.entryMode = 'names';
  draft.participantNamesText = Array.from({ length: n }, (_, i) => `Team ${i + 1}`).join('\n');
  return draft;
}

describe('buildTournamentFromDraft', () => {
  it('builds one entry and one participant per pasted line', () => {
    const { tournament } = buildTournamentFromDraft(draftWithParticipants(4));
    expect(tournament.participants).toHaveLength(4);
    expect(tournament.disciplines[0]!.entries).toHaveLength(4);
  });

  it('builds count-based "Team N" entries in count mode (the default)', () => {
    const draft = defaultDraft();
    draft.tournamentName = 'Zomertoernooi';
    draft.disciplineName = 'Voetbal';
    draft.entryCount = 6;
    const { tournament } = buildTournamentFromDraft(draft);
    expect(tournament.participants.map((p) => p.name)).toEqual(['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6']);
  });

  it('generates matches for a valid single-elimination draft', () => {
    const draft = draftWithParticipants(8);
    draft.format = 'single_elimination';
    const { tournament, validation } = buildTournamentFromDraft(draft);
    expect(validation.valid).toBe(true);
    expect(tournament.disciplines[0]!.matches.length).toBeGreaterThan(0);
  });

  it('reports validation errors and generates no matches for too few entries', () => {
    const draft = draftWithParticipants(1);
    const { tournament, validation } = buildTournamentFromDraft(draft);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(tournament.disciplines[0]!.matches).toEqual([]);
  });

  it('wires groups_knockout config through from the draft', () => {
    const draft = draftWithParticipants(8);
    draft.format = 'groups_knockout';
    draft.numGroups = 2;
    draft.qualifiersPerGroup = 2;
    const { tournament, validation } = buildTournamentFromDraft(draft);
    expect(validation.valid).toBe(true);
    expect(tournament.disciplines[0]!.matches.some((m) => m.label.startsWith('Poule'))).toBe(true);
  });

  it('creates one resource per non-empty resource name', () => {
    const draft = draftWithParticipants(4);
    draft.resourceNames = ['Veld 1', '  ', 'Veld 2', ''];
    const { tournament } = buildTournamentFromDraft(draft);
    expect(tournament.resources.map((r) => r.name)).toEqual(['Veld 1', 'Veld 2']);
    // Empty disciplineIds means "usable by every discipline" — the default.
    expect(tournament.resources.every((r) => r.disciplineIds.length === 0)).toBe(true);
  });
});
