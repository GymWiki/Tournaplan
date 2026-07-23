import type { Discipline, Entry, Resource, Tournament, ValidationResult } from '../../tournament/types';
import { buildMatches } from '../formatSelection';
import { resolveEntryNames } from '../entryFields';
import type { AddDisciplineDraft } from './draft';
import { resolveParticipants } from './participantMatching';
import { applyDisciplineToResource } from './resourceSelection';

export interface AddDisciplineResult {
  tournament: Tournament;
  validation: ValidationResult;
}

/**
 * Adds a new discipline to an existing tournament. Entry names are matched by name against the
 * tournament's existing participants (see participantMatching.ts) — reusing rather than duplicating
 * them is what makes the scheduler's cross-discipline participant-conflict check bite, since the
 * same Participant now shows up in matches from two disciplines and the scheduler guarantees they
 * never overlap. Resources keep the "empty disciplineIds = all disciplines" convention from
 * types.ts; selectedResourceIds only needs to touch the ones the organizer excludes.
 */
export function buildTournamentWithNewDiscipline(tournament: Tournament, draft: AddDisciplineDraft): AddDisciplineResult {
  const disciplineId = crypto.randomUUID();

  const { participants, newParticipants } = resolveParticipants(resolveEntryNames(draft), tournament.participants);

  const entries: Entry[] = participants.map((p, i) => ({
    id: crypto.randomUUID(),
    disciplineId,
    name: p.name,
    participantIds: [p.id],
    seed: i + 1,
  }));

  const newResources: Resource[] = draft.newResourceNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => ({ id: crypto.randomUUID(), name, disciplineIds: [] }));

  const { formatConfig, validation, matches } = buildMatches(draft, entries);

  const discipline: Discipline = {
    id: disciplineId,
    name: draft.disciplineName,
    format: draft.format,
    formatConfig,
    entries,
    matches,
  };

  const existingDisciplineIds = tournament.disciplines.map((d) => d.id);
  const updatedResources = tournament.resources.map((r) =>
    applyDisciplineToResource(r, disciplineId, draft.selectedResourceIds.includes(r.id), existingDisciplineIds),
  );

  const updatedTournament: Tournament = {
    ...tournament,
    participants: [...tournament.participants, ...newParticipants],
    disciplines: [...tournament.disciplines, discipline],
    resources: [...updatedResources, ...newResources],
  };

  return { tournament: updatedTournament, validation };
}
