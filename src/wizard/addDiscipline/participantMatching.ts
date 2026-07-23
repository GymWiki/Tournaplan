import type { Participant } from '../../tournament/types';

/**
 * Resolves an ordered list of entry names against the tournament's existing participants,
 * matching by name (case/whitespace-insensitive) so retyping "Team Rood" for a second discipline
 * reuses the same Participant instead of creating a duplicate with a coincidentally equal name —
 * this is what makes two disciplines actually share a participant for conflict detection.
 */
export function resolveParticipants(names: string[], existingParticipants: Participant[]): { participants: Participant[]; newParticipants: Participant[] } {
  const existingByName = new Map(existingParticipants.map((p) => [p.name.trim().toLowerCase(), p]));
  const newParticipants: Participant[] = [];

  const participants = names.map((name) => {
    const existing = existingByName.get(name.trim().toLowerCase());
    if (existing) return existing;
    const created: Participant = { id: crypto.randomUUID(), name };
    newParticipants.push(created);
    return created;
  });

  return { participants, newParticipants };
}
