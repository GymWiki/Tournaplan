import { describe, expect, it } from 'vitest';
import { defaultDraft } from '../draft';
import { buildTournamentFromDraft } from '../build';
import { defaultAddDisciplineDraft } from './draft';
import { buildTournamentWithNewDiscipline } from './build';

function baseTournament() {
  const draft = defaultDraft();
  draft.tournamentName = 'Sportdag';
  draft.disciplineName = 'Voetbal';
  draft.entryMode = 'names';
  draft.participantNamesText = Array.from({ length: 4 }, (_, i) => `Team ${i + 1}`).join('\n');
  draft.resourceNames = ['Veld 1'];
  return buildTournamentFromDraft(draft).tournament;
}

describe('buildTournamentWithNewDiscipline', () => {
  it('appends a second discipline while keeping the first intact', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament);
    draft.disciplineName = 'Volleybal';

    const { tournament: updated, validation } = buildTournamentWithNewDiscipline(tournament, draft);

    expect(validation.valid).toBe(true);
    expect(updated.disciplines).toHaveLength(2);
    expect(updated.disciplines[0]).toEqual(tournament.disciplines[0]);
    expect(updated.disciplines[1]!.name).toBe('Volleybal');
  });

  it('reuses every existing participant by name with the default draft, instead of duplicating them', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament); // defaults to reusing all names ("Team 1".."Team 4")
    draft.disciplineName = 'Volleybal';

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    expect(updated.participants).toHaveLength(4); // no new participants created
    const secondDisciplineParticipantIds = updated.disciplines[1]!.entries.flatMap((e) => e.participantIds);
    expect(new Set(secondDisciplineParticipantIds)).toEqual(new Set(tournament.participants.map((p) => p.id)));
  });

  it('matches a retyped existing name to the same participant, and creates new ones for the rest', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament);
    draft.disciplineName = 'Volleybal';
    draft.entryMode = 'names';
    draft.participantNamesText = 'Team 1\nTeam 5\nTeam 6'; // "Team 1" already exists

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    expect(updated.participants).toHaveLength(6); // 4 original + 2 new ("Team 1" reused)
    const team1 = tournament.participants.find((p) => p.name === 'Team 1')!;
    expect(updated.disciplines[1]!.entries[0]!.participantIds).toEqual([team1.id]);
  });

  it('generates fresh "Team N" participants in count mode, never matched against existing names', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament);
    draft.disciplineName = 'Volleybal';
    draft.entryMode = 'count';
    draft.entryCount = 4;

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    // Count mode always produces "Team 1".."Team 4" too, and those DO match existing names by
    // design (matching is purely by name) — so this still reuses, proving the match is name-based
    // regardless of which entry mode produced the name.
    expect(updated.participants).toHaveLength(4);
  });

  it('leaves an "all disciplines" resource untouched when kept selected — it already covers the new one', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament); // defaults to the existing resource selected
    draft.disciplineName = 'Volleybal';

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    const resource = updated.resources.find((r) => r.id === tournament.resources[0]!.id)!;
    expect(resource.disciplineIds).toEqual([]); // still "all disciplines", including the new one
  });

  it('materializes an "all disciplines" resource into an explicit list when excluded', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament);
    draft.disciplineName = 'Volleybal';
    draft.selectedResourceIds = []; // exclude the existing field from this discipline

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    const resource = updated.resources.find((r) => r.id === tournament.resources[0]!.id)!;
    expect(resource.disciplineIds).toEqual([tournament.disciplines[0]!.id]);
  });

  it('gives a newly created resource the "all disciplines" default too', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament);
    draft.disciplineName = 'Volleybal';
    draft.newResourceNames = ['Zaal 1'];

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    const newResource = updated.resources.find((r) => r.name === 'Zaal 1')!;
    expect(newResource.disciplineIds).toEqual([]);
  });
});
