import { parseParticipantNames } from '../draft';
import type { StepProps } from './StepProps';

const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export function StepEntries({ draft, update }: StepProps) {
  const count = parseParticipantNames(draft.participantNamesText).length;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-gray-900">Deelnemers</h2>
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
      <p className="text-sm text-gray-500">{count} deelnemer(s) herkend.</p>
    </div>
  );
}
