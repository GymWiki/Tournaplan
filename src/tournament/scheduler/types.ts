import type { DisciplineId, Match, MatchId, ParticipantId, ResourceId } from '../types';

export interface SchedulingConflict {
  matchId: MatchId;
  disciplineId: DisciplineId;
  reason: string;
  suggestion: string;
}

export interface ScheduleOptions {
  /** Minimum rest between two matches of the same participant, in minutes. Default 15. */
  minRestMinutes?: number;
  /** How many swap attempts the soft-constraint improvement loop makes. Default 200. */
  improvementIterations?: number;
}

export interface SchedulingReport {
  /**
   * Every input match, in original order. Matches that could be placed carry resourceId and
   * startOffsetMinutes; matches listed in `conflicts` keep those fields undefined.
   */
  matches: Match[];
  conflicts: SchedulingConflict[];
  /** Soft-constraint penalty score across the whole schedule — lower is better, 0 is perfect. */
  score: number;
  /** Total busy minutes per resource. There's no time window, so this isn't a fraction of anything. */
  resourceUtilization: Record<ResourceId, number>;
  /** Longest gap between two consecutive matches, per participant, in minutes. */
  longestWaitMinutesByParticipant: Record<ParticipantId, number>;
  /** Offset (in minutes) at which the last match finishes, or null if nothing got scheduled. */
  finishOffsetMinutes: number | null;
}
