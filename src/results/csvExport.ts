import type { Entry, EntryId, Match, MatchId, Resource } from '../tournament/types';
import { slotLabel } from './slotLabel';

function csvEscape(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Builds CSV for one resource's schedule, chronologically. A Discipline column is added only when needed to disambiguate. */
export function buildResourceCsv(
  matches: Match[],
  resource: Resource,
  entryById: Map<EntryId, Entry>,
  matchById: Map<MatchId, Match>,
  disciplineNameById: Map<string, string>,
): string {
  const forResource = matches
    .filter((m) => m.resourceId === resource.id && m.startsAt !== undefined)
    .sort((a, b) => a.startsAt!.getTime() - b.startsAt!.getTime());

  const includeDiscipline = disciplineNameById.size > 0;
  const header = includeDiscipline ? ['Tijd', 'Discipline', 'Wedstrijd', 'Thuis', 'Uit'] : ['Tijd', 'Wedstrijd', 'Thuis', 'Uit'];

  const rows = forResource.map((m) => {
    const time = formatDateTime(m.startsAt!);
    const home = slotLabel(m.home, entryById, matchById);
    const away = slotLabel(m.away, entryById, matchById);
    const cells = includeDiscipline ? [time, disciplineNameById.get(m.disciplineId) ?? '', m.label, home, away] : [time, m.label, home, away];
    return cells.map(csvEscape).join(',');
  });

  return [header.join(','), ...rows].join('\r\n');
}
