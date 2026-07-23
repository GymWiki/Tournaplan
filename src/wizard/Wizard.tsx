import { useState } from 'react';
import type { Tournament } from '../tournament/types';
import { defaultDraft, type WizardDraft } from './draft';
import { buildTournamentFromDraft } from './build';
import { resolveEntryNames } from './entryFields';
import { stepNameIsValid } from './validation';
import { StepName } from './steps/StepName';
import { StepFormat } from './steps/StepFormat';
import { StepEntries } from './steps/StepEntries';
import { StepResources } from './steps/StepResources';
import { StepReview } from './steps/StepReview';

interface WizardProps {
  onComplete: (tournament: Tournament) => void;
  onCancel: () => void;
}

const steps = ['Naam', 'Vorm', 'Deelnemers', 'Velden', 'Overzicht'] as const;

function isStepValid(stepIndex: number, draft: WizardDraft): boolean {
  switch (stepIndex) {
    case 0:
      return stepNameIsValid(draft);
    case 2:
      return resolveEntryNames(draft).length >= 2;
    default:
      return true;
  }
}

export function Wizard({ onComplete, onCancel }: WizardProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>(defaultDraft());

  function update(patch: Partial<WizardDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function handleGenerate() {
    const { tournament } = buildTournamentFromDraft(draft);
    onComplete(tournament);
  }

  const canAdvance = isStepValid(stepIndex, draft);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
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
        {stepIndex === 0 && <StepName draft={draft} update={update} />}
        {stepIndex === 1 && <StepFormat draft={draft} update={update} />}
        {stepIndex === 2 && <StepEntries draft={draft} update={update} />}
        {stepIndex === 3 && <StepResources draft={draft} update={update} />}
        {stepIndex === 4 && <StepReview draft={draft} update={update} onGenerate={handleGenerate} />}
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
