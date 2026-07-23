import type { Entry, EntryId, Match, MatchId, Participant, ResourceId } from '../tournament/types';
import { matchParticipants } from '../tournament/scheduler/participants';
import { disciplineColorBorderClass, type DisciplineColor } from './disciplineColors';
import { MatchRow } from './MatchRow';

interface ScheduleByParticipantProps {
  matches: Match[];
  participants: Participant[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  resourceNameById: Map<ResourceId, string>;
  disciplineNameById: Map<string, string>;
  disciplineColorById?: Map<string, DisciplineColor>;
  startTime?: Date;
}

export function ScheduleByParticipant({
  matches,
  participants,
  entryById,
  matchById,
  resourceNameById,
  disciplineNameById,
  disciplineColorById,
  startTime,
}: ScheduleByParticipantProps) {
  const scheduled = matches.filter((m) => m.startOffsetMinutes !== undefined);

  const byParticipant = new Map<string, Match[]>();
  for (const match of scheduled) {
    for (const pid of matchParticipants(match, entryById)) {
      if (!byParticipant.has(pid)) byParticipant.set(pid, []);
      byParticipant.get(pid)!.push(match);
    }
  }

  const participantsWithMatches = participants.filter((p) => byParticipant.has(p.id));

  if (participantsWithMatches.length === 0) {
    return <p className="text-sm text-ink-muted">Nog geen wedstrijden ingepland.</p>;
  }

  return (
    <div className="space-y-6">
      {participantsWithMatches.map((participant) => {
        const list = byParticipant.get(participant.id)!.sort((a, b) => a.startOffsetMinutes! - b.startOffsetMinutes!);
        return (
          <div key={participant.id}>
            <h3 className="mb-1 font-display text-sm font-bold text-ink">{participant.name}</h3>
            {list.map((match, index) => {
              const color = disciplineColorById?.get(match.disciplineId);
              return (
                <MatchRow
                  key={match.id}
                  match={match}
                  entryById={entryById}
                  matchById={matchById}
                  resourceName={match.resourceId ? resourceNameById.get(match.resourceId) : undefined}
                  disciplineName={disciplineNameById.get(match.disciplineId)}
                  colorBorderClass={color ? disciplineColorBorderClass[color] : undefined}
                  startTime={startTime}
                  fallbackLabel={`Wedstrijd ${index + 1}`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
