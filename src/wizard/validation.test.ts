import { describe, expect, it } from 'vitest';
import { stepNameIsValid, stepWindowIsValid } from './validation';

describe('stepNameIsValid', () => {
  it('requires both a tournament name and a discipline name', () => {
    expect(stepNameIsValid({ tournamentName: '', disciplineName: '' })).toBe(false);
    expect(stepNameIsValid({ tournamentName: 'Zomertoernooi', disciplineName: '' })).toBe(false);
    expect(stepNameIsValid({ tournamentName: 'Zomertoernooi', disciplineName: 'Voetbal' })).toBe(true);
  });
});

describe('stepWindowIsValid', () => {
  it('requires both dates set and start before end', () => {
    expect(stepWindowIsValid({ windowStartLocal: '', windowEndLocal: '' })).toBe(false);
    expect(stepWindowIsValid({ windowStartLocal: '2026-08-01T09:00', windowEndLocal: '2026-08-01T08:00' })).toBe(false);
    expect(stepWindowIsValid({ windowStartLocal: '2026-08-01T09:00', windowEndLocal: '2026-08-01T18:00' })).toBe(true);
  });
});
