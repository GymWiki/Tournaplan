import type { Tournament } from '../../../tournament/types';
import { EntryModeInput } from '../../steps/EntryModeInput';
import { existingParticipantNamesText } from '../draft';
import type { AddDisciplineDraft } from '../draft';

interface StepDisciplineEntriesProps {
  tournament: Tournament;
  draft: AddDisciplineDraft;
  update: (patch: Partial<AddDisciplineDraft>) => void;
}

export function StepDisciplineEntries({ tournament, draft, update }: StepDisciplineEntriesProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Deelnemers</h2>

      {tournament.participants.length > 0 && (
        <button
          type="button"
          onClick={() => update({ entryMode: 'names', participantNamesText: existingParticipantNamesText(tournament) })}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Dezelfde deelnemers overnemen
        </button>
      )}

      <EntryModeInput draft={draft} update={update} />

      <p className="text-sm text-gray-500">
        Een naam die al bestaat als deelnemer wordt automatisch gekoppeld aan diezelfde deelnemer — zo speelt niemand twee keer tegelijk over disciplines heen.
      </p>
    </div>
  );
}
