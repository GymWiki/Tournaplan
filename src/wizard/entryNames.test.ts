import { describe, expect, it } from 'vitest';
import { dedupeNames, generateCountNames, parseParticipantNames } from './entryNames';

describe('parseParticipantNames', () => {
  it('splits on newlines and trims whitespace', () => {
    expect(parseParticipantNames(' Alice \nBob\n  Charlie')).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('drops empty lines', () => {
    expect(parseParticipantNames('Alice\n\n\nBob\n')).toEqual(['Alice', 'Bob']);
  });

  it('returns an empty array for blank input', () => {
    expect(parseParticipantNames('   \n\n')).toEqual([]);
  });
});

describe('generateCountNames', () => {
  it('generates "Team 1".."Team N" in order', () => {
    expect(generateCountNames(4)).toEqual(['Team 1', 'Team 2', 'Team 3', 'Team 4']);
  });

  it('returns an empty array for 0 or negative counts', () => {
    expect(generateCountNames(0)).toEqual([]);
    expect(generateCountNames(-3)).toEqual([]);
  });
});

describe('dedupeNames', () => {
  it('leaves unique names untouched', () => {
    expect(dedupeNames(['Ajax', 'PSV', 'Feyenoord'])).toEqual(['Ajax', 'PSV', 'Feyenoord']);
  });

  it('numbers repeated names from the second occurrence onward', () => {
    expect(dedupeNames(['Ajax', 'Ajax', 'Ajax'])).toEqual(['Ajax', 'Ajax (2)', 'Ajax (3)']);
  });

  it('numbers independently per distinct name', () => {
    expect(dedupeNames(['Ajax', 'PSV', 'Ajax', 'PSV', 'PSV'])).toEqual(['Ajax', 'PSV', 'Ajax (2)', 'PSV (2)', 'PSV (3)']);
  });
});
