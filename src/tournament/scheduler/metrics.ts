import type { Discipline, Entry, EntryId, Match, ParticipantId, Resource, ResourceId } from '../types';
import { matchParticipants } from './participants';

function scheduledMatchesByParticipant(matches: Match[], entryById: Map<EntryId, Entry>): Map<ParticipantId, Match[]> {
  const map = new Map<ParticipantId, Match[]>();
  for (const m of matches) {
    if (!m.startsAt) continue;
    for (const pid of matchParticipants(m, entryById)) {
      const list = map.get(pid) ?? [];
      list.push(m);
      map.set(pid, list);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.startsAt!.getTime() - b.startsAt!.getTime());
  }
  return map;
}

/** Gaps in minutes between each match and the one before it (empty for a single-match list). */
function gapsMinutes(sorted: Match[]): number[] {
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = sorted[i - 1]!.startsAt!.getTime() + sorted[i - 1]!.durationMinutes * 60_000;
    const nextStart = sorted[i]!.startsAt!.getTime();
    gaps.push((nextStart - prevEnd) / 60_000);
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

export function computeResourceUtilization(matches: Match[], resources: Resource[], disciplines: Discipline[]): Record<ResourceId, number> {
  const disciplineById = new Map(disciplines.map((d) => [d.id, d]));
  const busyMsByResource = new Map<ResourceId, number>();
  for (const m of matches) {
    if (!m.resourceId || !m.startsAt) continue;
    busyMsByResource.set(m.resourceId, (busyMsByResource.get(m.resourceId) ?? 0) + m.durationMinutes * 60_000);
  }

  const result: Record<ResourceId, number> = {};
  for (const r of resources) {
    const linked = r.disciplineIds.map((id) => disciplineById.get(id)).filter((d): d is Discipline => d !== undefined);
    if (linked.length === 0) {
      result[r.id] = 0;
      continue;
    }
    const availableMs = Math.max(...linked.map((d) => d.timeWindow.end.getTime())) - Math.min(...linked.map((d) => d.timeWindow.start.getTime()));
    const busyMs = busyMsByResource.get(r.id) ?? 0;
    result[r.id] = availableMs > 0 ? busyMs / availableMs : 0;
  }
  return result;
}

export function computeEndsAt(matches: Match[]): Date | null {
  let latest: number | null = null;
  for (const m of matches) {
    if (!m.startsAt) continue;
    const end = m.startsAt.getTime() + m.durationMinutes * 60_000;
    if (latest === null || end > latest) latest = end;
  }
  return latest === null ? null : new Date(latest);
}
