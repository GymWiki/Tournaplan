export function parseParticipantNames(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** "Team 1".."Team N" for the count-based entry mode. */
export function generateCountNames(count: number): string[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) => `Team ${i + 1}`);
}

/** Numbers duplicate names as they occur: "Ajax", "Ajax", "Ajax" -> "Ajax", "Ajax (2)", "Ajax (3)". */
export function dedupeNames(names: string[]): string[] {
  const seenCount = new Map<string, number>();
  return names.map((name) => {
    const count = (seenCount.get(name) ?? 0) + 1;
    seenCount.set(name, count);
    return count === 1 ? name : `${name} (${count})`;
  });
}
