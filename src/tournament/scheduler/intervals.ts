export interface Interval {
  start: number;
  end: number;
}

export function overlaps(a: Interval, start: number, end: number): boolean {
  return start < a.end && end > a.start;
}
