import type { Entry, EntryId, Match, MatchId } from '../tournament/types';
import { MatchRow } from './MatchRow';

interface ScheduleByTimeProps {
  matches: Match[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  resourceNameById: Map<string, string>;
  disciplineNameById: Map<string, string>;
  startTime?: Date;
}

export function ScheduleByTime({ matches, entryById, matchById, resourceNameById, disciplineNameById, startTime }: ScheduleByTimeProps) {
  const scheduled = matches
    .filter((m): m is Match & { startOffsetMinutes: number } => m.startOffsetMinutes !== undefined)
    .sort((a, b) => a.startOffsetMinutes - b.startOffsetMinutes);

  if (scheduled.length === 0) {
    return <p className="text-sm text-gray-500">Nog geen wedstrijden ingepland.</p>;
  }

  return (
    <div>
      {scheduled.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          entryById={entryById}
          matchById={matchById}
          resourceName={resourceNameById.get(match.resourceId!)}
          disciplineName={disciplineNameById.get(match.disciplineId)}
          startTime={startTime}
        />
      ))}
    </div>
  );
}
