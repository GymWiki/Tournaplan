import type { Entry, EntryId, Match, MatchId } from '../tournament/types';
import { toClockTime } from '../tournament/display/clock';
import { slotLabel } from './slotLabel';

interface BracketMatchCardProps {
  match: Match;
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  startTime?: Date;
}

export function BracketMatchCard({ match, entryById, matchById, startTime }: BracketMatchCardProps) {
  const clockTime = match.startOffsetMinutes !== undefined ? toClockTime(match.startOffsetMinutes, startTime) : null;

  return (
    <div className="w-48 rounded-md border border-gray-200 bg-white p-2 text-xs shadow-sm [break-inside:avoid]">
      <p className="mb-1 truncate text-gray-500">{match.label}</p>
      <p className="truncate font-medium text-gray-900">{slotLabel(match.home, entryById, matchById)}</p>
      <p className="truncate font-medium text-gray-900">{slotLabel(match.away, entryById, matchById)}</p>
      {clockTime && <p className="mt-1 text-gray-400">{clockTime}</p>}
    </div>
  );
}
