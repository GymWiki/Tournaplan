/** Smallest power of two >= n (0 and 1 both map to a bracket of size n itself, handled by callers). */
export function nextPowerOfTwo(n: number): number {
  if (n <= 1) return n;
  return 2 ** Math.ceil(Math.log2(n));
}

/**
 * Standard single-elimination seed order for a bracket of the given size (must be a power of two).
 * Recursively built so seed 1 and 2 can only meet in the final, 1-4 in the semis, etc. — the
 * property that lets byes go to the strongest seeds instead of just "the first N entries".
 */
export function standardSeedOrder(size: number): number[] {
  if (size <= 1) return [1];
  const prev = standardSeedOrder(size / 2);
  const order: number[] = [];
  for (const s of prev) {
    order.push(s, size + 1 - s);
  }
  return order;
}
