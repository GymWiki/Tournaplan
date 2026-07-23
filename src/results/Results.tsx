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
  onAddDiscipline: () => void;
}

export function Results({ tournament, onBack, onAddDiscipline }: ResultsProps) {
  const report = useMemo(() => schedule(tournament), [tournament]);

  const entryById = useMemo(() => new Map(tournament.disciplines.flatMap((d) => d.entries).map((e) => [e.id, e])), [tournament]);
  const matchById = useMemo(() => new Map(report.matches.map((m) => [m.id, m])), [report.matches]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{tournament.name}</h1>
          <p className="text-sm text-gray-500">{tournament.disciplines.map((d) => d.name).join(', ')}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onAddDiscipline} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            + Onderdeel toevoegen
          </button>
          <button type="button" onClick={() => downloadTournamentJson(tournament)} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Exporteren (JSON)
          </button>
          <button type="button" onClick={onBack} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Terug naar overzicht
          </button>
        </div>
      </div>

      <ConflictsPanel conflicts={report.conflicts} matchById={matchById} />

      {tournament.disciplines.map((discipline) => {
        const showBracket = discipline.format === 'single_elimination' || discipline.format === 'groups_knockout';
        if (!showBracket) return null;
        const disciplineMatches = report.matches.filter((m) => m.disciplineId === discipline.id);
        return (
          <section key={discipline.id} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Bracket — {discipline.name}</h2>
            <BracketView matches={disciplineMatches} entryById={entryById} matchById={matchById} />
          </section>
        );
      })}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Schema</h2>
        <ScheduleTabs
          matches={report.matches}
          resources={tournament.resources}
          participants={tournament.participants}
          disciplines={tournament.disciplines}
          entryById={entryById}
          matchById={matchById}
        />
      </section>
    </div>
  );
}
