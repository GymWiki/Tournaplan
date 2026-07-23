import type { Tournament } from '../../tournament/types';
import { defaultFormatSelection, type FormatSelection } from '../formatSelection';
import type { EntryModeFields } from '../entryFields';

export interface AddDisciplineDraft extends FormatSelection, EntryModeFields {
  disciplineName: string;
  selectedResourceIds: string[];
  newResourceNames: string[];
}

/** All current participant names, newline-joined — used both as the default prefill and by the
 * "Dezelfde deelnemers overnemen" button if the organizer switched away and wants it back. */
export function existingParticipantNamesText(tournament: Tournament): string {
  return tournament.participants.map((p) => p.name).join('\n');
}

/**
 * Defaults to reusing every existing participant and resource — the common case is the same teams
 * and fields serving a second sport, with the organizer editing the exceptions from there. Actual
 * sharing happens by matching names in build.ts, not by id, so retyping a name that already exists
 * still links back to the same Participant.
 */
export function defaultAddDisciplineDraft(tournament: Tournament): AddDisciplineDraft {
  const hasParticipants = tournament.participants.length > 0;
  return {
    ...defaultFormatSelection(),
    disciplineName: '',
    entryMode: hasParticipants ? 'names' : 'count',
    entryCount: 8,
    participantNamesText: hasParticipants ? existingParticipantNamesText(tournament) : '',
    selectedResourceIds: tournament.resources.map((r) => r.id),
    newResourceNames: [],
  };
}
