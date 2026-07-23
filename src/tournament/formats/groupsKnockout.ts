import type { Entry, FormatConfig, Match, Slot, TournamentFormat, ValidationResult } from '../types';
import { roundRobinRounds } from './roundRobinPairings';
import { nextPowerOfTwo, standardSeedOrder } from './seeding';
import { buildEliminationBracket } from './bracket';

export interface GroupsKnockoutConfig extends FormatConfig {
  numGroups: number;
  /** How many entries per group advance to the knock-out stage. Default 2. */
  qualifiersPerGroup?: number;
  includeThirdPlace?: boolean;
}

function groupLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

/** Snake seeding (1,2,3,4 → 4,3,2,1 → 1,2,3,4, ...) so overall strength is spread evenly across groups. */
function snakeAssignGroups(entries: Entry[], numGroups: number): Entry[][] {
  const seeded = entries
    .map((entry, i) => ({ entry, seed: entry.seed ?? i + 1 }))
    .sort((a, b) => a.seed - b.seed)
    .map((x) => x.entry);

  const groups: Entry[][] = Array.from({ length: numGroups }, () => []);
  seeded.forEach((entry, i) => {
    const row = Math.floor(i / numGroups);
    const posInRow = i % numGroups;
    const groupIndex = row % 2 === 0 ? posInRow : numGroups - 1 - posInRow;
    groups[groupIndex]!.push(entry);
  });
  return groups;
}

function validate(entries: Entry[], config: GroupsKnockoutConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const numGroups = config.numGroups;
  const qualifiersPerGroup = config.qualifiersPerGroup ?? 2;

  if (!Number.isInteger(numGroups) || numGroups < 2) {
    errors.push('Minimaal 2 poules nodig om te kruisen in de knock-outfase.');
    return { valid: false, errors, warnings };
  }

  if (numGroups > entries.length) {
    errors.push(`Meer poules (${numGroups}) dan deelnemers (${entries.length}).`);
    return { valid: false, errors, warnings };
  }

  if (entries.length % numGroups !== 0) {
    warnings.push('Deelnemers zijn niet gelijk over de poules te verdelen: sommige poules zijn groter, wat tot ongelijke rusttijden leidt.');
  }

  const smallestGroupSize = Math.floor(entries.length / numGroups);
  if (qualifiersPerGroup > smallestGroupSize) {
    errors.push(
      `${qualifiersPerGroup} qualifiers per poule gevraagd, maar de kleinste poule heeft er maar ${smallestGroupSize}.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

function generate(entries: Entry[], config: GroupsKnockoutConfig): Match[] {
  if (entries.length < 2) return [];

  const disciplineId = entries[0]!.disciplineId;
  const numGroups = config.numGroups;
  const qualifiersPerGroup = config.qualifiersPerGroup ?? 2;
  const includeThirdPlace = config.includeThirdPlace ?? true;

  const groups = snakeAssignGroups(entries, numGroups);
  const matches: Match[] = [];
  const groupPoolMatchIds: Record<string, string[]> = {};
  let maxPoolRounds = 0;

  groups.forEach((groupEntries, g) => {
    const letter = groupLetter(g);
    const rounds = roundRobinRounds(groupEntries);
    maxPoolRounds = Math.max(maxPoolRounds, rounds.length);
    groupPoolMatchIds[letter] = [];

    rounds.forEach((pairs, roundIndex) => {
      const round = roundIndex + 1;
      pairs.forEach(([home, away], i) => {
        const id = `${disciplineId}-poule${letter}-r${round}-m${i}`;
        groupPoolMatchIds[letter]!.push(id);
        matches.push({
          id,
          disciplineId,
          round,
          label: pairs.length === 1 ? `Poule ${letter} - ronde ${round}` : `Poule ${letter} - ronde ${round} - wedstrijd ${i + 1}`,
          home: { kind: 'entry', entryId: home.id },
          away: { kind: 'entry', entryId: away.id },
          durationMinutes: config.durationMinutes,
          dependsOn: [],
        });
      });
    });
  });

  // Cross the groups: seed order is [rank1 of every group, rank2 of every group, ...] so the
  // standard bracket seeding (reused from single elimination) never pairs two entries from the
  // same group in round one.
  const qualifiers: { groupId: string; rank: number }[] = [];
  for (let rank = 1; rank <= qualifiersPerGroup; rank++) {
    for (let g = 0; g < numGroups; g++) {
      qualifiers.push({ groupId: groupLetter(g), rank });
    }
  }

  const size = nextPowerOfTwo(qualifiers.length);
  const order = standardSeedOrder(size);
  const leaves: Slot[] = order.map((seedNumber) => {
    const q = qualifiers[seedNumber - 1];
    return q ? { kind: 'group_rank', groupId: q.groupId, rank: q.rank } : { kind: 'bye' };
  });

  const koMatches = buildEliminationBracket(
    leaves,
    disciplineId,
    `${disciplineId}-ko`,
    config.durationMinutes,
    includeThirdPlace,
  );

  for (const m of koMatches) {
    const dependsOn = new Set(m.dependsOn);
    for (const slot of [m.home, m.away]) {
      if (slot.kind === 'group_rank') {
        for (const id of groupPoolMatchIds[slot.groupId] ?? []) dependsOn.add(id);
      }
    }
    matches.push({ ...m, round: m.round + maxPoolRounds, dependsOn: [...dependsOn] });
  }

  return matches;
}

export const groupsKnockout: TournamentFormat<GroupsKnockoutConfig> = {
  name: 'groups_knockout',
  validate,
  generate,
};
