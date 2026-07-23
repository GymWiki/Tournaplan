import { describe, expect, it } from 'vitest';
import type { Entry, Match, Resource } from '../tournament/types';
import { buildResourceCsv } from './csvExport';

const entryById = new Map<string, Entry>([
  ['e1', { id: 'e1', disciplineId: 'd1', name: 'Team A', participantIds: ['p1'] }],
  ['e2', { id: 'e2', disciplineId: 'd1', name: 'Team B', participantIds: ['p2'] }],
]);
const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: ['d1'] };

function match(id: string, startOffsetMinutes: number, resourceId = 'r1'): Match {
  return {
    id,
    disciplineId: 'd1',
    round: 1,
    label: 'Ronde 1',
    home: { kind: 'entry', entryId: 'e1' },
    away: { kind: 'entry', entryId: 'e2' },
    durationMinutes: 20,
    dependsOn: [],
    resourceId,
    startOffsetMinutes,
  };
}

describe('buildResourceCsv', () => {
  const startTime = new Date('2026-08-01T09:00:00');

  it('produces a header and one row per match on that resource, chronologically, with clock times when a startTime is given', () => {
    const matches = [match('m2', 60), match('m1', 0)];
    const csv = buildResourceCsv(matches, resource, entryById, new Map(), new Map(), startTime);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Tijd,Wedstrijd,Thuis,Uit');
    expect(lines[1]).toBe('09:00,Ronde 1,Team A,Team B');
    expect(lines[2]).toBe('10:00,Ronde 1,Team A,Team B');
  });

  it('falls back to a running order number when there is no startTime', () => {
    const matches = [match('m1', 0), match('m2', 60)];
    const csv = buildResourceCsv(matches, resource, entryById, new Map(), new Map());
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Volgorde,Wedstrijd,Thuis,Uit');
    expect(lines[1]).toBe('1,Ronde 1,Team A,Team B');
    expect(lines[2]).toBe('2,Ronde 1,Team A,Team B');
  });

  it('excludes matches on other resources and unscheduled matches', () => {
    const other: Match = { ...match('m3', 0, 'r2') };
    const unscheduled: Match = { ...match('m4', 0), startOffsetMinutes: undefined };
    const csv = buildResourceCsv([other, unscheduled], resource, entryById, new Map(), new Map());
    expect(csv.split('\r\n')).toHaveLength(1); // header only
  });

  it('adds a Discipline column when a discipline name map is provided', () => {
    const csv = buildResourceCsv([match('m1', 0)], resource, entryById, new Map(), new Map([['d1', 'Voetbal']]), startTime);
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Tijd,Discipline,Wedstrijd,Thuis,Uit');
    expect(lines[1]).toBe('09:00,Voetbal,Ronde 1,Team A,Team B');
  });

  it('quotes and escapes fields containing commas or quotes', () => {
    const weirdEntryById = new Map<string, Entry>([
      ['e1', { id: 'e1', disciplineId: 'd1', name: 'Team "A", the best', participantIds: ['p1'] }],
      ['e2', { id: 'e2', disciplineId: 'd1', name: 'Team B', participantIds: ['p2'] }],
    ]);
    const csv = buildResourceCsv([match('m1', 0)], resource, weirdEntryById, new Map(), new Map(), startTime);
    expect(csv.split('\r\n')[1]).toBe('09:00,Ronde 1,"Team ""A"", the best",Team B');
  });
});
