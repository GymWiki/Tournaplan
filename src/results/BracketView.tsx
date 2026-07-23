import type { Entry, EntryId, Match, MatchId } from '../tournament/types';
import { buildBracketColumns } from './bracketColumns';
import { BracketMatchCard } from './BracketMatchCard';

interface BracketViewProps {
  matches: Match[];
  entryById: Map<EntryId, Entry>;
  matchById: Map<MatchId, Match>;
}

export function BracketView({ matches, entryById, matchById }: BracketViewProps) {
  const { columns, thirdPlaceMatch } = buildBracketColumns(matches);

  if (columns.length === 0) {
    return <p className="text-sm text-gray-500">Dit format heeft geen knock-outfase om te tonen.</p>;
  }

  return (
    <div>
      <div className="flex gap-8 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.round} className="flex min-w-[12rem] flex-col justify-around gap-4">
            <h3 className="text-center text-sm font-semibold text-gray-700">{column.title}</h3>
            {column.matches.map((match) => (
              <BracketMatchCard key={match.id} match={match} entryById={entryById} matchById={matchById} />
            ))}
          </div>
        ))}
      </div>
      {thirdPlaceMatch && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Om de 3e plaats</h3>
          <BracketMatchCard match={thirdPlaceMatch} entryById={entryById} matchById={matchById} />
        </div>
      )}
    </div>
  );
}
