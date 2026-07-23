import type { Discipline, DisciplineId, Entry, EntryId, Match, MatchId, ParticipantId, Resource, ResourceId } from '../types';
import type { SchedulingConflict } from './types';
import { matchParticipants } from './participants';
import { type Interval, overlaps } from './intervals';

interface EarliestSlotArgs {
  minStart: number;
  windowEnd: number;
  durationMs: number;
  eligibleResources: Resource[];
  resourceBusy: Map<ResourceId, Interval[]>;
  participantBusy: Map<ParticipantId, Interval[]>;
  participantIds: ParticipantId[];
}

/**
 * Earliest (start, resource) pair that respects hard constraints 1, 2, 4 and 5. Candidate start
 * times only need to be checked at the window start and at every existing busy-interval end for a
 * relevant resource or participant — feasibility can never improve between those points.
 */
function findEarliestSlot(args: EarliestSlotArgs): { start: number; resourceId: ResourceId } | null {
  const { minStart, windowEnd, durationMs, eligibleResources, resourceBusy, participantBusy, participantIds } = args;
  if (minStart + durationMs > windowEnd) return null;

  const candidates = new Set<number>([minStart]);
  for (const r of eligibleResources) {
    for (const busy of resourceBusy.get(r.id) ?? []) {
      if (busy.end >= minStart) candidates.add(busy.end);
    }
  }
  for (const pid of participantIds) {
    for (const busy of participantBusy.get(pid) ?? []) {
      if (busy.end >= minStart) candidates.add(busy.end);
    }
  }

  const sorted = [...candidates].filter((t) => t + durationMs <= windowEnd).sort((a, b) => a - b);

  for (const start of sorted) {
    const end = start + durationMs;
    let best: { resourceId: ResourceId; usage: number } | null = null;

    for (const r of eligibleResources) {
      const busyList = resourceBusy.get(r.id) ?? [];
      if (busyList.some((b) => overlaps(b, start, end))) continue;
      if (participantIds.some((pid) => (participantBusy.get(pid) ?? []).some((b) => overlaps(b, start, end)))) continue;

      const usage = busyList.reduce((sum, b) => sum + (b.end - b.start), 0);
      if (!best || usage < best.usage) best = { resourceId: r.id, usage };
    }

    if (best) return { start, resourceId: best.resourceId };
  }

  return null;
}

export interface PlacementResult {
  scheduled: Map<MatchId, Match>;
  conflicts: SchedulingConflict[];
}

/** Greedy earliest-fit placement (Aanpak stap 1-3): topological order in, first feasible slot out. */
export function placeMatches(
  orderedMatches: Match[],
  disciplineById: Map<DisciplineId, Discipline>,
  resourcesByDiscipline: Map<DisciplineId, Resource[]>,
  entryById: Map<EntryId, Entry>,
): PlacementResult {
  const scheduled = new Map<MatchId, Match>();
  const conflicts: SchedulingConflict[] = [];
  const resourceBusy = new Map<ResourceId, Interval[]>();
  const participantBusy = new Map<ParticipantId, Interval[]>();

  for (const match of orderedMatches) {
    const discipline = disciplineById.get(match.disciplineId);
    if (!discipline) {
      conflicts.push({
        matchId: match.id,
        disciplineId: match.disciplineId,
        reason: 'Onbekende discipline voor deze wedstrijd.',
        suggestion: 'Controleer de disciplineId van deze wedstrijd.',
      });
      continue;
    }

    const eligibleResources = resourcesByDiscipline.get(discipline.id) ?? [];
    if (eligibleResources.length === 0) {
      conflicts.push({
        matchId: match.id,
        disciplineId: discipline.id,
        reason: `Geen veld gekoppeld aan discipline "${discipline.name}".`,
        suggestion: 'Koppel minimaal één veld aan deze discipline.',
      });
      continue;
    }

    let minStart = discipline.timeWindow.start.getTime();
    let blockedByDependency = false;
    for (const depId of match.dependsOn) {
      const dep = scheduled.get(depId);
      if (!dep || dep.startsAt === undefined) {
        blockedByDependency = true;
        break;
      }
      minStart = Math.max(minStart, dep.startsAt.getTime() + dep.durationMinutes * 60_000);
    }
    if (blockedByDependency) {
      conflicts.push({
        matchId: match.id,
        disciplineId: discipline.id,
        reason: 'Een wedstrijd waarvan deze afhankelijk is, kon niet worden ingepland.',
        suggestion: 'Los eerst het conflict van de voorgaande wedstrijd op.',
      });
      continue;
    }

    const participantIds = matchParticipants(match, entryById);
    const windowEnd = discipline.timeWindow.end.getTime();
    const durationMs = match.durationMinutes * 60_000;

    const slot = findEarliestSlot({ minStart, windowEnd, durationMs, eligibleResources, resourceBusy, participantBusy, participantIds });

    if (!slot) {
      const shortfallMinutes = Math.ceil((minStart + durationMs - windowEnd) / 60_000);
      conflicts.push({
        matchId: match.id,
        disciplineId: discipline.id,
        reason: `Geen vrij veld en tijdslot gevonden binnen het tijdvenster van "${discipline.name}".`,
        suggestion:
          shortfallMinutes > 0
            ? `Verleng het tijdvenster met minstens ${shortfallMinutes} minuten, of voeg een extra veld toe.`
            : `Voeg minstens één extra veld toe voor "${discipline.name}".`,
      });
      continue;
    }

    const scheduledMatch: Match = { ...match, resourceId: slot.resourceId, startsAt: new Date(slot.start) };
    scheduled.set(match.id, scheduledMatch);

    const interval: Interval = { start: slot.start, end: slot.start + durationMs };
    resourceBusy.set(slot.resourceId, [...(resourceBusy.get(slot.resourceId) ?? []), interval]);
    for (const pid of participantIds) {
      participantBusy.set(pid, [...(participantBusy.get(pid) ?? []), interval]);
    }
  }

  return { scheduled, conflicts };
}
