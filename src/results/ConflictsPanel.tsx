import type { Match } from '../tournament/types';
import type { SchedulingConflict } from '../tournament/scheduler';

interface ConflictsPanelProps {
  conflicts: SchedulingConflict[];
  matchById: Map<string, Match>;
}

export function ConflictsPanel({ conflicts, matchById }: ConflictsPanelProps) {
  if (conflicts.length === 0) return null;

  return (
    <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
      <p className="mb-2 text-sm font-medium text-red-800">
        {conflicts.length} wedstrijd(en) konden niet worden ingepland
      </p>
      <ul className="space-y-2 text-sm text-red-800">
        {conflicts.map((conflict) => (
          <li key={conflict.matchId}>
            <span className="font-medium">{matchById.get(conflict.matchId)?.label ?? conflict.matchId}:</span> {conflict.reason}{' '}
            <span className="italic">{conflict.suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
