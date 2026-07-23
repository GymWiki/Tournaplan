import { useState } from 'react';
import type { Entry, EntryId, Match, MatchId, Participant, Resource } from '../tournament/types';
import { ScheduleByTime } from './ScheduleByTime';
import { ScheduleByResource } from './ScheduleByResource';
import { ScheduleByParticipant } from './ScheduleByParticipant';

const tabs = ['Per tijd', 'Per veld', 'Per deelnemer'] as const;
type Tab = (typeof tabs)[number];

interface ScheduleTabsProps {
  matches: Match[];
  resources: Resource[];
  participants: Participant[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
}

export function ScheduleTabs({ matches, resources, participants, entryById, matchById }: ScheduleTabsProps) {
  const [tab, setTab] = useState<Tab>('Per tijd');
  const resourceNameById = new Map(resources.map((r) => [r.id, r.name]));

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-gray-200">
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

      {tab === 'Per tijd' && <ScheduleByTime matches={matches} entryById={entryById} matchById={matchById} resourceNameById={resourceNameById} />}
      {tab === 'Per veld' && <ScheduleByResource matches={matches} resources={resources} entryById={entryById} matchById={matchById} />}
      {tab === 'Per deelnemer' && (
        <ScheduleByParticipant matches={matches} participants={participants} entryById={entryById} matchById={matchById} resourceNameById={resourceNameById} />
      )}
    </div>
  );
}
