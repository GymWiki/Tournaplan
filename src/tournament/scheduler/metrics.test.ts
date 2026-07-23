import { describe, expect, it } from 'vitest';
import type { Entry, Match } from '../types';
import { computeEndsAt, computeLongestWaitMinutes, computeResourceUtilization, computeScore } from './metrics';

function entry(id: string, participantId: string): Entry {
  return { id, disciplineId: 'd1', name: id, participantIds: [participantId] };
}

function match(id: string, homeEntryId: string, awayEntryId: string, startIso: string, durationMinutes: number, resourceId = 'r1'): Match {
  return {
    id,
    disciplineId: 'd1',
    round: 1,
    label: id,
    home: { kind: 'entry', entryId: homeEntryId },
    away: { kind: 'entry', entryId: awayEntryId },
    durationMinutes,
    dependsOn: [],
    resourceId,
    startsAt: new Date(startIso),
  };
}

describe('computeScore', () => {
  const entryById = new Map([
    ['e1', entry('e1', 'p1')],
    ['e2', entry('e2', 'p2')],
    ['e3', entry('e3', 'p3')],
  ]);

  it('is 0 for a single isolated match', () => {
    const matches = [match('m1', 'e1', 'e2', '2026-08-01T09:00:00Z', 20)];
    expect(computeScore(matches, entryById, 15)).toBe(0);
  });

  it('penalizes a participant whose next match starts before the minimum rest has passed', () => {
    const tight = [
      match('m1', 'e1', 'e2', '2026-08-01T09:00:00Z', 20),
      match('m2', 'e1', 'e3', '2026-08-01T09:25:00Z', 20), // only 5 min rest for e1/p1
    ];
    const relaxed = [
      match('m1', 'e1', 'e2', '2026-08-01T09:00:00Z', 20),
      match('m2', 'e1', 'e3', '2026-08-01T09:40:00Z', 20), // 20 min rest, satisfies the 15 min minimum
    ];
    expect(computeScore(tight, entryById, 15)).toBeGreaterThan(computeScore(relaxed, entryById, 15));
  });

  it('penalizes a long idle gap more than a modest one', () => {
    const longGap = [
      match('m1', 'e1', 'e2', '2026-08-01T09:00:00Z', 20),
      match('m2', 'e1', 'e3', '2026-08-01T12:00:00Z', 20),
    ];
    const shortGap = [
      match('m1', 'e1', 'e2', '2026-08-01T09:00:00Z', 20),
      match('m2', 'e1', 'e3', '2026-08-01T09:45:00Z', 20),
    ];
    expect(computeScore(longGap, entryById, 15)).toBeGreaterThan(computeScore(shortGap, entryById, 15));
  });
});

describe('computeLongestWaitMinutes', () => {
  it('reports the largest gap per participant and 0 for a participant with one match', () => {
    const entryById = new Map([
      ['e1', entry('e1', 'p1')],
      ['e2', entry('e2', 'p2')],
    ]);
    const matches = [
      match('m1', 'e1', 'e2', '2026-08-01T09:00:00Z', 20),
      match('m2', 'e1', 'e2', '2026-08-01T10:00:00Z', 20),
    ];
    const result = computeLongestWaitMinutes(matches, entryById);
    expect(result.p1).toBe(40); // gap between 09:20 end and 10:00 start
    expect(result.p2).toBe(40);
  });
});

describe('computeResourceUtilization', () => {
  it('returns 0 for a resource with no linked discipline', () => {
    const result = computeResourceUtilization([], [{ id: 'r1', name: 'Veld 1', disciplineIds: [] }], []);
    expect(result.r1).toBe(0);
  });

  it('computes busy-time fraction relative to the discipline window', () => {
    const discipline = {
      id: 'd1',
      name: 'd1',
      format: 'round_robin' as const,
      formatConfig: { durationMinutes: 20 },
      entries: [],
      matches: [],
      timeWindow: { start: new Date('2026-08-01T09:00:00Z'), end: new Date('2026-08-01T10:00:00Z') },
    };
    const matches = [match('m1', 'e1', 'e2', '2026-08-01T09:00:00Z', 30, 'r1')];
    const result = computeResourceUtilization(matches, [{ id: 'r1', name: 'Veld 1', disciplineIds: ['d1'] }], [discipline]);
    expect(result.r1).toBeCloseTo(0.5);
  });
});

describe('computeEndsAt', () => {
  it('returns null when nothing is scheduled', () => {
    expect(computeEndsAt([])).toBeNull();
  });

  it('returns the latest match end time', () => {
    const matches = [
      match('m1', 'e1', 'e2', '2026-08-01T09:00:00Z', 20),
      match('m2', 'e1', 'e2', '2026-08-01T10:00:00Z', 30),
    ];
    expect(computeEndsAt(matches)).toEqual(new Date('2026-08-01T10:30:00Z'));
  });
});
