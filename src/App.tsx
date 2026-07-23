import { useState } from 'react';
import type { Tournament } from './tournament/types';
import { Home } from './Home';
import { Wizard } from './wizard/Wizard';
import { AddDisciplineWizard } from './wizard/addDiscipline/AddDisciplineWizard';
import { Results } from './results/Results';
import { Workscreen } from './workscreen/Workscreen';
import { saveTournament } from './persistence/storage';

type View =
  | { kind: 'home' }
  | { kind: 'wizard' }
  | { kind: 'workscreen' }
  | { kind: 'results'; tournament: Tournament }
  | { kind: 'addDiscipline'; tournament: Tournament };

function App() {
  const [view, setView] = useState<View>({ kind: 'home' });

  if (view.kind === 'workscreen') {
    return <Workscreen onBack={() => setView({ kind: 'home' })} />;
  }

  if (view.kind === 'wizard') {
    return (
      <Wizard
        onCancel={() => setView({ kind: 'home' })}
        onComplete={(tournament) => {
          saveTournament(tournament);
          setView({ kind: 'results', tournament });
        }}
      />
    );
  }

  if (view.kind === 'addDiscipline') {
    return (
      <AddDisciplineWizard
        tournament={view.tournament}
        onCancel={() => setView({ kind: 'results', tournament: view.tournament })}
        onAdd={(tournament) => {
          saveTournament(tournament);
          setView({ kind: 'results', tournament });
        }}
      />
    );
  }

  if (view.kind === 'results') {
    return (
      <Results
        tournament={view.tournament}
        onBack={() => setView({ kind: 'home' })}
        onAddDiscipline={() => setView({ kind: 'addDiscipline', tournament: view.tournament })}
        onTournamentUpdate={(tournament) => {
          saveTournament(tournament);
          setView({ kind: 'results', tournament });
        }}
      />
    );
  }

  return (
    <Home
      onNew={() => setView({ kind: 'workscreen' })}
      onOpen={(tournament) => setView({ kind: 'results', tournament })}
      onImport={(tournament) => {
        saveTournament(tournament);
        setView({ kind: 'results', tournament });
      }}
    />
  );
}

export default App;
