import { describe, expect, it } from 'vitest';
import { defaultEntryModeFields, resolveEntryNames } from './entryFields';

describe('resolveEntryNames', () => {
  it('generates count-based names in count mode', () => {
    const fields = { ...defaultEntryModeFields(), entryMode: 'count' as const, entryCount: 5 };
    expect(resolveEntryNames(fields)).toEqual(['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5']);
  });

  it('parses and dedupes pasted names in names mode', () => {
    const fields = { ...defaultEntryModeFields(), entryMode: 'names' as const, participantNamesText: 'Ajax\n\nAjax\nPSV' };
    expect(resolveEntryNames(fields)).toEqual(['Ajax', 'Ajax (2)', 'PSV']);
  });

  it('defaults to count mode with a sane default count', () => {
    const fields = defaultEntryModeFields();
    expect(fields.entryMode).toBe('count');
    expect(resolveEntryNames(fields).length).toBe(fields.entryCount);
  });
});
