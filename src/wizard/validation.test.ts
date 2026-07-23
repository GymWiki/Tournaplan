import { describe, expect, it } from 'vitest';
import { stepNameIsValid } from './validation';

describe('stepNameIsValid', () => {
  it('requires both a tournament name and a discipline name', () => {
    expect(stepNameIsValid({ tournamentName: '', disciplineName: '' })).toBe(false);
    expect(stepNameIsValid({ tournamentName: 'Zomertoernooi', disciplineName: '' })).toBe(false);
    expect(stepNameIsValid({ tournamentName: 'Zomertoernooi', disciplineName: 'Voetbal' })).toBe(true);
  });
});
