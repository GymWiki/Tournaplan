import { singleElimination } from '../formats/singleElimination';
import { roundRobin } from '../formats/roundRobin';
import { groupsKnockout } from '../formats/groupsKnockout';
import type { Discipline, Entry, Participant, Resource, Tournament, TournamentFormatName } from '../types';
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

  return { id, name: id, format, formatConfig: config, entries, matches };
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

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Deterministic random tournament generator, used to fuzz-test the scheduler's hard constraints.
 * Up to 3 disciplines, each independently deciding whether to reuse the shared participant pool —
 * so seeds cover every combination of two or three disciplines sharing (or not sharing) entries.
 * Resources independently get "all disciplines" (empty), a single discipline, or a random subset,
 * exercising the resourcesByDiscipline eligibility rules directly.
 */
export function randomTournament(seed: number): Tournament {
  const rng = mulberry32(seed);
  const int = (min: number, max: number) => min + Math.floor(rng() * (max - min + 1));
  const pick = <T,>(options: T[]): T => options[int(0, options.length - 1)]!;

  const numDisciplines = int(1, 3);
  const disciplines: Discipline[] = [];
  const sharedParticipants = makeParticipants(int(4, 10), 'shared');

  for (let d = 0; d < numDisciplines; d++) {
    const id = `disc${d}`;
    const useShared = rng() < 0.5;
    const entryCount = useShared ? sharedParticipants.length : int(2, 20);
    const participants = useShared ? sharedParticipants : makeParticipants(entryCount, `${id}-p`);
    const entries = makeEntries(id, participants);

    const durationMinutes = int(10, 40);

    const formatPool: TournamentFormatName[] = entries.length >= 4 ? ['single_elimination', 'round_robin', 'groups_knockout'] : ['single_elimination', 'round_robin'];
    const format = entries.length < 2 ? 'round_robin' : pick(formatPool);

    const discipline = buildDiscipline(id, format, entries, durationMinutes, format === 'groups_knockout' ? { numGroups: 2, qualifiersPerGroup: 1 } : {});
    disciplines.push(discipline);
  }

  const disciplineIds = disciplines.map((d) => d.id);
  const resourceCount = int(1, 4) * numDisciplines;
  const resources: Resource[] = Array.from({ length: resourceCount }, (_, i) => {
    const r = rng();
    const eligibleIds =
      numDisciplines === 1 || r < 0.34
        ? [] // all disciplines
        : r < 0.67
          ? [pick(disciplineIds)] // exactly one
          : shuffle(disciplineIds, rng).slice(0, int(1, disciplineIds.length)); // random subset

    return { id: `r${i + 1}`, name: `Veld ${i + 1}`, disciplineIds: eligibleIds };
  });

  return buildTournament(disciplines, resources);
}
