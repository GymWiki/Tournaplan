import { useState } from 'react';
import type { Discipline, DisciplineId, Entry, EntryId, Match, MatchId, Participant, Resource } from '../tournament/types';
import { ScheduleByTime } from './ScheduleByTime';
import { ScheduleByResource } from './ScheduleByResource';
import { ScheduleByParticipant } from './ScheduleByParticipant';

const tabs = ['Per veld', 'Per tijd', 'Per deelnemer'] as const;
type Tab = (typeof tabs)[number];

interface ScheduleTabsProps {
  matches: Match[];
  resources: Resource[];
  participants: Participant[];
  disciplines: Discipline[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  startTime?: Date;
}

export function ScheduleTabs({ matches, resources, participants, disciplines, entryById, matchById, startTime }: ScheduleTabsProps) {
  const [tab, setTab] = useState<Tab>('Per veld');
  const resourceNameById = new Map(resources.map((r) => [r.id, r.name]));
  // Only tag matches with their discipline once there's more than one — a single-discipline
  // schedule already makes that clear from the page heading.
  const disciplineNameById = new Map<DisciplineId, string>(disciplines.length > 1 ? disciplines.map((d) => [d.id, d.name]) : []);

  return (
    <div>
      <div className="no-print mb-4 flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium ${t === tab ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Per tijd' && (
        <ScheduleByTime
          matches={matches}
          entryById={entryById}
          matchById={matchById}
          resourceNameById={resourceNameById}
          disciplineNameById={disciplineNameById}
          startTime={startTime}
        />
      )}
      {tab === 'Per veld' && (
        <ScheduleByResource
          matches={matches}
          resources={resources}
          entryById={entryById}
          matchById={matchById}
          disciplineNameById={disciplineNameById}
          startTime={startTime}
        />
      )}
      {tab === 'Per deelnemer' && (
        <ScheduleByParticipant
          matches={matches}
          participants={participants}
          entryById={entryById}
          matchById={matchById}
          resourceNameById={resourceNameById}
          disciplineNameById={disciplineNameById}
          startTime={startTime}
        />
      )}
    </div>
  );
}
