import { useMemo } from 'react';
import type { Tournament } from '../tournament/types';
import { schedule } from '../tournament/scheduler';
import { downloadTournamentJson } from '../persistence/fileTransfer';
import { ConflictsPanel } from './ConflictsPanel';
import { BracketView } from './BracketView';
import { ScheduleTabs } from './ScheduleTabs';

interface ResultsProps {
  tournament: Tournament;
  onBack: () => void;
}

export function Results({ tournament, onBack }: ResultsProps) {
  const report = useMemo(() => schedule(tournament), [tournament]);
  const discipline = tournament.disciplines[0]!;

  const entryById = useMemo(() => new Map(tournament.disciplines.flatMap((d) => d.entries).map((e) => [e.id, e])), [tournament]);
  const matchById = useMemo(() => new Map(report.matches.map((m) => [m.id, m])), [report.matches]);

  const showBracket = discipline.format === 'single_elimination' || discipline.format === 'groups_knockout';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{tournament.name}</h1>
          <p className="text-sm text-gray-500">{discipline.name}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => downloadTournamentJson(tournament)} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Exporteren (JSON)
          </button>
          <button type="button" onClick={onBack} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Terug naar overzicht
          </button>
        </div>
      </div>

      <ConflictsPanel conflicts={report.conflicts} matchById={matchById} />

      {showBracket && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Bracket</h2>
          <BracketView matches={report.matches} entryById={entryById} matchById={matchById} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Schema</h2>
        <ScheduleTabs
          matches={report.matches}
          resources={tournament.resources}
          participants={tournament.participants}
          entryById={entryById}
          matchById={matchById}
        />
      </section>
    </div>
  );
}
