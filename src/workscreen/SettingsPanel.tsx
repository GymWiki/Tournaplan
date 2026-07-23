import { Plus, X } from 'lucide-react';
import { EntryModeInput } from '../wizard/steps/EntryModeInput';
import { StepFormat } from '../wizard/steps/StepFormat';
import { disciplineColorSwatchClass } from '../results/disciplineColors';
import { disciplineColors, defaultDisciplineDraft, type DisciplineDraft, type ResourceDraft, type WorkscreenState } from './types';

const inputClass = 'w-full rounded-block border border-line bg-panel px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelClass = 'mb-1 block text-sm font-medium text-ink';
const sectionHeadingClass = 'mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-muted';
const colorSwatch = disciplineColorSwatchClass;

interface SettingsPanelProps {
  state: WorkscreenState;
  onChange: (patch: Partial<WorkscreenState>) => void;
}

export function SettingsPanel({ state, onChange }: SettingsPanelProps) {
  const activeDiscipline = state.disciplines.find((d) => d.id === state.activeDisciplineId) ?? state.disciplines[0]!;
  const multipleDisciplines = state.disciplines.length > 1;

  function updateDiscipline(id: string, patch: Partial<DisciplineDraft>) {
    onChange({ disciplines: state.disciplines.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  }

  function addDiscipline() {
    const usedColors = new Set(state.disciplines.map((d) => d.color));
    const color = disciplineColors.find((c) => !usedColors.has(c)) ?? disciplineColors[0]!;
    const discipline = { ...defaultDisciplineDraft(''), color };
    onChange({ disciplines: [...state.disciplines, discipline], activeDisciplineId: discipline.id });
  }

  function updateResource(id: string, patch: Partial<ResourceDraft>) {
    onChange({ resources: state.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  }

  function addResource() {
    onChange({ resources: [...state.resources, { id: crypto.randomUUID(), name: `Veld ${state.resources.length + 1}`, disciplineIds: [] }] });
  }

  function removeResource(id: string) {
    onChange({ resources: state.resources.filter((r) => r.id !== id) });
  }

  function toggleResourceDiscipline(resource: ResourceDraft, disciplineId: string) {
    const allDisciplineIds = state.disciplines.map((d) => d.id);
    const currentlyAll = resource.disciplineIds.length === 0;
    const currentSet = new Set(currentlyAll ? allDisciplineIds : resource.disciplineIds);
    if (currentSet.has(disciplineId)) currentSet.delete(disciplineId);
    else currentSet.add(disciplineId);
    // If every discipline ends up included again, collapse back to "all" (empty array).
    const nextIds = allDisciplineIds.every((id) => currentSet.has(id)) ? [] : [...currentSet];
    updateResource(resource.id, { disciplineIds: nextIds });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className={sectionHeadingClass}>Toernooi</h2>
        <input
          className={inputClass}
          value={state.tournamentName}
          onChange={(e) => onChange({ tournamentName: e.target.value })}
          placeholder="Bijv. Sportdag 2026"
          aria-label="Toernooinaam"
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={sectionHeadingClass}>Onderdelen</h2>
          <button type="button" onClick={addDiscipline} className="flex items-center gap-1 rounded-block border border-line px-2 py-1 text-xs font-medium text-ink hover:bg-surface" aria-label="Onderdeel toevoegen">
            <Plus size={16} strokeWidth={1.5} />
            Onderdeel toevoegen
          </button>
        </div>

        {multipleDisciplines && (
          <div className="mb-3 flex flex-wrap gap-2">
            {state.disciplines.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onChange({ activeDisciplineId: d.id })}
                className={`flex items-center gap-1.5 rounded-block border px-2.5 py-1 text-sm ${
                  d.id === activeDiscipline.id ? 'border-accent bg-accent text-white' : 'border-line text-ink hover:bg-surface'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${colorSwatch[d.color]}`} />
                {d.name || 'Naamloos onderdeel'}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className={labelClass} htmlFor="disciplineName">
              Naam
            </label>
            <input
              id="disciplineName"
              className={inputClass}
              value={activeDiscipline.name}
              onChange={(e) => updateDiscipline(activeDiscipline.id, { name: e.target.value })}
              placeholder="Bijv. Voetbal"
            />
          </div>

          {multipleDisciplines && (
            <div>
              <p className={labelClass}>Lijnkleur</p>
              <div className="flex gap-2">
                {disciplineColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Kleur ${color}`}
                    onClick={() => updateDiscipline(activeDiscipline.id, { color })}
                    className={`h-8 w-8 rounded-full ${colorSwatch[color]} ${activeDiscipline.color === color ? 'ring-2 ring-accent ring-offset-2' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}

          <StepFormat draft={activeDiscipline} update={(patch) => updateDiscipline(activeDiscipline.id, patch)} showDuration={false} />
        </div>
      </section>

      <section>
        <h2 className={sectionHeadingClass}>Teams{multipleDisciplines ? ` — ${activeDiscipline.name || 'onderdeel'}` : ''}</h2>
        <EntryModeInput draft={activeDiscipline} update={(patch) => updateDiscipline(activeDiscipline.id, patch)} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={sectionHeadingClass}>Velden</h2>
          <button type="button" onClick={addResource} className="flex items-center gap-1 rounded-block border border-line px-2 py-1 text-xs font-medium text-ink hover:bg-surface" aria-label="Veld toevoegen">
            <Plus size={16} strokeWidth={1.5} />
            Veld toevoegen
          </button>
        </div>
        <div className="space-y-2">
          {state.resources.map((r) => (
            <div key={r.id} className="rounded-block border border-line p-2">
              <div className="flex items-center gap-2">
                <input className={inputClass} value={r.name} onChange={(e) => updateResource(r.id, { name: e.target.value })} />
                <button
                  type="button"
                  onClick={() => removeResource(r.id)}
                  aria-label={`Verwijder ${r.name || 'veld'}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-block border border-line text-ink-muted hover:bg-surface"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              {multipleDisciplines && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {state.disciplines.map((d) => {
                    const isOn = r.disciplineIds.length === 0 || r.disciplineIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleResourceDiscipline(r, d.id)}
                        className={`rounded-full border px-2 py-0.5 text-xs ${isOn ? 'border-accent bg-accent/10 text-accent' : 'border-line text-ink-muted'}`}
                      >
                        {d.name || 'Onderdeel'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={sectionHeadingClass}>Speelduur{multipleDisciplines ? ` — ${activeDiscipline.name || 'onderdeel'}` : ''}</h2>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={activeDiscipline.matchDurationMinutes}
            onChange={(e) => updateDiscipline(activeDiscipline.id, { matchDurationMinutes: Number(e.target.value) })}
          />
          <span className="shrink-0 text-sm text-ink-muted">minuten</span>
        </div>
      </section>

      <section>
        <h2 className={sectionHeadingClass}>Starttijd (optioneel)</h2>
        <input
          type="datetime-local"
          className={inputClass}
          value={
            state.startTime
              ? `${state.startTime.getFullYear()}-${String(state.startTime.getMonth() + 1).padStart(2, '0')}-${String(state.startTime.getDate()).padStart(2, '0')}T${String(state.startTime.getHours()).padStart(2, '0')}:${String(state.startTime.getMinutes()).padStart(2, '0')}`
              : ''
          }
          onChange={(e) => onChange({ startTime: e.target.value ? new Date(e.target.value) : undefined })}
        />
      </section>
    </div>
  );
}
