/**
 * Circle method (polygon method): one item is fixed, the rest rotate around it each round.
 * Guarantees every item plays every other item exactly once, and at most once per round.
 * An odd-length input gets a null padding item; whoever draws it has a rest round.
 */
export function roundRobinRounds<T>(items: T[]): Array<Array<[T, T]>> {
  if (items.length < 2) return [];

  const list: Array<T | null> = [...items];
  if (list.length % 2 !== 0) list.push(null);

  const size = list.length;
  const rounds = size - 1;
  const fixed = list[0]!;
  let rotating = list.slice(1);

  const result: Array<Array<[T, T]>> = [];
  for (let r = 0; r < rounds; r++) {
    const roundList = [fixed, ...rotating];
    const pairs: Array<[T, T]> = [];
    for (let i = 0; i < size / 2; i++) {
      const a = roundList[i]!;
      const b = roundList[size - 1 - i]!;
      if (a !== null && b !== null) {
        // Alternate which side is "home" each round for a fairer split.
        pairs.push(r % 2 === 0 ? [a, b] : [b, a]);
      }
    }
    result.push(pairs);
    rotating = [rotating[rotating.length - 1]!, ...rotating.slice(0, -1)];
  }
  return result;
}
