import { describe, expect, it } from 'vitest';
import type { Entry } from '../types';
import { groupsKnockout } from './groupsKnockout';

function makeEntries(n: number): Entry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `e${i + 1}`,
    disciplineId: 'd1',
    name: `Team ${i + 1}`,
    participantIds: [`p${i + 1}`],
    seed: i + 1,
  }));
}

describe('groupsKnockout.validate', () => {
  it('rejects fewer than 2 groups', () => {
    expect(groupsKnockout.validate(makeEntries(8), { durationMinutes: 10, numGroups: 1 }).valid).toBe(false);
  });

  it('rejects more groups than entries', () => {
    const result = groupsKnockout.validate(makeEntries(3), { durationMinutes: 10, numGroups: 4 });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Meer poules/);
  });

  it('warns when entries do not divide evenly over the groups', () => {
    const result = groupsKnockout.validate(makeEntries(10), { durationMinutes: 10, numGroups: 4 });
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('rejects qualifiersPerGroup larger than the smallest group', () => {
    const result = groupsKnockout.validate(makeEntries(9), {
      durationMinutes: 10,
      numGroups: 3,
      qualifiersPerGroup: 4,
    });
    expect(result.valid).toBe(false);
  });
});

describe('groupsKnockout.generate', () => {
  it('assigns groups with snake seeding (1,2,3,4 -> 4,3,2,1 -> ...)', () => {
    const matches = groupsKnockout.generate(makeEntries(12), { durationMinutes: 10, numGroups: 4 });
    // Row 0: e1->A, e2->B, e3->C, e4->D. Row 1 (reversed): e5->D, e6->C, e7->B, e8->A.
    // Row 2: e9->A, e10->B, e11->C, e12->D.
    const poolMatches = matches.filter((m) => m.label.startsWith('Poule'));
    const groupOf = (entryId: string) =>
      poolMatches.find(
        (m) =>
          (m.home.kind === 'entry' && m.home.entryId === entryId) ||
          (m.away.kind === 'entry' && m.away.entryId === entryId),
      )!.label.match(/Poule (\w)/)![1];

    expect(groupOf('e1')).toBe('A');
    expect(groupOf('e2')).toBe('B');
    expect(groupOf('e4')).toBe('D');
    expect(groupOf('e5')).toBe('D');
    expect(groupOf('e8')).toBe('A');
    expect(groupOf('e9')).toBe('A');
  });

  it('every pool match is a round robin within its own group only', () => {
    const entries = makeEntries(9);
    const matches = groupsKnockout.generate(entries, { durationMinutes: 10, numGroups: 3 });
    const poolMatches = matches.filter((m) => m.label.startsWith('Poule'));
    // 3 groups of 3 -> 3 round-robin matches each -> 9 total.
    expect(poolMatches).toHaveLength(9);
  });

  it('crosses groups in the knock-out stage: round one never pairs same-group qualifiers', () => {
    const matches = groupsKnockout.generate(makeEntries(16), {
      durationMinutes: 10,
      numGroups: 4,
      qualifiersPerGroup: 2,
    });
    const koFirstRound = matches.filter((m) => m.home.kind === 'group_rank' || m.away.kind === 'group_rank');
    // Pull out just the actual round-one crossing matches (both sides are group_rank slots).
    const crossingMatches = koFirstRound.filter((m) => m.home.kind === 'group_rank' && m.away.kind === 'group_rank');
    expect(crossingMatches.length).toBeGreaterThan(0);
    for (const m of crossingMatches) {
      const home = m.home as { kind: 'group_rank'; groupId: string; rank: number };
      const away = m.away as { kind: 'group_rank'; groupId: string; rank: number };
      expect(home.groupId).not.toBe(away.groupId);
    }
  });

  it('knock-out matches depend on all pool matches of the groups they cross', () => {
    const matches = groupsKnockout.generate(makeEntries(8), { durationMinutes: 10, numGroups: 2 });
    const poolMatchIdsByGroup: Record<string, string[]> = { A: [], B: [] };
    for (const m of matches) {
      const match = /Poule (\w)/.exec(m.label);
      if (match) poolMatchIdsByGroup[match[1]!]!.push(m.id);
    }
    const koFirstRound = matches.filter(
      (m) => m.home.kind === 'group_rank' && m.away.kind === 'group_rank',
    );
    for (const m of koFirstRound) {
      const home = m.home as { kind: 'group_rank'; groupId: string };
      const away = m.away as { kind: 'group_rank'; groupId: string };
      for (const id of poolMatchIdsByGroup[home.groupId] ?? []) expect(m.dependsOn).toContain(id);
      for (const id of poolMatchIdsByGroup[away.groupId] ?? []) expect(m.dependsOn).toContain(id);
    }
  });

  it('knock-out rounds are numbered after all pool rounds', () => {
    const matches = groupsKnockout.generate(makeEntries(12), { durationMinutes: 10, numGroups: 4 });
    const poolMatches = matches.filter((m) => m.label.startsWith('Poule'));
    const koMatches = matches.filter((m) => !m.label.startsWith('Poule'));
    const maxPoolRound = Math.max(...poolMatches.map((m) => m.round));
    const minKoRound = Math.min(...koMatches.map((m) => m.round));
    expect(minKoRound).toBeGreaterThan(maxPoolRound);
  });
});
