import { useMemo } from 'react';
import type { Tournament } from '../../../tournament/types';
import { formatLabels } from '../../formatLabels';
import { buildTournamentWithNewDiscipline } from '../build';
import type { AddDisciplineDraft } from '../draft';

interface StepDisciplineReviewProps {
  tournament: Tournament;
  draft: AddDisciplineDraft;
  onAdd: (tournament: Tournament) => void;
}

export function StepDisciplineReview({ tournament, draft, onAdd }: StepDisciplineReviewProps) {
  const preview = useMemo(() => buildTournamentWithNewDiscipline(tournament, draft), [tournament, draft]);
  const { tournament: updated, validation } = preview;
  const newDiscipline = updated.disciplines[updated.disciplines.length - 1]!;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Overzicht</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-gray-500">Onderdeel</dt>
        <dd className="text-gray-900">{draft.disciplineName || '—'}</dd>
        <dt className="text-gray-500">Vorm</dt>
        <dd className="text-gray-900">{formatLabels[draft.format]}</dd>
        <dt className="text-gray-500">Deelnemers</dt>
        <dd className="text-gray-900">{newDiscipline.entries.length}</dd>
        <dt className="text-gray-500">Velden</dt>
        <dd className="text-gray-900">{newDiscipline.entries.length > 0 ? updated.resources.filter((r) => r.disciplineIds.includes(newDiscipline.id)).length : 0}</dd>
        <dt className="text-gray-500">Tijdvenster</dt>
        <dd className="text-gray-900">
          {draft.windowStartLocal || '—'} t/m {draft.windowEndLocal || '—'}
        </dd>
      </dl>

      {validation.errors.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p className="font-medium">Kan nog niet toevoegen:</p>
          <ul className="list-disc pl-5">
            {validation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <ul className="list-disc pl-5">
            {validation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        disabled={!validation.valid}
        onClick={() => onAdd(updated)}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Onderdeel toevoegen
      </button>
    </div>
  );
}
