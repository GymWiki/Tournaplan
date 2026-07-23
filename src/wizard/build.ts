import type { Discipline, Entry, Participant, Resource, Tournament, ValidationResult } from '../tournament/types';
import { buildMatches } from './formatSelection';
import type { WizardDraft } from './draft';
import { parseParticipantNames } from './draft';

export interface BuildResult {
  tournament: Tournament;
  validation: ValidationResult;
}

/** Builds a Tournament with a single discipline from the wizard draft, running that format's own validate()+generate(). */
export function buildTournamentFromDraft(draft: WizardDraft): BuildResult {
  const disciplineId = crypto.randomUUID();

  const participants: Participant[] = parseParticipantNames(draft.participantNamesText).map((name) => ({
    id: crypto.randomUUID(),
    name,
  }));
  const entries: Entry[] = participants.map((p, i) => ({
    id: crypto.randomUUID(),
    disciplineId,
    name: p.name,
    participantIds: [p.id],
    seed: i + 1,
  }));

  const resources: Resource[] = draft.resourceNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .map((name) => ({ id: crypto.randomUUID(), name, disciplineIds: [disciplineId] }));

  const { formatConfig, validation, matches } = buildMatches(draft, entries);

  const discipline: Discipline = {
    id: disciplineId,
    name: draft.disciplineName || draft.tournamentName,
    format: draft.format,
    formatConfig,
    entries,
    matches,
  };

  const tournament: Tournament = {
    id: crypto.randomUUID(),
    name: draft.tournamentName,
    participants,
    disciplines: [discipline],
    resources,
  };

  return { tournament, validation };
}
