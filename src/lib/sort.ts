// Shared list sorting for Memories and Capsules. Items only need a title + a
// human-readable date string; undated items (e.g. "No date set") sink to the bottom.
export type SortMode = 'newest' | 'oldest' | 'az';

export const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'az', label: 'A–Z' },
];

export function sortByMode<T extends { title: string; date: string }>(items: T[], mode: SortMode): T[] {
  const copy = [...items];
  if (mode === 'az') {
    return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
  return copy.sort((a, b) => {
    const ta = Date.parse(a.date);
    const tb = Date.parse(b.date);
    const va = Number.isNaN(ta) ? null : ta;
    const vb = Number.isNaN(tb) ? null : tb;
    if (va == null && vb == null) return 0;
    if (va == null) return 1; // undated → bottom
    if (vb == null) return -1;
    return mode === 'newest' ? vb - va : va - vb;
  });
}
