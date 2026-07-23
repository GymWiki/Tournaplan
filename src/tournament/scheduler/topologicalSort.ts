import type { Match } from '../types';

/**
 * Orders matches so every dependsOn prerequisite comes before its dependent, breaking ties by
 * round. Throws on a cyclic dependsOn graph — that's a data-integrity bug in a bracket generator,
 * not a scheduling conflict, so it's not reported via SchedulingReport.
 */
export function topologicalOrder(matches: Match[]): Match[] {
  const remaining = new Map(matches.map((m) => [m.id, m]));
  const result: Match[] = [];

  while (remaining.size > 0) {
    const ready = [...remaining.values()].filter((m) => m.dependsOn.every((dep) => !remaining.has(dep)));

    if (ready.length === 0) {
      throw new Error('Cyclische afhankelijkheid tussen wedstrijden gedetecteerd.');
    }

    ready.sort((a, b) => a.round - b.round || a.id.localeCompare(b.id));
    for (const m of ready) {
      result.push(m);
      remaining.delete(m.id);
    }
  }

  return result;
}
