import type { FormatSelection } from '../wizard/formatSelection';
import type { EntryModeFields } from '../wizard/entryFields';
import { defaultFormatSelection } from '../wizard/formatSelection';
import { defaultEntryModeFields } from '../wizard/entryFields';

/** The fixed set of five discipline line colors an organizer picks from. */
export const disciplineColors = ['blue', 'red', 'yellow', 'green', 'purple'] as const;
export type DisciplineColor = (typeof disciplineColors)[number];

export interface DisciplineDraft extends FormatSelection, EntryModeFields {
  id: string;
  name: string;
  color: DisciplineColor;
}

export interface ResourceDraft {
  id: string;
  name: string;
  /** Empty means usable by every discipline — matches the domain model directly. */
  disciplineIds: string[];
}

export interface WorkscreenState {
  tournamentName: string;
  disciplines: DisciplineDraft[];
  resources: ResourceDraft[];
  startTime?: Date;
  activeDisciplineId: string;
}

export function defaultDisciplineDraft(name = ''): DisciplineDraft {
  return {
    id: crypto.randomUUID(),
    name,
    color: 'blue',
    ...defaultFormatSelection(),
    ...defaultEntryModeFields(),
    // Starts empty, not the wizard's convenience default of 8 — the workscreen's empty state is
    // meant to actually show until the organizer adds teams.
    entryCount: 0,
  };
}

export function defaultWorkscreenState(): WorkscreenState {
  const discipline = defaultDisciplineDraft();
  return {
    tournamentName: '',
    disciplines: [discipline],
    resources: [{ id: crypto.randomUUID(), name: 'Veld 1', disciplineIds: [] }],
    startTime: undefined,
    activeDisciplineId: discipline.id,
  };
}
