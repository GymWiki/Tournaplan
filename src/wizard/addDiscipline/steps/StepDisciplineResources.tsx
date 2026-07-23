import type { Tournament } from '../../../tournament/types';
import type { AddDisciplineDraft } from '../draft';

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface StepDisciplineResourcesProps {
  tournament: Tournament;
  draft: AddDisciplineDraft;
  update: (patch: Partial<AddDisciplineDraft>) => void;
}

export function StepDisciplineResources({ tournament, draft, update }: StepDisciplineResourcesProps) {
  function toggleResource(id: string) {
    const selectedResourceIds = draft.selectedResourceIds.includes(id)
      ? draft.selectedResourceIds.filter((x) => x !== id)
      : [...draft.selectedResourceIds, id];
    update({ selectedResourceIds });
  }

  function setNewResourceName(index: number, name: string) {
    update({ newResourceNames: draft.newResourceNames.map((n, i) => (i === index ? name : n)) });
  }

  function removeNewResource(index: number) {
    update({ newResourceNames: draft.newResourceNames.filter((_, i) => i !== index) });
  }

  function addNewResource() {
    update({ newResourceNames: [...draft.newResourceNames, ''] });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Velden</h2>

      {tournament.resources.length > 0 && (
        <div>
          <p className={labelClass}>Bestaande velden die ook voor dit onderdeel bruikbaar zijn</p>
          <div className="space-y-1 rounded-md border border-gray-200 p-2">
            {tournament.resources.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={draft.selectedResourceIds.includes(r.id)} onChange={() => toggleResource(r.id)} />
                {r.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className={labelClass}>Nieuwe velden voor dit onderdeel</p>
        {draft.newResourceNames.map((name, index) => (
          <div key={index} className="flex gap-2">
            <input className={inputClass} value={name} onChange={(e) => setNewResourceName(index, e.target.value)} placeholder="Bijv. Zaal 1" />
            <button
              type="button"
              onClick={() => removeNewResource(index)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
              aria-label="Verwijder veld"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={addNewResource} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          + Veld toevoegen
        </button>
      </div>
    </div>
  );
}
