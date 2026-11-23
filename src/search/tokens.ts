/**
 * Pure text helpers shared by the server search on /zoeken and the live search
 * in the header. No imports from the catalog, so the browser bundle stays small.
 */

/** Shop shorthand that means the same as the full word (owner, 2026-11-04). */
const ALIASES: Readonly<Record<string, string>> = {
  pb: 'probow',
  lb: 'lowbow',
  mb: 'midbow',
  db: 'dynabow',
  jb: 'jumbow',
  ub: 'ultrabow',
  jr: 'junior',
  kids: 'junior',
  kinder: 'junior',
  zaal: 'indoor',
};

export const MAX_QUERY_LENGTH = 80;

/** Lower case, no accents, letters and digits split ("db10" is "db 10"; "36,5" and "36.5" are "36 5"), shorthand written out. */
export function searchTokens(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((token) => ALIASES[token] ?? token);
}
