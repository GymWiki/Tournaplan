/**
 * Converts a scheduler offset (minutes from the tournament's zero point) to a clock time, given an
 * optional real-world anchor. Returns null when no anchor is set — callers show a relative label
 * (round name, "Veld 2 — wedstrijd 3", ...) instead. Purely a display transform: changing or
 * clearing startTime never requires re-running the scheduler, since offsets don't depend on it.
 */
export function toClockTime(offsetMinutes: number, startTime?: Date): string | null {
  if (!startTime) return null;
  const date = new Date(startTime.getTime() + offsetMinutes * 60_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
