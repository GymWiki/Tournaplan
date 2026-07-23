import type { Tournament } from '../tournament/types';
import { tournamentSchema } from './schema';

const STORAGE_KEY = 'tournaplan:tournaments';

export interface SavedTournament {
  tournament: Tournament;
  savedAt: string;
}

export function loadSavedTournaments(): SavedTournament[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const result: SavedTournament[] = [];
  for (const item of data) {
    if (typeof item !== 'object' || item === null || typeof (item as Record<string, unknown>).savedAt !== 'string') continue;
    const parsed = tournamentSchema.safeParse((item as Record<string, unknown>).tournament);
    if (parsed.success) {
      result.push({ tournament: parsed.data as Tournament, savedAt: (item as Record<string, unknown>).savedAt as string });
    }
  }
  return result;
}

export function saveTournament(tournament: Tournament): void {
  const existing = loadSavedTournaments().filter((s) => s.tournament.id !== tournament.id);
  const updated: SavedTournament[] = [...existing, { tournament, savedAt: new Date().toISOString() }];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteSavedTournament(id: string): void {
  const remaining = loadSavedTournaments().filter((s) => s.tournament.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}
