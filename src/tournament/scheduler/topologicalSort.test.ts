import { describe, expect, it } from 'vitest';
import type { Match } from '../types';
import { topologicalOrder } from './topologicalSort';

function match(id: string, round: number, dependsOn: string[] = []): Match {
  return {
    id,
    disciplineId: 'd1',
    round,
    label: id,
    home: { kind: 'bye' },
    away: { kind: 'bye' },
    durationMinutes: 10,
    dependsOn,
  };
}

describe('topologicalOrder', () => {
  it('places dependencies before their dependents', () => {
    const a = match('a', 1);
    const b = match('b', 1);
    const c = match('c', 2, ['a', 'b']);
    const order = topologicalOrder([c, b, a]).map((m) => m.id);
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'));
  });

  it('breaks ties by round when there is no dependency between two matches', () => {
    const early = match('early', 1);
    const late = match('late', 3);
    const order = topologicalOrder([late, early]).map((m) => m.id);
    expect(order).toEqual(['early', 'late']);
  });

  it('throws on a cyclic dependsOn graph', () => {
    const a = match('a', 1, ['b']);
    const b = match('b', 1, ['a']);
    expect(() => topologicalOrder([a, b])).toThrow(/Cyclische/);
  });
});
