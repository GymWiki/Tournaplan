import { defaultFormatSelection, type FormatSelection } from './formatSelection';

export interface WizardDraft extends FormatSelection {
  tournamentName: string;
  disciplineName: string;
  participantNamesText: string;
  resourceNames: string[];
}

export function defaultDraft(): WizardDraft {
  return {
    ...defaultFormatSelection(),
    tournamentName: '',
    disciplineName: '',
    participantNamesText: '',
    resourceNames: ['Veld 1'],
  };
}

export function parseParticipantNames(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
