import type { WizardDraft } from './draft';

export function stepNameIsValid(draft: Pick<WizardDraft, 'tournamentName' | 'disciplineName'>): boolean {
  return draft.tournamentName.trim().length > 0 && draft.disciplineName.trim().length > 0;
}

export function stepWindowIsValid(draft: Pick<WizardDraft, 'windowStartLocal' | 'windowEndLocal'>): boolean {
  if (!draft.windowStartLocal || !draft.windowEndLocal) return false;
  return new Date(draft.windowStartLocal).getTime() < new Date(draft.windowEndLocal).getTime();
}
