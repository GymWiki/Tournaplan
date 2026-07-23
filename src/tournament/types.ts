export type ParticipantId = string;
export type EntryId = string;
export type DisciplineId = string;
export type ResourceId = string;
export type MatchId = string;
export type GroupId = string;

export type TournamentFormatName =
  | 'single_elimination'
  | 'double_elimination'
  | 'round_robin'
  | 'groups_knockout';

/** A person or team that exists at tournament level, independent of any discipline. */
export interface Participant {
  id: ParticipantId;
  name: string;
}

/** A team or individual competing in one specific discipline. May bundle several participants. */
export interface Entry {
  id: EntryId;
  disciplineId: DisciplineId;
  name: string;
  participantIds: ParticipantId[];
  seed?: number;
}

/** A field, court, table or ring. Shared across disciplines that list it in disciplineIds. */
export interface Resource {
  id: ResourceId;
  name: string;
  disciplineIds: DisciplineId[];
}

/**
 * What fills a match's home/away side. Only 'entry' is a concrete participant;
 * the rest are placeholders the bracket resolves once earlier matches are played —
 * this is what lets a schedule be generated before any result exists.
 */
export type Slot =
  | { kind: 'entry'; entryId: EntryId }
  | { kind: 'winner_of'; matchId: MatchId }
  | { kind: 'loser_of'; matchId: MatchId }
  | { kind: 'group_rank'; groupId: GroupId; rank: number }
  | { kind: 'bye' };

export interface Match {
  id: MatchId;
  disciplineId: DisciplineId;
  round: number;
  label: string;
  home: Slot;
  away: Slot;
  durationMinutes: number;
  /** matchIds that must be played before this one — read by the scheduler, written by the bracket engine. */
  dependsOn: MatchId[];
  resourceId?: ResourceId;
  startsAt?: Date;
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FormatConfig {
  durationMinutes: number;
  [key: string]: unknown;
}

/** Implemented per format in src/tournament/formats/. Pure: no time, no resources. */
export interface TournamentFormat<Config extends FormatConfig = FormatConfig> {
  name: TournamentFormatName;
  validate(entries: Entry[], config: Config): ValidationResult;
  generate(entries: Entry[], config: Config): Match[];
}

export interface Discipline {
  id: DisciplineId;
  name: string;
  format: TournamentFormatName;
  formatConfig: FormatConfig;
  entries: Entry[];
  matches: Match[];
  timeWindow: TimeWindow;
}

export interface Tournament {
  id: string;
  name: string;
  participants: Participant[];
  disciplines: Discipline[];
  resources: Resource[];
}
