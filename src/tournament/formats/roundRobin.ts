import type { Entry, FormatConfig, Match, TournamentFormat, ValidationResult } from '../types';
import { roundRobinRounds } from './roundRobinPairings';

function validate(entries: Entry[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (entries.length < 2) {
    errors.push('Minimaal 2 deelnemers nodig voor een round robin.');
  }
  if (entries.length % 2 !== 0) {
    warnings.push('Oneven aantal deelnemers: elke ronde heeft één deelnemer met een vrije ronde.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

function generate(entries: Entry[], config: FormatConfig): Match[] {
  if (entries.length < 2) return [];

  const disciplineId = entries[0]!.disciplineId;
  const rounds = roundRobinRounds(entries);
  const matches: Match[] = [];

  rounds.forEach((pairs, roundIndex) => {
    const round = roundIndex + 1;
    pairs.forEach(([home, away], i) => {
      matches.push({
        id: `${disciplineId}-r${round}-m${i}`,
        disciplineId,
        round,
        label: pairs.length === 1 ? `Ronde ${round}` : `Ronde ${round} - wedstrijd ${i + 1}`,
        home: { kind: 'entry', entryId: home.id },
        away: { kind: 'entry', entryId: away.id },
        durationMinutes: config.durationMinutes,
        dependsOn: [],
      });
    });
  });

  return matches;
}

export const roundRobin: TournamentFormat = {
  name: 'round_robin',
  validate,
  generate,
};
