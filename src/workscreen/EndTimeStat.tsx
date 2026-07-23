import type { SchedulingReport } from '../tournament/scheduler';
import { toClockTime } from '../tournament/display/clock';

interface EndTimeStatProps {
  report: SchedulingReport;
  resourceCount: number;
  startTime?: Date;
}

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} uur`;
  return `${hours} uur ${minutes} min`;
}

export function EndTimeStat({ report, resourceCount, startTime }: EndTimeStatProps) {
  const { finishOffsetMinutes, matches, longestWaitMinutesByParticipant } = report;
  const maxWait = Math.max(0, ...Object.values(longestWaitMinutesByParticipant));

  const headline =
    finishOffsetMinutes === null
      ? 'Nog geen schema'
      : startTime
        ? `Klaar om ${toClockTime(finishOffsetMinutes, startTime)}`
        : `Duurt ${formatDuration(finishOffsetMinutes)}`;

  return (
    <div className="rounded-panel border border-line bg-panel p-6">
      <p className="font-display text-3xl font-bold text-ink tabular-nums">{headline}</p>
      {finishOffsetMinutes !== null && (
        <p className="mt-1 text-sm text-ink-muted tabular-nums">
          {matches.length} wedstrijd{matches.length === 1 ? '' : 'en'} · {resourceCount} veld{resourceCount === 1 ? '' : 'en'}
          {maxWait > 0 && <> · laatste team wacht max. {maxWait} min</>}
        </p>
      )}
    </div>
  );
}
