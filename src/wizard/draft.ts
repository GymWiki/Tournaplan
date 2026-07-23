import { defaultFormatSelection, type FormatSelection } from './formatSelection';

export interface WizardDraft extends FormatSelection {
  tournamentName: string;
  disciplineName: string;
  participantNamesText: string;
  resourceNames: string[];
  /** <input type="datetime-local"> value, e.g. "2026-08-01T09:00". */
  windowStartLocal: string;
  windowEndLocal: string;
}

export function defaultDraft(): WizardDraft {
  return {
    ...defaultFormatSelection(),
    tournamentName: '',
    disciplineName: '',
    participantNamesText: '',
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
