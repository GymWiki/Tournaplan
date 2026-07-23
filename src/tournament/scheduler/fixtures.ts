import { singleElimination } from '../formats/singleElimination';
import { roundRobin } from '../formats/roundRobin';
import { groupsKnockout } from '../formats/groupsKnockout';
import type { Discipline, Entry, Participant, Resource, TimeWindow, Tournament, TournamentFormatName } from '../types';
import { mulberry32 } from './rng';

export function makeParticipants(count: number, prefix = 'p'): Participant[] {
  return Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i + 1}`, name: `Deelnemer ${prefix}${i + 1}` }));
}

export function makeEntries(disciplineId: string, participants: Participant[]): Entry[] {
  return participants.map((p, i) => ({
    id: `${disciplineId}-e${i + 1}`,
    disciplineId,
    name: `Entry ${i + 1}`,
    participantIds: [p.id],
  }));
}

export function makeWindow(startISO: string, endISO: string): TimeWindow {
  return { start: new Date(startISO), end: new Date(endISO) };
}

export function makeResources(count: number, disciplineIds: string[], idPrefix = 'r'): Resource[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${idPrefix}${i + 1}`,
    name: `Veld ${i + 1}`,
    disciplineIds,
  }));
}

export function buildDiscipline(
  id: string,
  format: TournamentFormatName,
  entries: Entry[],
  durationMinutes: number,
  window: TimeWindow,
  extraConfig: Record<string, unknown> = {},
): Discipline {
  const config = { durationMinutes, ...extraConfig };
  const matches =
    format === 'single_elimination'
      ? singleElimination.generate(entries, config)
      : format === 'round_robin'
        ? roundRobin.generate(entries, config)
        : format === 'groups_knockout'
          ? groupsKnockout.generate(entries, config as { durationMinutes: number; numGroups: number })
          : [];

  return { id, name: id, format, formatConfig: config, entries, matches, timeWindow: window };
}

export function buildTournament(disciplines: Discipline[], resources: Resource[]): Tournament {
  const participantIds = new Set(disciplines.flatMap((d) => d.entries.flatMap((e) => e.participantIds)));
  return {
    id: 't1',
    name: 'Test toernooi',
    participants: [...participantIds].map((id) => ({ id, name: id })),
    disciplines,
    resources,
  };
}

/** Deterministic random tournament generator, used to fuzz-test the scheduler's hard constraints. */
export function randomTournament(seed: number): Tournament {
  const rng = mulberry32(seed);
  const int = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
  const pick = <T,>(options: T[]): T => options[int(0, options.length - 1)]!;

  const numDisciplines = int(1, 2);
  const disciplines: Discipline[] = [];
  const sharedParticipants = makeParticipants(int(4, 10), 'shared');
  const windowStart = Date.UTC(2026, 7, 1, 9, 0);

  for (let d = 0; d < numDisciplines; d++) {
    const id = `disc${d}`;
    const useShared = d > 0 && rng() < 0.6;
    const entryCount = useShared ? sharedParticipants.length : int(2, 20);
    const participants = useShared ? sharedParticipants : makeParticipants(entryCount, `${id}-p`);
    const entries = makeEntries(id, participants);

    const durationMinutes = int(10, 40);
    const windowMinutes = int(60, 600);
    const window = makeWindow(new Date(windowStart).toISOString(), new Date(windowStart + windowMinutes * 60_000).toISOString());

    const formatPool: TournamentFormatName[] = entries.length >= 4 ? ['single_elimination', 'round_robin', 'groups_knockout'] : ['single_elimination', 'round_robin'];
    const format = entries.length < 2 ? 'round_robin' : pick(formatPool);

    const discipline = buildDiscipline(
      id,
      format,
      entries,
      durationMinutes,
      window,
      format === 'groups_knockout' ? { numGroups: 2, qualifiersPerGroup: 1 } : {},
    );
    disciplines.push(discipline);
  }

  const resourceCount = int(1, 4);
  const shareResources = numDisciplines > 1 && rng() < 0.5;
  const resources: Resource[] = shareResources
    ? makeResources(
        resourceCount,
        disciplines.map((d) => d.id),
      )
    : disciplines.flatMap((d, i) => makeResources(resourceCount, [d.id], `${d.id}-r${i}-`));

  return buildTournament(disciplines, resources);
}
