import type { Discipline, Entry, Participant, Resource, Tournament, ValidationResult } from '../tournament/types';
import { buildMatches } from '../wizard/formatSelection';
import { resolveEntryNames } from '../wizard/entryFields';
import { resolveParticipants } from '../wizard/addDiscipline/participantMatching';
import type { WorkscreenState } from './types';

export interface DisciplineBuildResult {
  discipline: Discipline;
  validation: ValidationResult;
}

export interface WorkscreenBuildResult {
  tournament: Tournament;
  validationByDisciplineId: Map<string, ValidationResult>;
}

/**
 * Rebuilds the whole Tournament from scratch on every change — this is what makes the workscreen
 * live instead of a wizard: there is no "generate" step, just a pure function of the current
 * settings. Participants are matched by name across disciplines as they're built in order, so
 * typing the same team name for a second discipline shares the same Participant (see
 * wizard/addDiscipline/participantMatching.ts).
 */
export function buildTournamentFromWorkscreenState(state: WorkscreenState): WorkscreenBuildResult {
  let participants: Participant[] = [];
  const disciplines: Discipline[] = [];
  const validationByDisciplineId = new Map<string, ValidationResult>();

  for (const draft of state.disciplines) {
    const names = resolveEntryNames(draft);
    const { participants: disciplineParticipants, newParticipants } = resolveParticipants(names, participants);
    participants = [...participants, ...newParticipants];

    const entries: Entry[] = disciplineParticipants.map((p, i) => ({
      id: `${draft.id}-e${i + 1}`,
      disciplineId: draft.id,
      name: p.name,
      participantIds: [p.id],
      seed: i + 1,
    }));

    const { formatConfig, validation, matches } = buildMatches(draft, entries);
    validationByDisciplineId.set(draft.id, validation);

    disciplines.push({
      id: draft.id,
      name: draft.name || `Onderdeel ${disciplines.length + 1}`,
      format: draft.format,
      formatConfig,
      entries,
      matches,
    });
  }

  const resources: Resource[] = state.resources
    .filter((r) => r.name.trim().length > 0)
    .map((r) => ({ id: r.id, name: r.name.trim(), disciplineIds: r.disciplineIds }));

  const tournament: Tournament = {
    id: 'workscreen',
    name: state.tournamentName,
    participants,
    disciplines,
    resources,
    startTime: state.startTime,
  };

  return { tournament, validationByDisciplineId };
}
