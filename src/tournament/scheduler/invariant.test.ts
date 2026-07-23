import { describe, expect, it } from 'vitest';
import type { Match, Tournament } from '../types';
import { schedule } from './index';
import { randomTournament } from './fixtures';
import { matchParticipants } from './participants';
import { resourcesByDiscipline } from './resourceEligibility';

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function checkHardConstraints(tournament: Tournament) {
  const report = schedule(tournament);
  const scheduled = report.matches.filter((m) => m.resourceId !== undefined && m.startOffsetMinutes !== undefined);
  const entryById = new Map(tournament.disciplines.flatMap((d) => d.entries).map((e) => [e.id, e]));
  const eligibleResources = resourcesByDiscipline(tournament.disciplines, tournament.resources);
  const byId = new Map(report.matches.map((m) => [m.id, m]));

  const byResource = new Map<string, Match[]>();
  const byParticipant = new Map<string, Match[]>();

  for (const m of scheduled) {
    const start = m.startOffsetMinutes!;

    // Constraint 5: resource must be eligible for this discipline.
    const eligible = eligibleResources.get(m.disciplineId) ?? [];
    expect(eligible.some((r) => r.id === m.resourceId)).toBe(true);

    // Constraint 3: dependencies must already have finished.
    for (const depId of m.dependsOn) {
      const dep = byId.get(depId);
      if (dep?.startOffsetMinutes !== undefined) {
        expect(start).toBeGreaterThanOrEqual(dep.startOffsetMinutes + dep.durationMinutes);
      }
    }

    if (!byResource.has(m.resourceId!)) byResource.set(m.resourceId!, []);
    byResource.get(m.resourceId!)!.push(m);
    for (const pid of matchParticipants(m, entryById)) {
      if (!byParticipant.has(pid)) byParticipant.set(pid, []);
      byParticipant.get(pid)!.push(m);
    }
  }

  // Constraint 1: one match at a time per resource.
  for (const list of byResource.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        const aStart = a.startOffsetMinutes!;
        const aEnd = aStart + a.durationMinutes;
        const bStart = b.startOffsetMinutes!;
        const bEnd = bStart + b.durationMinutes;
        expect(overlaps(aStart, aEnd, bStart, bEnd)).toBe(false);
      }
    }
  }

  // Constraint 2: one match at a time per participant, across disciplines.
  for (const list of byParticipant.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        const aStart = a.startOffsetMinutes!;
        const aEnd = aStart + a.durationMinutes;
        const bStart = b.startOffsetMinutes!;
        const bEnd = bStart + b.durationMinutes;
        expect(overlaps(aStart, aEnd, bStart, bEnd)).toBe(false);
      }
    }
  }
}

describe('scheduler invariants', () => {
  it('never violates a hard constraint, across 100 random tournaments', () => {
    for (let seed = 1; seed <= 100; seed++) {
      checkHardConstraints(randomTournament(seed));
    }
  });
});
