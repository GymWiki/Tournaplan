import type { Match } from '../tournament/types';

export interface BracketColumn {
  title: string;
  round: number;
  matches: Match[];
}

/**
 * Column title from its position relative to the final, not from any one match's label — a round
 * reduced to a single real match by byes has no " N" suffix on its label, which would otherwise be
 * indistinguishable from a round number when reverse-engineered from label text.
 */
function columnTitleForPosition(indexFromStart: number, totalColumns: number): string {
  const indexFromEnd = totalColumns - 1 - indexFromStart;
  if (indexFromEnd === 0) return 'Finale';
  if (indexFromEnd === 1) return 'Halve finale';
  if (indexFromEnd === 2) return 'Kwartfinale';
  return `Ronde ${indexFromStart + 1}`;
}

/**
 * Splits a discipline's matches into bracket columns (one per round) and, separately, the 3rd
 * place match. Pool-play matches (labelled "Poule ...") aren't part of the elimination tree and
 * are excluded — the caller shows those in the schedule views instead.
 */
export function buildBracketColumns(matches: Match[]): { columns: BracketColumn[]; thirdPlaceMatch: Match | undefined } {
  const thirdPlaceMatch = matches.find((m) => m.label === 'Troostfinale');
  const bracketMatches = matches.filter((m) => !m.label.startsWith('Poule') && m.label !== 'Troostfinale');

  const rounds = [...new Set(bracketMatches.map((m) => m.round))].sort((a, b) => a - b);
  const columns: BracketColumn[] = rounds.map((round, i) => ({
    title: columnTitleForPosition(i, rounds.length),
    round,
    matches: bracketMatches.filter((m) => m.round === round),
  }));

  return { columns, thirdPlaceMatch };
}
