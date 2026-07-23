import { describe, expect, it } from 'vitest';
import type { Entry, Match } from '../types';
import { computeFinishOffsetMinutes, computeLongestWaitMinutes, computeResourceUtilization, computeScore } from './metrics';

function entry(id: string, participantId: string): Entry {
  return { id, disciplineId: 'd1', name: id, participantIds: [participantId] };
}

function match(id: string, homeEntryId: string, awayEntryId: string, startOffsetMinutes: number, durationMinutes: number, resourceId = 'r1'): Match {
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
    startOffsetMinutes,
  };
}

describe('computeScore', () => {
  const entryById = new Map([
    ['e1', entry('e1', 'p1')],
    ['e2', entry('e2', 'p2')],
    ['e3', entry('e3', 'p3')],
  ]);

  it('is 0 for a single isolated match', () => {
    const matches = [match('m1', 'e1', 'e2', 0, 20)];
    expect(computeScore(matches, entryById, 15)).toBe(0);
  });

  it('penalizes a participant whose next match starts before the minimum rest has passed', () => {
    const tight = [
      match('m1', 'e1', 'e2', 0, 20),
      match('m2', 'e1', 'e3', 25, 20), // only 5 min rest for e1/p1
    ];
    const relaxed = [
      match('m1', 'e1', 'e2', 0, 20),
      match('m2', 'e1', 'e3', 40, 20), // 20 min rest, satisfies the 15 min minimum
    ];
    expect(computeScore(tight, entryById, 15)).toBeGreaterThan(computeScore(relaxed, entryById, 15));
  });

  it('penalizes a long idle gap more than a modest one', () => {
    const longGap = [match('m1', 'e1', 'e2', 0, 20), match('m2', 'e1', 'e3', 180, 20)];
    const shortGap = [match('m1', 'e1', 'e2', 0, 20), match('m2', 'e1', 'e3', 45, 20)];
    expect(computeScore(longGap, entryById, 15)).toBeGreaterThan(computeScore(shortGap, entryById, 15));
  });
});

describe('computeLongestWaitMinutes', () => {
  it('reports the largest gap per participant and 0 for a participant with one match', () => {
    const entryById = new Map([
      ['e1', entry('e1', 'p1')],
      ['e2', entry('e2', 'p2')],
    ]);
    const matches = [match('m1', 'e1', 'e2', 0, 20), match('m2', 'e1', 'e2', 60, 20)];
    const result = computeLongestWaitMinutes(matches, entryById);
    expect(result.p1).toBe(40); // gap between offset 20 (end) and 60 (start)
    expect(result.p2).toBe(40);
  });
});

describe('computeResourceUtilization', () => {
  it('returns busy minutes per resource, ignoring unscheduled matches', () => {
    const matches = [match('m1', 'e1', 'e2', 0, 30, 'r1'), match('m2', 'e1', 'e2', 30, 20, 'r1'), match('m3', 'e1', 'e2', 0, 15, 'r2')];
    const result = computeResourceUtilization(matches);
    expect(result.r1).toBe(50);
    expect(result.r2).toBe(15);
  });

  it('is empty when nothing is scheduled', () => {
    expect(computeResourceUtilization([])).toEqual({});
  });
});

describe('computeFinishOffsetMinutes', () => {
  it('returns null when nothing is scheduled', () => {
    expect(computeFinishOffsetMinutes([])).toBeNull();
  });

  it('returns the latest match end offset', () => {
    const matches = [match('m1', 'e1', 'e2', 0, 20), match('m2', 'e1', 'e2', 60, 30)];
    expect(computeFinishOffsetMinutes(matches)).toBe(90);
  });
});
