import type { WizardDraft } from './draft';

export function stepNameIsValid(draft: Pick<WizardDraft, 'tournamentName' | 'disciplineName'>): boolean {
  return draft.tournamentName.trim().length > 0 && draft.disciplineName.trim().length > 0;
}
