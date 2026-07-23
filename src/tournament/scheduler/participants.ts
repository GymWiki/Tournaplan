import type { Entry, EntryId, Match, ParticipantId, Slot } from '../types';

/**
 * Participants a match's outcome concerns, resolved only for 'entry' slots. Placeholder slots
 * (winner_of, loser_of, group_rank, bye) don't name a participant yet — without results, the
 * scheduler simply can't enforce "one match at a time" for a side that isn't resolved yet.
 */
export function matchParticipants(match: Match, entryById: Map<EntryId, Entry>): ParticipantId[] {
  const ids = new Set<ParticipantId>();
  for (const slot of [match.home, match.away]) {
    for (const id of slotParticipants(slot, entryById)) ids.add(id);
  }
  return [...ids];
}

function slotParticipants(slot: Slot, entryById: Map<EntryId, Entry>): ParticipantId[] {
  if (slot.kind !== 'entry') return [];
  return entryById.get(slot.entryId)?.participantIds ?? [];
}
