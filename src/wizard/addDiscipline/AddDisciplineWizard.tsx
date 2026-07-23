import { useState } from 'react';
import type { Tournament } from '../../tournament/types';
import { parseParticipantNames } from '../draft';
import { StepFormat } from '../steps/StepFormat';
import { defaultAddDisciplineDraft, type AddDisciplineDraft } from './draft';
import { StepDisciplineName } from './steps/StepDisciplineName';
import { StepDisciplineEntries } from './steps/StepDisciplineEntries';
import { StepDisciplineResources } from './steps/StepDisciplineResources';
import { StepDisciplineReview } from './steps/StepDisciplineReview';

interface AddDisciplineWizardProps {
  tournament: Tournament;
  onAdd: (tournament: Tournament) => void;
  onCancel: () => void;
}

const steps = ['Naam', 'Vorm', 'Deelnemers', 'Velden', 'Overzicht'] as const;

function isStepValid(stepIndex: number, draft: AddDisciplineDraft): boolean {
  switch (stepIndex) {
    case 0:
      return draft.disciplineName.trim().length > 0;
    case 2:
      return draft.selectedParticipantIds.length + parseParticipantNames(draft.newParticipantNamesText).length >= 2;
    default:
      return true;
  }
}

export function AddDisciplineWizard({ tournament, onAdd, onCancel }: AddDisciplineWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<AddDisciplineDraft>(() => defaultAddDisciplineDraft(tournament));

  function update(patch: Partial<AddDisciplineDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  const canAdvance = isStepValid(stepIndex, draft);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <p className="mb-2 text-sm text-gray-500">Onderdeel toevoegen aan {tournament.name}</p>
      <ol className="mb-6 flex flex-wrap gap-2 text-xs">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 ${i === stepIndex ? 'bg-gray-900 text-white' : i < stepIndex ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="rounded-lg border border-gray-200 p-6">
        {stepIndex === 0 && <StepDisciplineName draft={draft} update={update} />}
        {stepIndex === 1 && <StepFormat draft={draft} update={update} />}
        {stepIndex === 2 && <StepDisciplineEntries tournament={tournament} draft={draft} update={update} />}
        {stepIndex === 3 && <StepDisciplineResources tournament={tournament} draft={draft} update={update} />}
        {stepIndex === 4 && <StepDisciplineReview tournament={tournament} draft={draft} onAdd={onAdd} />}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={() => (stepIndex === 0 ? onCancel() : setStepIndex((i) => i - 1))}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          {stepIndex === 0 ? 'Annuleren' : 'Vorige'}
        </button>
        {stepIndex < steps.length - 1 && (
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => setStepIndex((i) => i + 1)}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Volgende
          </button>
        )}
      </div>
    </div>
  );
}
