import type { Entry, EntryId, Match, ParticipantId, ResourceId } from '../types';
import { matchParticipants } from './participants';

function scheduledMatchesByParticipant(matches: Match[], entryById: Map<EntryId, Entry>): Map<ParticipantId, Match[]> {
  const map = new Map<ParticipantId, Match[]>();
  for (const m of matches) {
    if (m.startOffsetMinutes === undefined) continue;
    for (const pid of matchParticipants(m, entryById)) {
      const list = map.get(pid) ?? [];
      list.push(m);
      map.set(pid, list);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startOffsetMinutes! - b.startOffsetMinutes!);
  }
  return map;
}

/** Gaps in minutes between each match and the one before it (empty for a single-match list). */
function gapsMinutes(sorted: Match[]): number[] {
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = sorted[i - 1]!.startOffsetMinutes! + sorted[i - 1]!.durationMinutes;
    const nextStart = sorted[i]!.startOffsetMinutes!;
    gaps.push(nextStart - prevEnd);
  }
  return gaps;
}

function resourceImbalance(matches: Match[]): number {
  const busyByResource = new Map<ResourceId, number>();
  for (const m of matches) {
    if (!m.resourceId) continue;
    busyByResource.set(m.resourceId, (busyByResource.get(m.resourceId) ?? 0) + m.durationMinutes);
  }
  const values = [...busyByResource.values()];
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Soft-constraint penalty (constraints 6-9) — lower is better, 0 is perfect. Not an exact science:
 * rest-time deficits and long same-participant streaks are weighted heaviest, then idle waiting,
 * then uneven resource use.
 */
export function computeScore(matches: Match[], entryById: Map<EntryId, Entry>, minRestMinutes: number): number {
  const byParticipant = scheduledMatchesByParticipant(matches, entryById);
  let restDeficitMinutes = 0;
  let streakPenalty = 0;
  let excessWaitMinutes = 0;
  const closeGapThreshold = minRestMinutes * 2;

  for (const list of byParticipant.values()) {
    let streak = 1;
    for (const gap of gapsMinutes(list)) {
      if (gap < minRestMinutes) restDeficitMinutes += minRestMinutes - gap;
      else excessWaitMinutes += gap - minRestMinutes;

      if (gap < closeGapThreshold) {
        streak += 1;
      } else {
        if (streak > 3) streakPenalty += streak - 3;
        streak = 1;
      }
    }
    if (streak > 3) streakPenalty += streak - 3;
  }

  return restDeficitMinutes * 3 + streakPenalty * 15 + excessWaitMinutes * 1 + resourceImbalance(matches) * 0.1;
}

export function computeLongestWaitMinutes(matches: Match[], entryById: Map<EntryId, Entry>): Record<ParticipantId, number> {
  const byParticipant = scheduledMatchesByParticipant(matches, entryById);
  const result: Record<ParticipantId, number> = {};
  for (const [pid, list] of byParticipant) {
    const gaps = gapsMinutes(list);
    result[pid] = gaps.length > 0 ? Math.max(...gaps) : 0;
  }
  return result;
}

/** Total busy minutes per resource. There's no time window anymore, so this can't be a fraction of "available" time. */
export function computeResourceUtilization(matches: Match[]): Record<ResourceId, number> {
  const result: Record<ResourceId, number> = {};
  for (const m of matches) {
    if (!m.resourceId || m.startOffsetMinutes === undefined) continue;
    result[m.resourceId] = (result[m.resourceId] ?? 0) + m.durationMinutes;
  }
  return result;
}

/** Offset (in minutes) at which the last match finishes, or null if nothing got scheduled. */
export function computeFinishOffsetMinutes(matches: Match[]): number | null {
  let latest: number | null = null;
  for (const m of matches) {
    if (m.startOffsetMinutes === undefined) continue;
    const end = m.startOffsetMinutes + m.durationMinutes;
    if (latest === null || end > latest) latest = end;
  }
  return latest;
}
