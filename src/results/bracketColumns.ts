import type { Match } from '../tournament/types';

export interface BracketColumn {
  title: string;
  round: number;
  matches: Match[];
}

/** Strips the trailing index off a round label ("Kwartfinale 2" -> "Kwartfinale") for a column header. */
export function columnTitle(label: string): string {
  return label.replace(/\s\d+$/, '');
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
  const columns: BracketColumn[] = rounds.map((round) => {
    const roundMatches = bracketMatches.filter((m) => m.round === round);
    return { title: columnTitle(roundMatches[0]!.label), round, matches: roundMatches };
  });

  return { columns, thirdPlaceMatch };
}
