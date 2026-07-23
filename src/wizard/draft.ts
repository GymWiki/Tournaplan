import { defaultFormatSelection, type FormatSelection } from './formatSelection';
import { defaultEntryModeFields, type EntryModeFields } from './entryFields';

export interface WizardDraft extends FormatSelection, EntryModeFields {
  tournamentName: string;
  disciplineName: string;
  resourceNames: string[];
}

export function defaultDraft(): WizardDraft {
  return {
    ...defaultFormatSelection(),
    ...defaultEntryModeFields(),
    tournamentName: '',
    disciplineName: '',
    resourceNames: ['Veld 1'],
  };
}

export { parseParticipantNames } from './entryNames';
