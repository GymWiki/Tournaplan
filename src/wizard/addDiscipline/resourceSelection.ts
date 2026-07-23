import type { DisciplineId, Resource } from '../../tournament/types';

/**
 * Applies the organizer's include/exclude choice for one resource when adding a new discipline.
 * An empty disciplineIds means "all disciplines" (see Resource in types.ts); excluding a resource
 * that currently means "all" has to materialize that into an explicit list of the disciplines
 * that existed before this one, otherwise "excluded" would have no effect. Including a resource
 * that's already "all" is a no-op — it already covers the new discipline.
 */
export function applyDisciplineToResource(resource: Resource, newDisciplineId: DisciplineId, included: boolean, existingDisciplineIds: DisciplineId[]): Resource {
  const isCurrentlyAll = resource.disciplineIds.length === 0;

  if (included) {
    if (isCurrentlyAll) return resource;
    return { ...resource, disciplineIds: [...new Set([...resource.disciplineIds, newDisciplineId])] };
  }

  if (isCurrentlyAll) {
    return { ...resource, disciplineIds: existingDisciplineIds };
  }
  return { ...resource, disciplineIds: resource.disciplineIds.filter((id) => id !== newDisciplineId) };
}
