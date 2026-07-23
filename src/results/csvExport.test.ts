import { describe, expect, it } from 'vitest';
import type { Entry, Match, Resource } from '../tournament/types';
import { buildResourceCsv } from './csvExport';

const entryById = new Map<string, Entry>([
  ['e1', { id: 'e1', disciplineId: 'd1', name: 'Team A', participantIds: ['p1'] }],
  ['e2', { id: 'e2', disciplineId: 'd1', name: 'Team B', participantIds: ['p2'] }],
]);
const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: ['d1'] };

function match(id: string, startIso: string, resourceId = 'r1'): Match {
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
    startsAt: new Date(startIso),
  };
}

describe('buildResourceCsv', () => {
  it('produces a header and one row per match on that resource, chronologically', () => {
    const matches = [match('m2', '2026-08-01T10:00:00'), match('m1', '2026-08-01T09:00:00')];
    const csv = buildResourceCsv(matches, resource, entryById, new Map(), new Map());
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Tijd,Wedstrijd,Thuis,Uit');
    expect(lines[1]).toBe('2026-08-01 09:00,Ronde 1,Team A,Team B');
    expect(lines[2]).toBe('2026-08-01 10:00,Ronde 1,Team A,Team B');
  });

  it('excludes matches on other resources and unscheduled matches', () => {
    const other: Match = { ...match('m3', '2026-08-01T09:00:00', 'r2') };
    const unscheduled: Match = { ...match('m4', '2026-08-01T09:00:00'), startsAt: undefined };
    const csv = buildResourceCsv([other, unscheduled], resource, entryById, new Map(), new Map());
    expect(csv.split('\r\n')).toHaveLength(1); // header only
  });

  it('adds a Discipline column when a discipline name map is provided', () => {
    const csv = buildResourceCsv([match('m1', '2026-08-01T09:00:00')], resource, entryById, new Map(), new Map([['d1', 'Voetbal']]));
    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('Tijd,Discipline,Wedstrijd,Thuis,Uit');
    expect(lines[1]).toBe('2026-08-01 09:00,Voetbal,Ronde 1,Team A,Team B');
  });

  it('quotes and escapes fields containing commas or quotes', () => {
    const weirdEntryById = new Map<string, Entry>([
      ['e1', { id: 'e1', disciplineId: 'd1', name: 'Team "A", the best', participantIds: ['p1'] }],
      ['e2', { id: 'e2', disciplineId: 'd1', name: 'Team B', participantIds: ['p2'] }],
    ]);
    const csv = buildResourceCsv([match('m1', '2026-08-01T09:00:00')], resource, weirdEntryById, new Map(), new Map());
    expect(csv.split('\r\n')[1]).toBe('2026-08-01 09:00,Ronde 1,"Team ""A"", the best",Team B');
  });
});
