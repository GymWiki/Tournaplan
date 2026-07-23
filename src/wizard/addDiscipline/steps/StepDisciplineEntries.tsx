import type { Tournament } from '../../../tournament/types';
import { parseParticipantNames } from '../../draft';
import type { AddDisciplineDraft } from '../draft';

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface StepDisciplineEntriesProps {
  tournament: Tournament;
  draft: AddDisciplineDraft;
  update: (patch: Partial<AddDisciplineDraft>) => void;
}

export function StepDisciplineEntries({ tournament, draft, update }: StepDisciplineEntriesProps) {
  function toggleParticipant(id: string) {
    const selectedParticipantIds = draft.selectedParticipantIds.includes(id)
      ? draft.selectedParticipantIds.filter((x) => x !== id)
      : [...draft.selectedParticipantIds, id];
    update({ selectedParticipantIds });
  }

  const newCount = parseParticipantNames(draft.newParticipantNamesText).length;
  const totalCount = draft.selectedParticipantIds.length + newCount;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Deelnemers</h2>

      {tournament.participants.length > 0 && (
        <div>
          <p className={labelClass}>Bestaande deelnemers die ook meedoen aan dit onderdeel</p>
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-gray-200 p-2">
            {tournament.participants.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={draft.selectedParticipantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="newParticipants">
          Nieuwe deelnemers (één naam per regel)
        </label>
        <textarea
          id="newParticipants"
          rows={4}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-gray-500 focus:outline-none"
          value={draft.newParticipantNamesText}
          onChange={(e) => update({ newParticipantNamesText: e.target.value })}
        />
      </div>

      <p className="text-sm text-gray-500">{totalCount} deelnemer(s) voor dit onderdeel.</p>
    </div>
  );
}
