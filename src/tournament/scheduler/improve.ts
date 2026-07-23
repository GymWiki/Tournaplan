import type { DisciplineId, Entry, EntryId, Match, ParticipantId, Resource, ResourceId } from '../types';
import { type Interval, overlaps } from './intervals';
import { matchParticipants } from './participants';
import { computeScore } from './metrics';

function isFeasible(matches: Match[], entryById: Map<EntryId, Entry>): boolean {
  const byId = new Map(matches.map((m) => [m.id, m]));
  const resourceIntervals = new Map<ResourceId, Interval[]>();
  const participantIntervals = new Map<ParticipantId, Interval[]>();

  for (const m of matches) {
    if (!m.resourceId || m.startOffsetMinutes === undefined) return false;

    const start = m.startOffsetMinutes;
    const end = start + m.durationMinutes;

    for (const depId of m.dependsOn) {
      const dep = byId.get(depId);
      if (dep?.startOffsetMinutes !== undefined && start < dep.startOffsetMinutes + dep.durationMinutes) return false;
    }

    const rList = resourceIntervals.get(m.resourceId) ?? [];
    if (rList.some((iv) => overlaps(iv, start, end))) return false;
    resourceIntervals.set(m.resourceId, [...rList, { start, end }]);

    for (const pid of matchParticipants(m, entryById)) {
      const pList = participantIntervals.get(pid) ?? [];
      if (pList.some((iv) => overlaps(iv, start, end))) return false;
      participantIntervals.set(pid, [...pList, { start, end }]);
    }
  }

  return true;
}

/**
 * Local search (Aanpak stap 4): repeatedly try swapping the (resource, start) assignment of two
 * scheduled matches, keeping the swap only if it stays hard-constraint-feasible and improves the
 * soft-constraint score.
 */
export function improveSchedule(
  scheduledMatches: Match[],
  resourcesByDiscipline: Map<DisciplineId, Resource[]>,
  entryById: Map<EntryId, Entry>,
  minRestMinutes: number,
  iterations: number,
  rng: () => number,
): Match[] {
  if (scheduledMatches.length < 2) return scheduledMatches;

  let current = scheduledMatches;
  let currentScore = computeScore(current, entryById, minRestMinutes);

  for (let i = 0; i < iterations; i++) {
    const idxA = Math.floor(rng() * current.length);
    let idxB = Math.floor(rng() * current.length);
    if (idxB === idxA) idxB = (idxB + 1) % current.length;

    const a = current[idxA]!;
    const b = current[idxB]!;

    const resourcesForA = resourcesByDiscipline.get(a.disciplineId) ?? [];
    const resourcesForB = resourcesByDiscipline.get(b.disciplineId) ?? [];
    if (!resourcesForA.some((r) => r.id === b.resourceId) || !resourcesForB.some((r) => r.id === a.resourceId)) continue;

    const candidateA: Match = { ...a, resourceId: b.resourceId, startOffsetMinutes: b.startOffsetMinutes };
    const candidateB: Match = { ...b, resourceId: a.resourceId, startOffsetMinutes: a.startOffsetMinutes };
    const trial = current.map((m, idx) => (idx === idxA ? candidateA : idx === idxB ? candidateB : m));

    if (!isFeasible(trial, entryById)) continue;

    const trialScore = computeScore(trial, entryById, minRestMinutes);
    if (trialScore < currentScore) {
      current = trial;
      currentScore = trialScore;
    }
  }

  return current;
}
