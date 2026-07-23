import { describe, expect, it } from 'vitest';
import type { Discipline, Resource } from '../types';
import { resourcesByDiscipline } from './resourceEligibility';

function discipline(id: string): Discipline {
  return { id, name: id, format: 'round_robin', formatConfig: { durationMinutes: 10 }, entries: [], matches: [] };
}

describe('resourcesByDiscipline', () => {
  it('makes a resource with an empty disciplineIds eligible for every discipline', () => {
    const disciplines = [discipline('d1'), discipline('d2'), discipline('d3')];
    const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: [] };
    const result = resourcesByDiscipline(disciplines, [resource]);

    expect(result.get('d1')).toEqual([resource]);
    expect(result.get('d2')).toEqual([resource]);
    expect(result.get('d3')).toEqual([resource]);
  });

  it('restricts a resource with a non-empty disciplineIds to just those disciplines', () => {
    const disciplines = [discipline('d1'), discipline('d2')];
    const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: ['d1'] };
    const result = resourcesByDiscipline(disciplines, [resource]);

    expect(result.get('d1')).toEqual([resource]);
    expect(result.get('d2') ?? []).toEqual([]);
  });

  it('a resource newly restricted still covers a discipline added later, if listed explicitly', () => {
    const disciplines = [discipline('d1'), discipline('d2')];
    const allPurpose: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: [] };
    const restricted: Resource = { id: 'r2', name: 'Veld 2', disciplineIds: ['d1'] };
    const result = resourcesByDiscipline(disciplines, [allPurpose, restricted]);

    expect(result.get('d2')).toEqual([allPurpose]);
  });
});
