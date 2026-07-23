import type { Entry, EntryId, Match, MatchId } from '../tournament/types';
import { slotLabel } from './slotLabel';

interface BracketMatchCardProps {
  match: Match;
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
}

export function BracketMatchCard({ match, entryById, matchById }: BracketMatchCardProps) {
  return (
    <div className="w-48 rounded-md border border-gray-200 bg-white p-2 text-xs shadow-sm">
      <p className="mb-1 truncate text-gray-500">{match.label}</p>
      <p className="truncate font-medium text-gray-900">{slotLabel(match.home, entryById, matchById)}</p>
      <p className="truncate font-medium text-gray-900">{slotLabel(match.away, entryById, matchById)}</p>
      {match.startsAt && (
        <p className="mt-1 text-gray-400">
          {match.startsAt.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}
