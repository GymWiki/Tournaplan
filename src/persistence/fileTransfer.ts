import type { Tournament } from '../tournament/types';
import { tournamentToJson } from './parse';

export function downloadTournamentJson(tournament: Tournament): void {
  const blob = new Blob([tournamentToJson(tournament)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tournament.name || 'toernooi'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return file.text();
}
