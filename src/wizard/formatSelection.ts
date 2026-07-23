import type { Entry, FormatConfig, Match, ValidationResult } from '../tournament/types';
import { singleElimination } from '../tournament/formats/singleElimination';
import { roundRobin } from '../tournament/formats/roundRobin';
import { groupsKnockout } from '../tournament/formats/groupsKnockout';
import type { AvailableFormatName } from '../tournament/formats/registry';

export interface FormatSelection {
  format: AvailableFormatName;
  matchDurationMinutes: number;
  includeThirdPlace: boolean;
  numGroups: number;
  qualifiersPerGroup: number;
}

export function defaultFormatSelection(): FormatSelection {
  return {
    format: 'single_elimination',
    matchDurationMinutes: 15,
    includeThirdPlace: true,
    numGroups: 2,
    qualifiersPerGroup: 2,
  };
}

/** Builds the matches for one discipline, shared by the "new tournament" wizard and "add discipline" flow. */
export function buildMatches(selection: FormatSelection, entries: Entry[]): { formatConfig: FormatConfig; validation: ValidationResult; matches: Match[] } {
  if (selection.format === 'single_elimination') {
    const formatConfig = { durationMinutes: selection.matchDurationMinutes, includeThirdPlace: selection.includeThirdPlace };
    const validation = singleElimination.validate(entries, formatConfig);
    return { formatConfig, validation, matches: validation.valid ? singleElimination.generate(entries, formatConfig) : [] };
  }
  if (selection.format === 'groups_knockout') {
    const formatConfig = {
      durationMinutes: selection.matchDurationMinutes,
      numGroups: selection.numGroups,
      qualifiersPerGroup: selection.qualifiersPerGroup,
      includeThirdPlace: selection.includeThirdPlace,
    };
    const validation = groupsKnockout.validate(entries, formatConfig);
    return { formatConfig, validation, matches: validation.valid ? groupsKnockout.generate(entries, formatConfig) : [] };
  }
  const formatConfig = { durationMinutes: selection.matchDurationMinutes };
  const validation = roundRobin.validate(entries, formatConfig);
  return { formatConfig, validation, matches: validation.valid ? roundRobin.generate(entries, formatConfig) : [] };
}
