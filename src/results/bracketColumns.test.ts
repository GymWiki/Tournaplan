import { describe, expect, it } from 'vitest';
import { singleElimination } from '../tournament/formats/singleElimination';
import type { Entry } from '../tournament/types';
import { buildBracketColumns } from './bracketColumns';

function makeEntries(n: number): Entry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `e${i + 1}`,
    disciplineId: 'd1',
    name: `Team ${i + 1}`,
    participantIds: [`p${i + 1}`],
  }));
}

describe('buildBracketColumns', () => {
  it('groups an 8-entry bracket into 3 columns plus a separate 3rd place match', () => {
    const matches = singleElimination.generate(makeEntries(8), { durationMinutes: 10, includeThirdPlace: true });
    const { columns, thirdPlaceMatch } = buildBracketColumns(matches);

    expect(columns.map((c) => c.title)).toEqual(['Kwartfinale', 'Halve finale', 'Finale']);
    expect(columns[0]!.matches).toHaveLength(4);
    expect(columns[1]!.matches).toHaveLength(2);
    expect(columns[2]!.matches).toHaveLength(1);
    expect(thirdPlaceMatch?.label).toBe('Troostfinale');
  });

  it('has no 3rd place match when it was disabled', () => {
    const matches = singleElimination.generate(makeEntries(8), { durationMinutes: 10, includeThirdPlace: false });
    const { thirdPlaceMatch } = buildBracketColumns(matches);
    expect(thirdPlaceMatch).toBeUndefined();
  });

  it('titles a column by its own position, not a single-match label lacking an index suffix', () => {
    // 9 entries -> bracket of 16: round one only has 1 real match (seed 8 vs 9), whose label
    // has no " N" suffix — the column title must still read "Ronde 1", not "Ronde".
    const matches = singleElimination.generate(makeEntries(9), { durationMinutes: 10 });
    const { columns } = buildBracketColumns(matches);
    expect(columns.map((c) => c.title)).toEqual(['Ronde 1', 'Kwartfinale', 'Halve finale', 'Finale']);
    expect(columns[0]!.matches).toHaveLength(1);
    expect(columns[0]!.matches[0]!.label).toBe('Ronde 1');
  });
});
