import type { FormatConfig, TournamentFormat } from '../types';
import { singleElimination } from './singleElimination';
import { roundRobin } from './roundRobin';
import { groupsKnockout } from './groupsKnockout';

/** Formats implemented so far. Swiss and double elimination are intentionally absent — see CLAUDE.md. */
export const availableFormats = {
  single_elimination: singleElimination,
  round_robin: roundRobin,
  groups_knockout: groupsKnockout,
} satisfies Record<string, TournamentFormat<FormatConfig>>;

export type AvailableFormatName = keyof typeof availableFormats;
