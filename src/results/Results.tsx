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
  onTournamentUpdate: (tournament: Tournament) => void;
}

function dateToInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function Results({ tournament, onBack, onAddDiscipline, onTournamentUpdate }: ResultsProps) {
  const report = useMemo(() => schedule(tournament), [tournament]);

  const entryById = useMemo(() => new Map(tournament.disciplines.flatMap((d) => d.entries).map((e) => [e.id, e])), [tournament]);
  const matchById = useMemo(() => new Map(report.matches.map((m) => [m.id, m])), [report.matches]);

  // Purely a display transform on top of the already-computed offsets — never triggers rescheduling.
  function handleStartTimeChange(value: string) {
    onTournamentUpdate({ ...tournament, startTime: value ? new Date(value) : undefined });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{tournament.name}</h1>
          <p className="text-sm text-gray-500">{tournament.disciplines.map((d) => d.name).join(', ')}</p>
        </div>
        <div className="no-print flex gap-2">
          <button type="button" onClick={onAddDiscipline} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            + Onderdeel toevoegen
          </button>
          <button type="button" onClick={() => window.print()} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Afdrukken / PDF
          </button>
          <button type="button" onClick={() => downloadTournamentJson(tournament)} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Exporteren (JSON)
          </button>
          <button type="button" onClick={onBack} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Terug naar overzicht
          </button>
        </div>
      </div>

      <div className="no-print mb-6 flex items-center gap-2 text-sm">
        <label htmlFor="displayStartTime" className="text-gray-600">
          Starttijd (optioneel, alleen voor weergave):
        </label>
        <input
          id="displayStartTime"
          type="datetime-local"
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
          value={tournament.startTime ? dateToInputValue(tournament.startTime) : ''}
          onChange={(e) => handleStartTimeChange(e.target.value)}
        />
        {tournament.startTime && (
          <button type="button" onClick={() => handleStartTimeChange('')} className="text-gray-500 hover:underline">
            Wissen
          </button>
        )}
      </div>

      <ConflictsPanel conflicts={report.conflicts} matchById={matchById} />

      {tournament.disciplines.map((discipline) => {
        const showBracket = discipline.format === 'single_elimination' || discipline.format === 'groups_knockout';
        if (!showBracket) return null;
        const disciplineMatches = report.matches.filter((m) => m.disciplineId === discipline.id);
        return (
          <section key={discipline.id} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Bracket — {discipline.name}</h2>
            <BracketView matches={disciplineMatches} entryById={entryById} matchById={matchById} startTime={tournament.startTime} />
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
          startTime={tournament.startTime}
        />
      </section>
    </div>
  );
}
