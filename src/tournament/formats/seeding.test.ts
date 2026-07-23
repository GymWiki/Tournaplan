import { describe, expect, it } from 'vitest';
import { nextPowerOfTwo, standardSeedOrder } from './seeding';

describe('nextPowerOfTwo', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 4],
    [4, 4],
    [5, 8],
    [8, 8],
    [9, 16],
    [17, 32],
    [64, 64],
  ])('nextPowerOfTwo(%i) === %i', (input, expected) => {
    expect(nextPowerOfTwo(input)).toBe(expected);
  });
});

describe('standardSeedOrder', () => {
  it('is a permutation of 1..size', () => {
    for (const size of [2, 4, 8, 16, 32, 64]) {
      const order = standardSeedOrder(size);
      expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: size }, (_, i) => i + 1));
    }
  });

  it('matches the known standard bracket for size 8', () => {
    expect(standardSeedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });

  it('pairs seed 1 with seed size (weakest) in round one, for every size', () => {
    for (const size of [2, 4, 8, 16, 32, 64]) {
      const order = standardSeedOrder(size);
      expect(order[0]).toBe(1);
      expect(order[1]).toBe(size);
    }
  });

  it('ensures top seeds can only meet in the final: 1 and 2 are in opposite halves', () => {
    for (const size of [4, 8, 16, 32, 64]) {
      const order = standardSeedOrder(size);
      const half = size / 2;
      const firstHalf = order.slice(0, half);
      const secondHalf = order.slice(half);
      expect(firstHalf.includes(1)).toBe(true);
      expect(secondHalf.includes(2)).toBe(true);
    }
  });
});
