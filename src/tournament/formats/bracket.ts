import type { Match, Slot } from '../types';

export function roundLabel(round: number, totalRounds: number, indexInRound: number, matchesInRound: number): string {
  const roundFromEnd = totalRounds - round;
  const base =
    roundFromEnd === 0 ? 'Finale' : roundFromEnd === 1 ? 'Halve finale' : roundFromEnd === 2 ? 'Kwartfinale' : `Ronde ${round}`;
  return matchesInRound === 1 ? base : `${base} ${indexInRound + 1}`;
}

/**
 * Builds a single-elimination bracket (+ optional 3rd place match) from a leaf-slot array whose
 * length must be a power of two. Leaves may be 'entry', 'group_rank' or 'bye' slots — this is what
 * lets both plain single-elimination and the knock-out phase of groups+knockout share one
 * implementation of bye handling and standard seeding.
 */
export function buildEliminationBracket(
  leaves: Slot[],
  disciplineId: string,
  idPrefix: string,
  durationMinutes: number,
  includeThirdPlace: boolean,
): Match[] {
  const size = leaves.length;
  if (size < 2) return [];

  let advancing = leaves;
  const totalRounds = Math.log2(size);
  const matches: Match[] = [];
  const semifinalMatchIds: string[] = [];

  for (let round = 1; round <= totalRounds; round++) {
    const next: Slot[] = [];
    const matchesInRound = advancing.length / 2;
    let createdInRound = 0;

    for (let i = 0; i < advancing.length; i += 2) {
      const a = advancing[i]!;
      const b = advancing[i + 1]!;
      const aIsBye = a.kind === 'bye';
      const bIsBye = b.kind === 'bye';

      if (round === 1 && (aIsBye || bIsBye) && !(aIsBye && bIsBye)) {
        // One real side, one bye: pass straight through, no match to play.
        next.push(aIsBye ? b : a);
        continue;
      }

      const matchId = `${idPrefix}-r${round}-p${i / 2}`;
      const label = roundLabel(round, totalRounds, createdInRound, matchesInRound);
      matches.push({
        id: matchId,
        disciplineId,
        round,
        label,
        home: a,
        away: b,
        durationMinutes,
        dependsOn: [a, b]
          .map((s) => (s.kind === 'winner_of' ? s.matchId : undefined))
          .filter((id): id is string => id !== undefined),
      });
      next.push({ kind: 'winner_of', matchId });
      createdInRound++;
    }

    if (round === totalRounds - 1 && next.length === 2 && createdInRound === matchesInRound) {
      const last = matches.slice(-2);
      semifinalMatchIds.push(...last.map((m) => m.id));
    }

    advancing = next;
  }

  if (includeThirdPlace && semifinalMatchIds.length === 2) {
    matches.push({
      id: `${idPrefix}-third-place`,
      disciplineId,
      round: totalRounds,
      label: 'Troostfinale',
      home: { kind: 'loser_of', matchId: semifinalMatchIds[0]! },
      away: { kind: 'loser_of', matchId: semifinalMatchIds[1]! },
      durationMinutes,
      dependsOn: semifinalMatchIds,
    });
  }

  return matches;
}
