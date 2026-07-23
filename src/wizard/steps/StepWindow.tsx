const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export interface TimeWindowFields {
  windowStartLocal: string;
  windowEndLocal: string;
}

interface StepWindowProps {
  draft: TimeWindowFields;
  update: (patch: Partial<TimeWindowFields>) => void;
}

/** Reused by both the "new tournament" wizard and the "add discipline" flow. */
export function StepWindow({ draft, update }: StepWindowProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Tijdvenster</h2>
      <div>
        <label className={labelClass} htmlFor="windowStart">
          Start
        </label>
        <input
          id="windowStart"
          type="datetime-local"
          className={inputClass}
          value={draft.windowStartLocal}
          onChange={(e) => update({ windowStartLocal: e.target.value })}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="windowEnd">
          Einde
        </label>
        <input
          id="windowEnd"
          type="datetime-local"
          className={inputClass}
          value={draft.windowEndLocal}
          onChange={(e) => update({ windowEndLocal: e.target.value })}
        />
      </div>
    </div>
  );
}
