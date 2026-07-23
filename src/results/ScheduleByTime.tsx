import type { Entry, EntryId, Match, MatchId } from '../tournament/types';
import { MatchRow } from './MatchRow';

interface ScheduleByTimeProps {
  matches: Match[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  resourceNameById: Map<string, string>;
}

export function ScheduleByTime({ matches, entryById, matchById, resourceNameById }: ScheduleByTimeProps) {
  const scheduled = matches
    .filter((m): m is Match & { startsAt: Date } => m.startsAt !== undefined)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  if (scheduled.length === 0) {
    return <p className="text-sm text-gray-500">Nog geen wedstrijden ingepland.</p>;
  }

  return (
    <div>
      {scheduled.map((match) => (
        <MatchRow key={match.id} match={match} entryById={entryById} matchById={matchById} resourceName={resourceNameById.get(match.resourceId!)} />
      ))}
    </div>
  );
}
