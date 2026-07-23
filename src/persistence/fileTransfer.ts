import type { Tournament } from '../tournament/types';
import { tournamentToJson } from './parse';

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadTournamentJson(tournament: Tournament): void {
  downloadTextFile(`${tournament.name || 'toernooi'}.json`, tournamentToJson(tournament), 'application/json');
}

export function readFileAsText(file: File): Promise<string> {
  return file.text();
}
