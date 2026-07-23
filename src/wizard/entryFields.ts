import { dedupeNames, generateCountNames, parseParticipantNames } from './entryNames';

/** Shared shape between the "new tournament" wizard and the "add discipline" flow's entry step. */
export interface EntryModeFields {
  entryMode: 'count' | 'names';
  entryCount: number;
  participantNamesText: string;
}

export function defaultEntryModeFields(): EntryModeFields {
  return { entryMode: 'count', entryCount: 8, participantNamesText: '' };
}

/** The final ordered list of entry names — this order is the seeding order. */
export function resolveEntryNames(fields: EntryModeFields): string[] {
  if (fields.entryMode === 'count') return generateCountNames(fields.entryCount);
  return dedupeNames(parseParticipantNames(fields.participantNamesText));
}
