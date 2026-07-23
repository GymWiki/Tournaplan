import type { AvailableFormatName } from '../../tournament/formats/registry';
import { formatLabels } from '../formatLabels';
import type { StepProps } from './StepProps';

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export function StepFormat({ draft, update }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Vorm</h2>
      <div>
        <label className={labelClass} htmlFor="format">
          Toernooivorm
        </label>
        <select
          id="format"
          className={inputClass}
          value={draft.format}
          onChange={(e) => update({ format: e.target.value as AvailableFormatName })}
        >
          {Object.entries(formatLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="duration">
          Wedstrijdduur (minuten)
        </label>
        <input
          id="duration"
          type="number"
          min={1}
          className={inputClass}
          value={draft.matchDurationMinutes}
          onChange={(e) => update({ matchDurationMinutes: Number(e.target.value) })}
        />
      </div>

      {(draft.format === 'single_elimination' || draft.format === 'groups_knockout') && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={draft.includeThirdPlace}
            onChange={(e) => update({ includeThirdPlace: e.target.checked })}
          />
          Troostfinale (wedstrijd om de 3e plaats)
        </label>
      )}

      {draft.format === 'groups_knockout' && (
        <>
          <div>
            <label className={labelClass} htmlFor="numGroups">
              Aantal poules
            </label>
            <input
              id="numGroups"
              type="number"
              min={2}
              className={inputClass}
              value={draft.numGroups}
              onChange={(e) => update({ numGroups: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="qualifiers">
              Kwalificaties per poule
            </label>
            <input
              id="qualifiers"
              type="number"
              min={1}
              className={inputClass}
              value={draft.qualifiersPerGroup}
              onChange={(e) => update({ qualifiersPerGroup: Number(e.target.value) })}
            />
          </div>
        </>
      )}
    </div>
  );
}
