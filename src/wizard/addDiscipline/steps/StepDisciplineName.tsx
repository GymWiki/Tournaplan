import type { AddDisciplineDraft } from '../draft';

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface StepDisciplineNameProps {
  draft: AddDisciplineDraft;
  update: (patch: Partial<AddDisciplineDraft>) => void;
}

export function StepDisciplineName({ draft, update }: StepDisciplineNameProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Naam</h2>
      <div>
        <label className={labelClass} htmlFor="newDisciplineName">
          Onderdeel
        </label>
        <input
          id="newDisciplineName"
          className={inputClass}
          value={draft.disciplineName}
          onChange={(e) => update({ disciplineName: e.target.value })}
          placeholder="Bijv. Volleybal"
        />
      </div>
    </div>
  );
}
