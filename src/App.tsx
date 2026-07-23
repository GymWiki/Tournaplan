import { useState } from 'react';
import type { Tournament } from './tournament/types';
import { Home } from './Home';
import { Wizard } from './wizard/Wizard';
import { Results } from './results/Results';
import { saveTournament } from './persistence/storage';

type View = { kind: 'home' } | { kind: 'wizard' } | { kind: 'results'; tournament: Tournament };

function App() {
  const [view, setView] = useState<View>({ kind: 'home' });

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

  if (view.kind === 'results') {
    return <Results tournament={view.tournament} onBack={() => setView({ kind: 'home' })} />;
  }

  return (
    <Home
      onNew={() => setView({ kind: 'wizard' })}
      onOpen={(tournament) => setView({ kind: 'results', tournament })}
      onImport={(tournament) => {
        saveTournament(tournament);
        setView({ kind: 'results', tournament });
      }}
    />
  );
}

export default App;
