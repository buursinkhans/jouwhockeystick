import { z } from 'zod';
import raw from './search-config.json';
import { searchTokens } from './tokens';

/**
 * The settings of the header search, kept in `search-config.json` so they can
 * be changed without programming (handbook: docs/spec/zoeken.md). Zod checks
 * the file when it is read, so a typo fails the build and the test with a clear
 * message instead of breaking the search.
 *
 * Deliberately not here: a popularity score per stick. The owner decided
 * (2026-11-24) that version 1 has none, because there is no source for it yet.
 */
const word = z
  .string()
  .min(2)
  .refine((value) => {
    const tokens = searchTokens(value);
    return tokens.length === 1 && tokens[0] === value;
  }, 'one word in lower case, without punctuation, and not a shorthand that is written out (pb, lb, jr, zaal)');

const searchConfigSchema = z.object({
  _uitleg: z.string().optional(),
  /** At most five suggestions for an empty search field; `query` is run when one is clicked. */
  popular: z.array(z.object({ label: z.string().min(2), query: z.string().min(2) })).max(5),
  /** Words that mean the same: a search for one also finds the other. */
  synonyms: z.array(z.object({ terms: z.array(word).min(2) })),
  /** A usual misspelling or spelling variant, replaced by the spelling the catalog uses. */
  corrections: z.record(z.string(), z.string()),
  /**
   * A short answer above the results for a knowledge question (carbon, beginner,
   * length, size, low bow). Shown when the search holds one of the `terms` and no
   * stick matches by name; `article` is the slug of the knowledge article the link goes to.
   */
  answers: z.array(
    z.object({
      terms: z.array(word).min(1),
      text: z.string().min(40).max(320),
      article: z.string().regex(/^[a-z0-9-]+$/),
    }),
  ),
  /** General words for which the search gently points at the stickwijzer (kind, junior, beginner, advice, size). */
  stickwijzer: z.object({ terms: z.array(word).min(1) }),
});

export type SearchConfig = z.infer<typeof searchConfigSchema>;

export const SEARCH_CONFIG: SearchConfig = searchConfigSchema.parse(raw);
