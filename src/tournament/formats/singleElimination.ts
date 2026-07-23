import type { Entry, FormatConfig, Match, Slot, TournamentFormat, ValidationResult } from '../types';
import { nextPowerOfTwo, standardSeedOrder } from './seeding';
import { buildEliminationBracket } from './bracket';

export interface SingleEliminationConfig extends FormatConfig {
  /** Whether to generate a match for 3rd place between the losing semifinalists. Default true. */
  includeThirdPlace?: boolean;
}

function validate(entries: Entry[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (entries.length < 2) {
    errors.push('Minimaal 2 deelnemers nodig voor een knock-outtoernooi.');
  }

  const seeds = entries.map((e) => e.seed).filter((s): s is number => s !== undefined);
  if (new Set(seeds).size !== seeds.length) {
    errors.push('Seeds moeten uniek zijn.');
  }

  if (entries.length >= 2) {
    const size = nextPowerOfTwo(entries.length);
    if (size !== entries.length) {
      warnings.push(
        `${size - entries.length} deelnemer(s) krijgen een bye om het aantal op ${size} te brengen.`,
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function generate(entries: Entry[], config: SingleEliminationConfig): Match[] {
  if (entries.length < 2) return [];

  const disciplineId = entries[0]!.disciplineId;
  const includeThirdPlace = config.includeThirdPlace ?? true;

  const seeded = entries
    .map((entry, i) => ({ entry, seed: entry.seed ?? i + 1 }))
    .sort((a, b) => a.seed - b.seed)
    .map((x) => x.entry);

  const size = nextPowerOfTwo(entries.length);
  const order = standardSeedOrder(size);
  const leaves: Slot[] = order.map((seedNumber) => {
    const entry = seeded[seedNumber - 1];
    return entry ? { kind: 'entry', entryId: entry.id } : { kind: 'bye' };
  });

  return buildEliminationBracket(leaves, disciplineId, disciplineId, config.durationMinutes, includeThirdPlace);
}

export const singleElimination: TournamentFormat<SingleEliminationConfig> = {
  name: 'single_elimination',
  validate,
  generate,
};
