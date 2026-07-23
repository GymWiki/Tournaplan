import type { Discipline, Entry, Participant, Resource, Tournament, ValidationResult } from '../../tournament/types';
import { buildMatches } from '../formatSelection';
import { parseParticipantNames } from '../draft';
import type { AddDisciplineDraft } from './draft';

export interface AddDisciplineResult {
  tournament: Tournament;
  validation: ValidationResult;
}

/**
 * Adds a new discipline to an existing tournament. Selected existing participants/resources are
 * shared with the new discipline (their disciplineIds/participantIds grow); this is what makes the
 * scheduler's cross-discipline participant-conflict check bite — the same Participant now shows up
 * in matches from two disciplines, and it's the scheduler that guarantees they never overlap.
 */
export function buildTournamentWithNewDiscipline(tournament: Tournament, draft: AddDisciplineDraft): AddDisciplineResult {
  const disciplineId = crypto.randomUUID();

  const existingParticipants = tournament.participants.filter((p) => draft.selectedParticipantIds.includes(p.id));
  const newParticipants: Participant[] = parseParticipantNames(draft.newParticipantNamesText).map((name) => ({
    id: crypto.randomUUID(),
    name,
  }));
  const allParticipants = [...existingParticipants, ...newParticipants];

  const entries: Entry[] = allParticipants.map((p, i) => ({
    id: crypto.randomUUID(),
    disciplineId,
    name: p.name,
    participantIds: [p.id],
    seed: i + 1,
  }));

  const newResources: Resource[] = draft.newResourceNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => ({ id: crypto.randomUUID(), name, disciplineIds: [disciplineId] }));

  const { formatConfig, validation, matches } = buildMatches(draft, entries);

  const discipline: Discipline = {
    id: disciplineId,
    name: draft.disciplineName,
    format: draft.format,
    formatConfig,
    entries,
    matches,
    timeWindow: {
      start: draft.windowStartLocal ? new Date(draft.windowStartLocal) : new Date(NaN),
      end: draft.windowEndLocal ? new Date(draft.windowEndLocal) : new Date(NaN),
    },
  };

  const updatedResources = tournament.resources.map((r) =>
    draft.selectedResourceIds.includes(r.id) ? { ...r, disciplineIds: [...r.disciplineIds, disciplineId] } : r,
  );

  const updatedTournament: Tournament = {
    ...tournament,
    participants: [...tournament.participants, ...newParticipants],
    disciplines: [...tournament.disciplines, discipline],
    resources: [...updatedResources, ...newResources],
  };

  return { tournament: updatedTournament, validation };
}
