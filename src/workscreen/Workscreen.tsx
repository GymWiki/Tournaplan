import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { defaultWorkscreenState, type WorkscreenState } from './types';
import { buildTournamentFromWorkscreenState } from './build';
import { SettingsPanel } from './SettingsPanel';
import { SchedulePanel } from './SchedulePanel';

interface WorkscreenProps {
  onBack: () => void;
  initialState?: WorkscreenState;
}

export function Workscreen({ onBack, initialState }: WorkscreenProps) {
  const [state, setState] = useState<WorkscreenState>(initialState ?? defaultWorkscreenState());
  const [mobileTab, setMobileTab] = useState<'settings' | 'schema'>('settings');

  function onChange(patch: Partial<WorkscreenState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  const { tournament } = useMemo(() => buildTournamentFromWorkscreenState(state), [state]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="no-print flex items-center gap-3 border-b border-line bg-panel px-4 py-3">
        <button type="button" onClick={onBack} aria-label="Terug naar overzicht" className="flex h-11 w-11 items-center justify-center rounded-block text-ink-muted hover:bg-surface">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
        <h1 className="font-display text-lg font-bold text-ink">{state.tournamentName || 'Nieuw toernooi'}</h1>
      </header>

      <div className="no-print flex gap-1 border-b border-line bg-panel px-4 md:hidden">
        {(['settings', 'schema'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`px-3 py-2 text-sm font-medium ${mobileTab === tab ? 'border-b-2 border-accent text-ink' : 'text-ink-muted'}`}
          >
            {tab === 'settings' ? 'Instellingen' : 'Schema'}
          </button>
        ))}
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[320px_1fr] md:p-6">
        <div className={`${mobileTab === 'settings' ? 'block' : 'hidden'} md:block`}>
          <SettingsPanel state={state} onChange={onChange} />
        </div>
        <div className={`${mobileTab === 'schema' ? 'block' : 'hidden'} md:block`}>
          <SchedulePanel tournament={tournament} />
        </div>
      </div>
    </div>
  );
}
