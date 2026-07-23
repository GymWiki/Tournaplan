import { useRef, useState } from 'react';
import type { Tournament } from './tournament/types';
import { deleteSavedTournament, loadSavedTournaments } from './persistence/storage';
import { parseTournamentJson } from './persistence/parse';
import { readFileAsText } from './persistence/fileTransfer';

interface HomeProps {
  onNew: () => void;
  onOpen: (tournament: Tournament) => void;
  onImport: (tournament: Tournament) => void;
}

export function Home({ onNew, onOpen, onImport }: HomeProps) {
  const [saved, setSaved] = useState(() => loadSavedTournaments());
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDelete(id: string) {
    deleteSavedTournament(id);
    setSaved(loadSavedTournaments());
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const text = await readFileAsText(file);
    const result = parseTournamentJson(text);
    if (!result.success) {
      setImportError(result.error);
      return;
    }
    setImportError(null);
    onImport(result.tournament);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Toernooi-generator</h1>

      <div className="mb-6 flex gap-2">
        <button type="button" onClick={onNew} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          + Nieuw toernooi
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Importeren (JSON)
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      </div>

      {importError && <p className="mb-4 text-sm text-red-700">Importeren mislukt: {importError}</p>}

      {saved.length === 0 ? (
        <p className="text-sm text-gray-500">Nog geen opgeslagen toernooien.</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
          {saved.map(({ tournament, savedAt }) => (
            <li key={tournament.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{tournament.name}</p>
                <p className="text-xs text-gray-500">Opgeslagen {new Date(savedAt).toLocaleString('nl-NL')}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onOpen(tournament)} className="text-sm font-medium text-gray-900 hover:underline">
                  Openen
                </button>
                <button type="button" onClick={() => handleDelete(tournament.id)} className="text-sm text-red-600 hover:underline">
                  Verwijderen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
