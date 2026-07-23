import type { Tournament } from '../../tournament/types';
import { defaultFormatSelection, type FormatSelection } from '../formatSelection';

export interface AddDisciplineDraft extends FormatSelection {
  disciplineName: string;
  selectedParticipantIds: string[];
  newParticipantNamesText: string;
  selectedResourceIds: string[];
  newResourceNames: string[];
}

/** Defaults to every existing participant and resource selected — the common case is the same
 * teams and fields serving a second sport, with the organizer deselecting the exceptions. */
export function defaultAddDisciplineDraft(tournament: Tournament): AddDisciplineDraft {
  return {
    ...defaultFormatSelection(),
    disciplineName: '',
    selectedParticipantIds: tournament.participants.map((p) => p.id),
    newParticipantNamesText: '',
    selectedResourceIds: tournament.resources.map((r) => r.id),
    newResourceNames: [],
  };
}
