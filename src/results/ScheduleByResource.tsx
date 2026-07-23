import type { Entry, EntryId, Match, MatchId, Resource } from '../tournament/types';
import { downloadTextFile } from '../persistence/fileTransfer';
import { buildResourceCsv } from './csvExport';
import { MatchRow } from './MatchRow';

interface ScheduleByResourceProps {
  matches: Match[];
  resources: Resource[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  disciplineNameById: Map<string, string>;
  startTime?: Date;
}

export function ScheduleByResource({ matches, resources, entryById, matchById, disciplineNameById, startTime }: ScheduleByResourceProps) {
  const scheduled = matches.filter((m) => m.startOffsetMinutes !== undefined && m.resourceId !== undefined);

  if (scheduled.length === 0) {
    return <p className="text-sm text-gray-500">Nog geen wedstrijden ingepland.</p>;
  }

  return (
    <div className="space-y-6">
      {resources.map((resource) => {
        const forResource = scheduled.filter((m) => m.resourceId === resource.id).sort((a, b) => a.startOffsetMinutes! - b.startOffsetMinutes!);
        if (forResource.length === 0) return null;
        return (
          <div key={resource.id}>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">{resource.name}</h3>
              <button
                type="button"
                onClick={() => downloadTextFile(`${resource.name}.csv`, buildResourceCsv(matches, resource, entryById, matchById, disciplineNameById, startTime), 'text/csv')}
                className="no-print rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                CSV
              </button>
            </div>
            {forResource.map((match, index) => (
              <MatchRow
                key={match.id}
                match={match}
                entryById={entryById}
                matchById={matchById}
                showResource={false}
                disciplineName={disciplineNameById.get(match.disciplineId)}
                startTime={startTime}
                fallbackLabel={`Wedstrijd ${index + 1}`}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
