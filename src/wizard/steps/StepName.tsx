import type { StepProps } from './StepProps';

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export function StepName({ draft, update }: StepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Naam</h2>
      <div>
        <label className={labelClass} htmlFor="tournamentName">
          Toernooinaam
        </label>
        <input
          id="tournamentName"
          className={inputClass}
          value={draft.tournamentName}
          onChange={(e) => update({ tournamentName: e.target.value })}
          placeholder="Bijv. Zomertoernooi 2026"
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="disciplineName">
          Onderdeel
        </label>
        <input
          id="disciplineName"
          className={inputClass}
          value={draft.disciplineName}
          onChange={(e) => update({ disciplineName: e.target.value })}
          placeholder="Bijv. Voetbal 6v6"
        />
      </div>
    </div>
  );
}
