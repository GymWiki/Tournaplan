import { describe, expect, it } from 'vitest';
import { singleElimination } from '../tournament/formats/singleElimination';
import type { Entry } from '../tournament/types';
import { buildBracketColumns, columnTitle } from './bracketColumns';

function makeEntries(n: number): Entry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `e${i + 1}`,
    disciplineId: 'd1',
    name: `Team ${i + 1}`,
    participantIds: [`p${i + 1}`],
  }));
}

describe('columnTitle', () => {
  it('strips a trailing match index', () => {
    expect(columnTitle('Kwartfinale 2')).toBe('Kwartfinale');
    expect(columnTitle('Halve finale 1')).toBe('Halve finale');
  });

  it('leaves a label without an index untouched', () => {
    expect(columnTitle('Finale')).toBe('Finale');
  });
});

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
});
