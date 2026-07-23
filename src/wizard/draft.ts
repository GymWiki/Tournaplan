import type { AvailableFormatName } from '../tournament/formats/registry';

export interface WizardDraft {
  tournamentName: string;
  disciplineName: string;
  format: AvailableFormatName;
  includeThirdPlace: boolean;
  numGroups: number;
  qualifiersPerGroup: number;
  participantNamesText: string;
  matchDurationMinutes: number;
  resourceNames: string[];
  /** <input type="datetime-local"> value, e.g. "2026-08-01T09:00". */
  windowStartLocal: string;
  windowEndLocal: string;
}

export function defaultDraft(): WizardDraft {
  return {
    tournamentName: '',
    disciplineName: '',
    format: 'single_elimination',
    includeThirdPlace: true,
    numGroups: 2,
    qualifiersPerGroup: 2,
    participantNamesText: '',
    matchDurationMinutes: 15,
    resourceNames: ['Veld 1'],
    windowStartLocal: '',
    windowEndLocal: '',
  };
}

export function parseParticipantNames(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
