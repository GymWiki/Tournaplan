import { useMemo } from 'react';
import type { Entry, EntryId, Match, MatchId, Resource } from '../tournament/types';
import { downloadTextFile } from '../persistence/fileTransfer';
import { buildResourceCsv } from './csvExport';
import { toClockTime } from '../tournament/display/clock';
import { slotLabel } from './slotLabel';
import { disciplineColorBorderClass, type DisciplineColor } from './disciplineColors';

interface ScheduleByResourceProps {
  matches: Match[];
  resources: Resource[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  disciplineNameById: Map<string, string>;
  disciplineColorById?: Map<string, DisciplineColor>;
  startTime?: Date;
}

/**
 * Pixels per minute of the grid's vertical time axis. Chosen so a block never needs a forced
 * minimum height: the scheduler never double-books a resource, so a match's natural height
 * (durationMinutes * PX_PER_MINUTE) is always <= the gap to the next block in that column.
 * Enforcing a floor instead would make short back-to-back matches visually overlap.
 */
const PX_PER_MINUTE = 3;
const GRIDLINE_INTERVAL_MINUTES = 30;

/** Elapsed-time label ("2:15") used when there's no real startTime to show a clock time instead. */
function relativeLabel(offsetMinutes: number): string {
  const hours = Math.floor(offsetMinutes / 60);
  const minutes = offsetMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

export function ScheduleByResource({ matches, resources, entryById, matchById, disciplineNameById, disciplineColorById, startTime }: ScheduleByResourceProps) {
  const scheduled = useMemo(
    () => matches.filter((m): m is Match & { startOffsetMinutes: number; resourceId: string } => m.startOffsetMinutes !== undefined && m.resourceId !== undefined),
    [matches],
  );
  const usedResources = resources.filter((r) => scheduled.some((m) => m.resourceId === r.id));
  const maxEndOffset = scheduled.reduce((max, m) => Math.max(max, m.startOffsetMinutes + m.durationMinutes), 0);

  if (scheduled.length === 0 || usedResources.length === 0) {
    return <p className="text-sm text-ink-muted">Nog geen wedstrijden ingepland.</p>;
  }

  const totalMinutes = Math.ceil(maxEndOffset / GRIDLINE_INTERVAL_MINUTES) * GRIDLINE_INTERVAL_MINUTES;
  const containerHeight = totalMinutes * PX_PER_MINUTE;
  const gridlines: number[] = [];
  for (let t = 0; t <= totalMinutes; t += GRIDLINE_INTERVAL_MINUTES) gridlines.push(t);

  return (
    <div className="overflow-x-auto rounded-block border border-line">
      <div className="flex min-w-fit gap-px bg-line">
        <div className="w-14 shrink-0 bg-panel">
          <div className="h-9 border-b border-line" />
          <div className="relative" style={{ height: containerHeight }}>
            {gridlines.map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 -translate-y-1/2 pr-2 text-right font-mono text-xs tabular-nums text-ink-muted"
                style={{ top: t * PX_PER_MINUTE }}
              >
                {toClockTime(t, startTime) ?? relativeLabel(t)}
              </div>
            ))}
          </div>
        </div>

        {usedResources.map((resource) => {
          const forResource = scheduled.filter((m) => m.resourceId === resource.id);
          return (
            <div key={resource.id} className="min-w-[180px] flex-1 bg-panel">
              <div className="flex h-9 items-center justify-between gap-2 border-b border-line px-2">
                <h3 className="truncate text-sm font-semibold text-ink">{resource.name}</h3>
                <button
                  type="button"
                  onClick={() => downloadTextFile(`${resource.name}.csv`, buildResourceCsv(matches, resource, entryById, matchById, disciplineNameById, startTime), 'text/csv')}
                  className="no-print shrink-0 rounded-block border border-line px-1.5 py-0.5 text-xs text-ink-muted hover:bg-surface"
                >
                  CSV
                </button>
              </div>
              <div className="relative" style={{ height: containerHeight }}>
                {gridlines.map((t) => (
                  <div key={t} className="absolute inset-x-0 border-t border-line/60" style={{ top: t * PX_PER_MINUTE }} />
                ))}
                {forResource.map((match) => {
                  const color = disciplineColorById?.get(match.disciplineId);
                  const top = match.startOffsetMinutes * PX_PER_MINUTE;
                  const height = match.durationMinutes * PX_PER_MINUTE;
                  return (
                    <div
                      key={match.id}
                      className={`absolute inset-x-1 overflow-hidden rounded-block border border-line bg-panel p-1 text-xs leading-tight shadow-sm [break-inside:avoid] border-l-[3px] ${
                        color ? disciplineColorBorderClass[color] : 'border-l-transparent'
                      }`}
                      style={{ top, height }}
                    >
                      <div className="flex items-baseline gap-1.5 text-ink-muted">
                        <span className="font-mono tabular-nums">{toClockTime(match.startOffsetMinutes, startTime) ?? relativeLabel(match.startOffsetMinutes)}</span>
                        {disciplineNameById.get(match.disciplineId) && <span className="truncate">{disciplineNameById.get(match.disciplineId)}</span>}
                      </div>
                      <div className="truncate font-medium text-ink">
                        {slotLabel(match.home, entryById, matchById)} <span className="text-ink-muted">–</span> {slotLabel(match.away, entryById, matchById)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
