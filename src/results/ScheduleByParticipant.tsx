import type { Entry, EntryId, Match, MatchId, Participant, ResourceId } from '../tournament/types';
import { matchParticipants } from '../tournament/scheduler/participants';
import { MatchRow } from './MatchRow';

interface ScheduleByParticipantProps {
  matches: Match[];
  participants: Participant[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
  resourceNameById: Map<ResourceId, string>;
  disciplineNameById: Map<string, string>;
}

export function ScheduleByParticipant({ matches, participants, entryById, matchById, resourceNameById, disciplineNameById }: ScheduleByParticipantProps) {
  const scheduled = matches.filter((m) => m.startsAt !== undefined);

  const byParticipant = new Map<string, Match[]>();
  for (const match of scheduled) {
    for (const pid of matchParticipants(match, entryById)) {
      if (!byParticipant.has(pid)) byParticipant.set(pid, []);
      byParticipant.get(pid)!.push(match);
    }
  }

  const participantsWithMatches = participants.filter((p) => byParticipant.has(p.id));

  if (participantsWithMatches.length === 0) {
    return <p className="text-sm text-gray-500">Nog geen wedstrijden ingepland.</p>;
  }

  return (
    <div className="space-y-6">
      {participantsWithMatches.map((participant) => {
        const list = byParticipant.get(participant.id)!.sort((a, b) => a.startsAt!.getTime() - b.startsAt!.getTime());
        return (
          <div key={participant.id}>
            <h3 className="mb-1 text-sm font-semibold text-gray-900">{participant.name}</h3>
            {list.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                entryById={entryById}
                matchById={matchById}
                resourceName={match.resourceId ? resourceNameById.get(match.resourceId) : undefined}
                disciplineName={disciplineNameById.get(match.disciplineId)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
