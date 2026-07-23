import type { Discipline, DisciplineId, Resource } from '../types';

/**
 * Resolves which resources each discipline may use. A resource with an empty disciplineIds is
 * eligible for every discipline in the tournament (the default); a non-empty list restricts it to
 * just those. This lets a resource stay eligible for disciplines added later without needing to be
 * retroactively updated.
 */
export function resourcesByDiscipline(disciplines: Discipline[], resources: Resource[]): Map<DisciplineId, Resource[]> {
  const allDisciplineIds = disciplines.map((d) => d.id);
  const result = new Map<DisciplineId, Resource[]>();

  for (const resource of resources) {
    const targetIds = resource.disciplineIds.length > 0 ? resource.disciplineIds : allDisciplineIds;
    for (const disciplineId of targetIds) {
      const list = result.get(disciplineId) ?? [];
      list.push(resource);
      result.set(disciplineId, list);
    }
  }

  return result;
}
