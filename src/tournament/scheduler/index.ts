import type { Tournament } from '../types';
import type { ScheduleOptions, SchedulingReport } from './types';
import { topologicalOrder } from './topologicalSort';
import { placeMatches } from './placement';
import { improveSchedule } from './improve';
import { computeFinishOffsetMinutes, computeLongestWaitMinutes, computeResourceUtilization, computeScore } from './metrics';
import { resourcesByDiscipline } from './resourceEligibility';
import { mulberry32 } from './rng';

export type { ScheduleOptions, SchedulingConflict, SchedulingReport } from './types';

/**
 * Schedules every match of every discipline in the tournament across the shared resources.
 * Knows nothing about sports — only matches (duration, dependsOn), resources — and nothing about
 * clock time either: everything is minute offsets from the tournament's zero point.
 */
export function schedule(tournament: Tournament, options: ScheduleOptions = {}): SchedulingReport {
  const minRestMinutes = options.minRestMinutes ?? 15;
  const improvementIterations = options.improvementIterations ?? 200;

  const disciplineById = new Map(tournament.disciplines.map((d) => [d.id, d]));
  const entryById = new Map(tournament.disciplines.flatMap((d) => d.entries).map((e) => [e.id, e]));
  const eligibleResources = resourcesByDiscipline(tournament.disciplines, tournament.resources);

  const allMatches = tournament.disciplines.flatMap((d) => d.matches);
  const ordered = topologicalOrder(allMatches);
  const { scheduled, conflicts } = placeMatches(ordered, disciplineById, eligibleResources, entryById);

  const improved = improveSchedule([...scheduled.values()], eligibleResources, entryById, minRestMinutes, improvementIterations, mulberry32(1));
  const improvedById = new Map(improved.map((m) => [m.id, m]));

  const matches = allMatches.map((m) => improvedById.get(m.id) ?? m);

  return {
    matches,
    conflicts,
    score: computeScore(matches, entryById, minRestMinutes),
    resourceUtilization: computeResourceUtilization(matches),
    longestWaitMinutesByParticipant: computeLongestWaitMinutes(matches, entryById),
    finishOffsetMinutes: computeFinishOffsetMinutes(matches),
  };
}
