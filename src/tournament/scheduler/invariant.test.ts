import { describe, expect, it } from 'vitest';
import type { Match, Resource, Tournament } from '../types';
import { schedule } from './index';
import { randomTournament } from './fixtures';
import { matchParticipants } from './participants';

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function checkHardConstraints(tournament: Tournament) {
  const report = schedule(tournament);
  const scheduled = report.matches.filter((m) => m.resourceId !== undefined && m.startsAt !== undefined);
  const entryById = new Map(tournament.disciplines.flatMap((d) => d.entries).map((e) => [e.id, e]));
  const disciplineById = new Map(tournament.disciplines.map((d) => [d.id, d]));
  const resourcesByDiscipline = new Map<string, Resource[]>();
  for (const r of tournament.resources) {
    for (const discId of r.disciplineIds) {
      resourcesByDiscipline.set(discId, [...(resourcesByDiscipline.get(discId) ?? []), r]);
    }
  }
  const byId = new Map(report.matches.map((m) => [m.id, m]));

  const byResource = new Map<string, Match[]>();
  const byParticipant = new Map<string, Match[]>();

  for (const m of scheduled) {
    const start = m.startsAt!.getTime();
    const end = start + m.durationMinutes * 60_000;

    // Constraint 4: within the discipline's time window.
    const discipline = disciplineById.get(m.disciplineId)!;
    expect(start).toBeGreaterThanOrEqual(discipline.timeWindow.start.getTime());
    expect(end).toBeLessThanOrEqual(discipline.timeWindow.end.getTime());

    // Constraint 5: resource must be eligible for this discipline.
    const eligible = resourcesByDiscipline.get(m.disciplineId) ?? [];
    expect(eligible.some((r) => r.id === m.resourceId)).toBe(true);

    // Constraint 3: dependencies must already have finished.
    for (const depId of m.dependsOn) {
      const dep = byId.get(depId);
      if (dep?.startsAt) {
        expect(start).toBeGreaterThanOrEqual(dep.startsAt.getTime() + dep.durationMinutes * 60_000);
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
        const aStart = a.startsAt!.getTime();
        const aEnd = aStart + a.durationMinutes * 60_000;
        const bStart = b.startsAt!.getTime();
        const bEnd = bStart + b.durationMinutes * 60_000;
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
        const aStart = a.startsAt!.getTime();
        const aEnd = aStart + a.durationMinutes * 60_000;
        const bStart = b.startsAt!.getTime();
        const bEnd = bStart + b.durationMinutes * 60_000;
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
