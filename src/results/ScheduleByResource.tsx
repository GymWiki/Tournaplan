import type { Entry, EntryId, Match, MatchId, Resource } from '../tournament/types';
import { MatchRow } from './MatchRow';

interface ScheduleByResourceProps {
  matches: Match[];
  resources: Resource[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  disciplineNameById: Map<string, string>;
}

export function ScheduleByResource({ matches, resources, entryById, matchById, disciplineNameById }: ScheduleByResourceProps) {
  const scheduled = matches.filter((m) => m.startsAt !== undefined && m.resourceId !== undefined);

  if (scheduled.length === 0) {
    return <p className="text-sm text-gray-500">Nog geen wedstrijden ingepland.</p>;
  }

  return (
    <div className="space-y-6">
      {resources.map((resource) => {
        const forResource = scheduled.filter((m) => m.resourceId === resource.id).sort((a, b) => a.startsAt!.getTime() - b.startsAt!.getTime());
        if (forResource.length === 0) return null;
        return (
          <div key={resource.id}>
            <h3 className="mb-1 text-sm font-semibold text-gray-900">{resource.name}</h3>
            {forResource.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                entryById={entryById}
                matchById={matchById}
                showResource={false}
                disciplineName={disciplineNameById.get(match.disciplineId)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
