import { z } from 'zod';

const slotSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('entry'), entryId: z.string() }),
  z.object({ kind: z.literal('winner_of'), matchId: z.string() }),
  z.object({ kind: z.literal('loser_of'), matchId: z.string() }),
  z.object({ kind: z.literal('group_rank'), groupId: z.string(), rank: z.number() }),
  z.object({ kind: z.literal('bye') }),
]);

const participantSchema = z.object({ id: z.string(), name: z.string() });

const entrySchema = z.object({
  id: z.string(),
  disciplineId: z.string(),
  name: z.string(),
  participantIds: z.array(z.string()).min(1),
  seed: z.number().optional(),
});

const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  disciplineIds: z.array(z.string()),
});

const matchSchema = z.object({
  id: z.string(),
  disciplineId: z.string(),
  round: z.number(),
  label: z.string(),
  home: slotSchema,
  away: slotSchema,
  durationMinutes: z.number().positive(),
  dependsOn: z.array(z.string()),
  resourceId: z.string().optional(),
  startsAt: z.coerce.date().optional(),
});

const timeWindowSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});

const formatConfigSchema = z.object({ durationMinutes: z.number().positive() }).catchall(z.unknown());

const tournamentFormatNameSchema = z.enum(['single_elimination', 'double_elimination', 'round_robin', 'groups_knockout']);

const disciplineSchema = z.object({
  id: z.string(),
  name: z.string(),
  format: tournamentFormatNameSchema,
  formatConfig: formatConfigSchema,
  entries: z.array(entrySchema),
  matches: z.array(matchSchema),
  timeWindow: timeWindowSchema,
});

export const tournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  participants: z.array(participantSchema),
  disciplines: z.array(disciplineSchema),
  resources: z.array(resourceSchema),
});

export type ParsedTournament = z.infer<typeof tournamentSchema>;
