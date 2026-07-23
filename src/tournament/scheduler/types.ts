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
   * startsAt; matches listed in `conflicts` keep those fields undefined.
   */
  matches: Match[];
  conflicts: SchedulingConflict[];
  /** Soft-constraint penalty score across the whole schedule — lower is better, 0 is perfect. */
  score: number;
  /** Fraction (0..1) of each resource's available window spent on matches. */
  resourceUtilization: Record<ResourceId, number>;
  /** Longest gap between two consecutive matches, per participant, in minutes. */
  longestWaitMinutesByParticipant: Record<ParticipantId, number>;
  /** Latest scheduled match end across the whole tournament, or null if nothing got scheduled. */
  endsAt: Date | null;
}
