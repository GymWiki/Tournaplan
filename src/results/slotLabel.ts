import type { Entry, EntryId, Match, MatchId, Slot } from '../tournament/types';

/** Renders a Slot the way a printed schedule should: a real name once known, otherwise the placeholder it stands for. */
export function slotLabel(slot: Slot, entryById: Map<EntryId, Entry>, matchById: Map<MatchId, Match>): string {
  switch (slot.kind) {
    case 'entry':
      return entryById.get(slot.entryId)?.name ?? 'Onbekende deelnemer';
    case 'winner_of':
      return `Winnaar van ${matchById.get(slot.matchId)?.label ?? slot.matchId}`;
    case 'loser_of':
      return `Verliezer van ${matchById.get(slot.matchId)?.label ?? slot.matchId}`;
    case 'group_rank':
      return `Nr. ${slot.rank} Poule ${slot.groupId}`;
    case 'bye':
      return 'Bye';
  }
}
