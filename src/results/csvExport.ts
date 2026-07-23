import type { Entry, EntryId, Match, MatchId, Resource } from '../tournament/types';
import { toClockTime } from '../tournament/display/clock';
import { slotLabel } from './slotLabel';

function csvEscape(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Builds CSV for one resource's schedule, chronologically. A Discipline column is added only when
 * needed to disambiguate. Without a startTime, the first column is the running order instead of a
 * clock time — there's no time window to anchor to, so a printed sheet still needs some ordering. */
export function buildResourceCsv(
  matches: Match[],
  resource: Resource,
  entryById: Map<EntryId, Entry>,
  matchById: Map<MatchId, Match>,
  disciplineNameById: Map<string, string>,
  startTime?: Date,
): string {
  const forResource = matches
    .filter((m) => m.resourceId === resource.id && m.startOffsetMinutes !== undefined)
    .sort((a, b) => a.startOffsetMinutes! - b.startOffsetMinutes!);

  const includeDiscipline = disciplineNameById.size > 0;
  const timeColumn = startTime ? 'Tijd' : 'Volgorde';
  const header = includeDiscipline ? [timeColumn, 'Discipline', 'Wedstrijd', 'Thuis', 'Uit'] : [timeColumn, 'Wedstrijd', 'Thuis', 'Uit'];

  const rows = forResource.map((m, index) => {
    const time = toClockTime(m.startOffsetMinutes!, startTime) ?? String(index + 1);
    const home = slotLabel(m.home, entryById, matchById);
    const away = slotLabel(m.away, entryById, matchById);
    const cells = includeDiscipline ? [time, disciplineNameById.get(m.disciplineId) ?? '', m.label, home, away] : [time, m.label, home, away];
    return cells.map(csvEscape).join(',');
  });

  return [header.join(','), ...rows].join('\r\n');
}
