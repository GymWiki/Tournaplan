import { useMemo } from 'react';
import type { Tournament } from '../tournament/types';
import { schedule } from '../tournament/scheduler';
import { ConflictsPanel } from '../results/ConflictsPanel';
import { ScheduleTabs } from '../results/ScheduleTabs';
import { EndTimeStat } from './EndTimeStat';

interface SchedulePanelProps {
  tournament: Tournament;
}

export function SchedulePanel({ tournament }: SchedulePanelProps) {
  const hasEntries = tournament.disciplines.some((d) => d.entries.length > 0);
  const report = useMemo(() => schedule(tournament), [tournament]);

  const entryById = useMemo(() => new Map(tournament.disciplines.flatMap((d) => d.entries).map((e) => [e.id, e])), [tournament]);
  const matchById = useMemo(() => new Map(report.matches.map((m) => [m.id, m])), [report.matches]);

  if (!hasEntries) {
    const previewColumns = tournament.resources.length > 0 ? tournament.resources.map((r) => r.name) : ['Veld 1', 'Veld 2', 'Veld 3'];
    return (
      <div className="rounded-panel border border-dashed border-line bg-panel/50 p-8">
        <div className="mx-auto grid max-w-2xl gap-3" style={{ gridTemplateColumns: `repeat(${previewColumns.length}, minmax(0, 1fr))` }}>
          {previewColumns.map((name, i) => (
            <div key={i} className="rounded-block border border-line bg-surface p-3 text-center">
              <p className="mb-2 text-xs font-medium text-ink-muted">{name}</p>
              <div className="h-20 rounded-block bg-line/30" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-muted">Voeg teams toe om het schema te vullen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EndTimeStat report={report} resourceCount={tournament.resources.length} startTime={tournament.startTime} />
      <ConflictsPanel conflicts={report.conflicts} matchById={matchById} />
      <ScheduleTabs
        matches={report.matches}
        resources={tournament.resources}
        participants={tournament.participants}
        disciplines={tournament.disciplines}
        entryById={entryById}
        matchById={matchById}
        startTime={tournament.startTime}
      />
    </div>
  );
}
