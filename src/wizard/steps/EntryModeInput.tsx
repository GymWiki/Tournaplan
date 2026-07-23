import { generateCountNames, parseParticipantNames } from '../entryNames';
import { resolveEntryNames, type EntryModeFields } from '../entryFields';

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

interface EntryModeInputProps {
  draft: EntryModeFields;
  update: (patch: Partial<EntryModeFields>) => void;
}

/** Shared by the "new tournament" wizard and the "add discipline" flow's entry step. */
export function EntryModeInput({ draft, update }: EntryModeInputProps) {
  function switchMode(mode: 'count' | 'names') {
    if (mode === draft.entryMode) return;
    if (mode === 'names') {
      // Nothing to preserve in count mode beyond the number — seed the textarea so the user
      // overwrites instead of starting from scratch.
      update({ entryMode: 'names', participantNamesText: generateCountNames(draft.entryCount).join('\n') });
    } else {
      const count = parseParticipantNames(draft.participantNamesText).length;
      update({ entryMode: 'count', entryCount: count > 0 ? count : draft.entryCount });
    }
  }

  const resolvedCount = resolveEntryNames(draft).length;

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md border border-gray-300 text-sm">
        <button
          type="button"
          onClick={() => switchMode('count')}
          className={`rounded-l-md px-3 py-1.5 ${draft.entryMode === 'count' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Aantal
        </button>
        <button
          type="button"
          onClick={() => switchMode('names')}
          className={`rounded-r-md px-3 py-1.5 ${draft.entryMode === 'names' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
        >
          Namen
        </button>
      </div>

      {draft.entryMode === 'count' ? (
        <div>
          <label className={labelClass} htmlFor="entryCount">
            Aantal teams
          </label>
          <input
            id="entryCount"
            type="number"
            min={2}
            className={inputClass}
            value={draft.entryCount}
            onChange={(e) => update({ entryCount: Number(e.target.value) })}
          />
          {draft.entryCount > 64 && (
            <p className="mt-1 text-sm text-amber-700">Dat zijn veel deelnemers ({draft.entryCount}) — controleer of dit klopt.</p>
          )}
        </div>
      ) : (
        <div>
          <label className={labelClass} htmlFor="participants">
            Eén naam per regel (plak gerust een hele lijst)
          </label>
          <textarea
            id="participants"
            rows={10}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-gray-500 focus:outline-none"
            value={draft.participantNamesText}
            onChange={(e) => update({ participantNamesText: e.target.value })}
            placeholder={'Team A\nTeam B\nTeam C'}
          />
        </div>
      )}

      <p className="text-sm text-gray-500">
        {resolvedCount} deelnemer(s). De volgorde van invoer is de seeding — de eerste is reekshoofd 1.
      </p>
    </div>
  );
}
