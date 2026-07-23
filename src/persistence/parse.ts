import type { Tournament } from '../tournament/types';
import { tournamentSchema } from './schema';

export type ParseResult = { success: true; tournament: Tournament } | { success: false; error: string };

/** JSON import boundary: validate with Zod first, only trust the shape as a Tournament after that. */
export function parseTournamentJson(jsonText: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    return { success: false, error: 'Ongeldige JSON.' };
  }

  const result = tournamentSchema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`).join('; ');
    return { success: false, error: message };
  }

  return { success: true, tournament: result.data as Tournament };
}

export function tournamentToJson(tournament: Tournament): string {
  return JSON.stringify(tournament, null, 2);
}
