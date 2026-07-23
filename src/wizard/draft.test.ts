import { describe, expect, it } from 'vitest';
import { parseParticipantNames } from './draft';

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
