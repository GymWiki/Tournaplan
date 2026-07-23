import { beforeEach, describe, expect, it } from 'vitest';
import type { Tournament } from '../tournament/types';
import { deleteSavedTournament, loadSavedTournaments, saveTournament } from './storage';

function sampleTournament(id: string, name: string): Tournament {
  return {
    id,
    name,
    participants: [],
    disciplines: [],
    resources: [],
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  it('returns an empty list when nothing is saved', () => {
    expect(loadSavedTournaments()).toEqual([]);
  });

  it('saves and loads a tournament', () => {
    saveTournament(sampleTournament('t1', 'Toernooi 1'));
    const saved = loadSavedTournaments();
    expect(saved).toHaveLength(1);
    expect(saved[0]!.tournament.name).toBe('Toernooi 1');
  });

  it('overwrites a tournament with the same id instead of duplicating it', () => {
    saveTournament(sampleTournament('t1', 'Versie 1'));
    saveTournament(sampleTournament('t1', 'Versie 2'));
    const saved = loadSavedTournaments();
    expect(saved).toHaveLength(1);
    expect(saved[0]!.tournament.name).toBe('Versie 2');
  });

  it('deletes a tournament by id', () => {
    saveTournament(sampleTournament('t1', 'Toernooi 1'));
    saveTournament(sampleTournament('t2', 'Toernooi 2'));
    deleteSavedTournament('t1');
    const saved = loadSavedTournaments();
    expect(saved.map((s) => s.tournament.id)).toEqual(['t2']);
  });

  it('ignores corrupted entries instead of throwing', () => {
    localStorage.setItem('tournaplan:tournaments', '{ not an array');
    expect(loadSavedTournaments()).toEqual([]);
  });
});
