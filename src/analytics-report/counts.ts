/**
 * Counts per breakdown value and the Markdown helpers around them, shared by
 * the conversion report (conversion.ts) and its sections for site search,
 * brand pages and series pages (siteSections.ts). Pure functions.
 */

/** One breakdown value with its count this week and the week before. */
export type Count = { key: string; now: number; before: number };

export const LIST_LIMIT = 10;

export function countOf(counts: readonly Count[], key: string): Count {
  return counts.find((count) => count.key === key) ?? { key, now: 0, before: 0 };
}

export function sum(counts: readonly Count[]): { now: number; before: number } {
  return counts.reduce(
    (total, count) => ({ now: total.now + count.now, before: total.before + count.before }),
    { now: 0, before: 0 },
  );
}

export function rate(part: number, whole: number): number | null {
  return whole > 0 ? part / whole : null;
}

export function percent(value: number | null): string {
  return value === null ? '–' : `${Math.round(value * 100)}%`;
}

export function change(now: number, before: number): string {
  if (before === 0) return now === 0 ? '–' : 'nieuw';
  const delta = (now - before) / before;
  const rounded = Math.round(delta * 100);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

export function table(header: string[], rows: string[][]): string {
  if (rows.length === 0) return '_Geen data._';
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map((_, index) => (index === 0 ? '---' : '---:')).join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`),
  ].join('\n');
}

export function countRows(counts: readonly Count[], label = (key: string) => key): string[][] {
  return [...counts]
    .sort((a, b) => b.now - a.now || b.before - a.before)
    .slice(0, LIST_LIMIT)
    .map((count) => [label(count.key || '(onbekend)'), String(count.now), String(count.before), change(count.now, count.before)]);
}
