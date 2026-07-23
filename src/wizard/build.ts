import type { Discipline, Entry, FormatConfig, Match, Participant, Resource, Tournament, ValidationResult } from '../tournament/types';
import { singleElimination } from '../tournament/formats/singleElimination';
import { roundRobin } from '../tournament/formats/roundRobin';
import { groupsKnockout } from '../tournament/formats/groupsKnockout';
import type { WizardDraft } from './draft';
import { parseParticipantNames } from './draft';

export interface BuildResult {
  tournament: Tournament;
  validation: ValidationResult;
}

function buildMatches(draft: WizardDraft, entries: Entry[]): { formatConfig: FormatConfig; validation: ValidationResult; matches: Match[] } {
  if (draft.format === 'single_elimination') {
    const formatConfig = { durationMinutes: draft.matchDurationMinutes, includeThirdPlace: draft.includeThirdPlace };
    const validation = singleElimination.validate(entries, formatConfig);
    return { formatConfig, validation, matches: validation.valid ? singleElimination.generate(entries, formatConfig) : [] };
  }
  if (draft.format === 'groups_knockout') {
    const formatConfig = {
      durationMinutes: draft.matchDurationMinutes,
      numGroups: draft.numGroups,
      qualifiersPerGroup: draft.qualifiersPerGroup,
      includeThirdPlace: draft.includeThirdPlace,
    };
    const validation = groupsKnockout.validate(entries, formatConfig);
    return { formatConfig, validation, matches: validation.valid ? groupsKnockout.generate(entries, formatConfig) : [] };
  }
  const formatConfig = { durationMinutes: draft.matchDurationMinutes };
  const validation = roundRobin.validate(entries, formatConfig);
  return { formatConfig, validation, matches: validation.valid ? roundRobin.generate(entries, formatConfig) : [] };
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
    timeWindow: {
      start: draft.windowStartLocal ? new Date(draft.windowStartLocal) : new Date(NaN),
      end: draft.windowEndLocal ? new Date(draft.windowEndLocal) : new Date(NaN),
    },
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
