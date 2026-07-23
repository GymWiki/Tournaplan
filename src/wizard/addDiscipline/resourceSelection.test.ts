import { describe, expect, it } from 'vitest';
import type { Resource } from '../../tournament/types';
import { applyDisciplineToResource } from './resourceSelection';

describe('applyDisciplineToResource', () => {
  it('leaves an "all disciplines" resource unchanged when included', () => {
    const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: [] };
    expect(applyDisciplineToResource(resource, 'd2', true, ['d1'])).toEqual(resource);
  });

  it('materializes "all" into an explicit list (excluding the new discipline) when excluded', () => {
    const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: [] };
    const result = applyDisciplineToResource(resource, 'd2', false, ['d1']);
    expect(result.disciplineIds).toEqual(['d1']);
  });

  it('adds the new discipline id to an already-restricted resource when included', () => {
    const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: ['d1'] };
    const result = applyDisciplineToResource(resource, 'd2', true, ['d1']);
    expect(result.disciplineIds).toEqual(['d1', 'd2']);
  });

  it('does not duplicate the discipline id if already present', () => {
    const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: ['d1', 'd2'] };
    const result = applyDisciplineToResource(resource, 'd2', true, ['d1']);
    expect(result.disciplineIds).toEqual(['d1', 'd2']);
  });

  it('leaves an already-restricted resource\'s list alone when excluded and not present', () => {
    const resource: Resource = { id: 'r1', name: 'Veld 1', disciplineIds: ['d1'] };
    const result = applyDisciplineToResource(resource, 'd2', false, ['d1']);
    expect(result.disciplineIds).toEqual(['d1']);
  });
});
