import type { Entry, EntryId, Match, MatchId } from '../tournament/types';
import { toClockTime } from '../tournament/display/clock';
import { slotLabel } from './slotLabel';

interface MatchRowProps {
  match: Match;
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  resourceName?: string;
  /** Real-world anchor for offset 0. When absent, `fallbackLabel` is shown instead of a clock time. */
  startTime?: Date;
  /** Shown in the time column when there's no startTime to compute a clock time from, e.g. "Wedstrijd 3". */
  fallbackLabel?: string;
  /** Shown as a badge before the label — needed once a tournament has more than one discipline,
   * since two disciplines can independently produce matches with the exact same label (e.g. two
   * round-robins both have a "Ronde 1 - wedstrijd 1"). */
  disciplineName?: string;
  showTime?: boolean;
  showResource?: boolean;
}

export function MatchRow({ match, entryById, matchById, resourceName, startTime, fallbackLabel, disciplineName, showTime = true, showResource = true }: MatchRowProps) {
  const clockTime = match.startOffsetMinutes !== undefined ? toClockTime(match.startOffsetMinutes, startTime) : null;
  const timeLabel = match.startOffsetMinutes === undefined ? '—' : (clockTime ?? fallbackLabel ?? '');

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-2 text-sm last:border-0 [break-inside:avoid]">
      <div className="flex items-baseline gap-3">
        {showTime && <span className={`shrink-0 whitespace-nowrap text-gray-500 ${clockTime ? 'w-12 font-mono' : ''}`}>{timeLabel}</span>}
        {disciplineName && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{disciplineName}</span>}
        <span className="text-gray-400">{match.label}</span>
      </div>
      <div className="flex-1 text-center font-medium text-gray-900">
        {slotLabel(match.home, entryById, matchById)} <span className="text-gray-400">vs</span> {slotLabel(match.away, entryById, matchById)}
      </div>
      {showResource && <span className="w-24 shrink-0 text-right text-gray-500">{resourceName ?? '—'}</span>}
    </div>
  );
}
