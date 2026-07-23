import { describe, expect, it } from 'vitest';
import type { Match, Tournament } from '../types';
import { schedule } from './index';
import { buildDiscipline, buildTournament, makeEntries, makeParticipants, makeResources, makeWindow } from './fixtures';
import { matchParticipants } from './participants';

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function scheduledOf(matches: Match[]): Match[] {
  return matches.filter((m) => m.resourceId !== undefined && m.startsAt !== undefined);
}

function assertNoResourceDoubleBooking(matches: Match[]) {
  const byResource = new Map<string, Match[]>();
  for (const m of scheduledOf(matches)) {
    const list = byResource.get(m.resourceId!) ?? [];
    list.push(m);
    byResource.set(m.resourceId!, list);
  }
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
}

function assertNoParticipantDoubleBooking(matches: Match[], tournament: Tournament) {
  const entryById = new Map(tournament.disciplines.flatMap((d) => d.entries).map((e) => [e.id, e]));
  const byParticipant = new Map<string, Match[]>();
  for (const m of scheduledOf(matches)) {
    for (const pid of matchParticipants(m, entryById)) {
      const list = byParticipant.get(pid) ?? [];
      list.push(m);
      byParticipant.set(pid, list);
    }
  }
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

function assertDependenciesRespected(matches: Match[]) {
  const byId = new Map(matches.map((m) => [m.id, m]));
  for (const m of scheduledOf(matches)) {
    for (const depId of m.dependsOn) {
      const dep = byId.get(depId);
      if (!dep?.startsAt) continue;
      const depEnd = dep.startsAt.getTime() + dep.durationMinutes * 60_000;
      expect(m.startsAt!.getTime()).toBeGreaterThanOrEqual(depEnd);
    }
  }
}

function assertWithinWindow(matches: Match[], tournament: Tournament) {
  const disciplineById = new Map(tournament.disciplines.map((d) => [d.id, d]));
  for (const m of scheduledOf(matches)) {
    const discipline = disciplineById.get(m.disciplineId)!;
    expect(m.startsAt!.getTime()).toBeGreaterThanOrEqual(discipline.timeWindow.start.getTime());
    expect(m.startsAt!.getTime() + m.durationMinutes * 60_000).toBeLessThanOrEqual(discipline.timeWindow.end.getTime());
  }
}

describe('schedule — feasible tournament', () => {
  it('schedules 32 teams over 4 fields with no conflicts and no hard-constraint violations', () => {
    const participants = makeParticipants(32);
    const entries = makeEntries('voetbal', participants);
    const window = makeWindow('2026-08-01T09:00:00Z', '2026-08-01T20:00:00Z');
    const discipline = buildDiscipline('voetbal', 'single_elimination', entries, 20, window);
    const resources = makeResources(4, ['voetbal']);
    const tournament = buildTournament([discipline], resources);

    const report = schedule(tournament);

    expect(report.conflicts).toEqual([]);
    expect(scheduledOf(report.matches)).toHaveLength(discipline.matches.length);
    assertNoResourceDoubleBooking(report.matches);
    assertNoParticipantDoubleBooking(report.matches, tournament);
    assertDependenciesRespected(report.matches);
    assertWithinWindow(report.matches, tournament);
    expect(report.endsAt).not.toBeNull();
  });
});

describe('schedule — infeasible tournament', () => {
  it('reports explicit conflicts with a reason and suggestion instead of crashing', () => {
    const participants = makeParticipants(8);
    const entries = makeEntries('volleybal', participants);
    // Round robin of 8 = 28 matches, but the window only fits a handful on one field.
    const window = makeWindow('2026-08-01T09:00:00Z', '2026-08-01T10:00:00Z');
    const discipline = buildDiscipline('volleybal', 'round_robin', entries, 20, window);
    const resources = makeResources(1, ['volleybal']);
    const tournament = buildTournament([discipline], resources);

    const report = schedule(tournament);

    expect(report.conflicts.length).toBeGreaterThan(0);
    for (const conflict of report.conflicts) {
      expect(conflict.reason.length).toBeGreaterThan(0);
      expect(conflict.suggestion.length).toBeGreaterThan(0);
    }
    assertNoResourceDoubleBooking(report.matches);
    assertNoParticipantDoubleBooking(report.matches, tournament);
  });

  it('reports a conflict when a discipline has no linked resource at all', () => {
    const participants = makeParticipants(4);
    const entries = makeEntries('badminton', participants);
    const window = makeWindow('2026-08-01T09:00:00Z', '2026-08-01T20:00:00Z');
    const discipline = buildDiscipline('badminton', 'single_elimination', entries, 20, window);
    const tournament = buildTournament([discipline], []);

    const report = schedule(tournament);

    expect(report.conflicts.length).toBe(discipline.matches.length);
    expect(report.conflicts[0]!.reason).toMatch(/Geen veld gekoppeld/);
  });
});

describe('schedule — cross-discipline participant conflicts', () => {
  it('never double-books a participant who competes in two disciplines at once', () => {
    const shared = makeParticipants(8, 'shared');
    const window = makeWindow('2026-08-01T09:00:00Z', '2026-08-01T12:00:00Z');

    const footballEntries = makeEntries('voetbal', shared);
    const volleyballEntries = makeEntries('volleybal', shared);

    const football = buildDiscipline('voetbal', 'round_robin', footballEntries, 20, window);
    const volleyball = buildDiscipline('volleybal', 'round_robin', volleyballEntries, 20, window);

    // One shared field for both sports forces the scheduler to interleave them.
    const resources = makeResources(1, ['voetbal', 'volleybal']);
    const tournament = buildTournament([football, volleyball], resources);

    const report = schedule(tournament);

    assertNoResourceDoubleBooking(report.matches);
    assertNoParticipantDoubleBooking(report.matches, tournament);
  });
});
