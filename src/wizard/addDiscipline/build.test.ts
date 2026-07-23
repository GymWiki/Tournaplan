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

  it('shares selected existing participants with the new discipline instead of duplicating them', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament); // defaults to all participants selected
    draft.disciplineName = 'Volleybal';

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    expect(updated.participants).toHaveLength(4); // no new participants created
    const secondDisciplineParticipantIds = updated.disciplines[1]!.entries.flatMap((e) => e.participantIds);
    expect(new Set(secondDisciplineParticipantIds)).toEqual(new Set(tournament.participants.map((p) => p.id)));
  });

  it('adds new participants alongside selected existing ones', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament);
    draft.disciplineName = 'Volleybal';
    draft.selectedParticipantIds = [tournament.participants[0]!.id];
    draft.newParticipantNamesText = 'Team 5\nTeam 6';

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    expect(updated.participants).toHaveLength(6); // 4 original + 2 new
    expect(updated.disciplines[1]!.entries).toHaveLength(3); // 1 selected + 2 new
  });

  it('shares a selected resource across both disciplines', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament); // defaults to the existing resource selected
    draft.disciplineName = 'Volleybal';

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    const sharedResource = updated.resources.find((r) => r.id === tournament.resources[0]!.id)!;
    expect(sharedResource.disciplineIds).toEqual([tournament.disciplines[0]!.id, updated.disciplines[1]!.id]);
  });

  it('adds a new resource scoped only to the new discipline', () => {
    const tournament = baseTournament();
    const draft = defaultAddDisciplineDraft(tournament);
    draft.disciplineName = 'Volleybal';
    draft.selectedResourceIds = [];
    draft.newResourceNames = ['Zaal 1'];

    const { tournament: updated } = buildTournamentWithNewDiscipline(tournament, draft);

    const newResource = updated.resources.find((r) => r.name === 'Zaal 1')!;
    expect(newResource.disciplineIds).toEqual([updated.disciplines[1]!.id]);
    const originalResource = updated.resources.find((r) => r.id === tournament.resources[0]!.id)!;
    expect(originalResource.disciplineIds).toEqual([tournament.disciplines[0]!.id]);
  });
});
