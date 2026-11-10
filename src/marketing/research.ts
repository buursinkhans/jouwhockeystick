/**
 * Scoring ideas for the Onderzoeker (docs/marketing/onderzoeker.md): five
 * criteria, one point each, every point with its reason in plain Dutch, so the
 * owner sees why an idea is on the list. Pure: the Onderzoeker gathers the
 * facts (report issues, Metricool, the calendar, the live pages) and passes
 * them in.
 */
import { momentsOn, pushOn, type Market } from './calendar';

export type IdeaFacts = {
  onderwerp: string;
  /** Live page the idea leads to; null when there is none yet. */
  pagina: string | null;
  /** Evidence of demand, e.g. a Search Console query with impressions or a question from the community; null when none. */
  vraag: { bron: string; signaal: string } | null;
  /** The pillar of the idea (docs/marketing/merkplatform.md). */
  pijler: 'maat' | 'spel' | 'zaal' | 'vergelijken';
  /** The planned day (YYYY-MM-DD) and market. */
  datum: string;
  markt: Market;
  /** How the form (or series) did before: median index against the channel median (1 = as usual) and the number of posts. */
  vorm: { naam: string; index: number; posts: number } | null;
  /** YYYY-MM-DD of the last post on this page, or null if it never had one. */
  laatstePost: string | null;
};

export type Score = { punten: number; redenen: string[]; ontbreekt: string[] };

const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;

/** A form "worked before" from 5 posts on, with a median at least as good as the channel's (same bar as the lessons). */
export const MIN_POSTS = 5;
/** Six weeks without a post on the page (docs/instagram.md §7). */
export const PAGE_REST_DAYS = 42;

export function scoreIdea(f: IdeaFacts): Score {
  const redenen: string[] = [];
  const ontbreekt: string[] = [];
  const point = (ok: boolean, yes: string, no: string) => (ok ? redenen.push(yes) : ontbreekt.push(no));

  point(!!f.vraag, `Er is vraag: ${f.vraag?.signaal} (${f.vraag?.bron}).`, 'Geen teken van vraag gevonden.');

  const moments = momentsOn(f.datum, f.markt).filter((m) => m.pijler === f.pijler);
  const push = pushOn(f.datum, f.markt);
  const fitsNow = moments.length > 0 || (push !== null && (f.pijler === 'zaal') === (push.id === 'indoor-push'));
  point(
    fitsNow,
    `Het past nu: ${moments[0]?.naam ?? push?.naam}.`,
    'Het past niet bij een moment in de seizoenskalender.',
  );

  point(!!f.pagina, `Er is een pagina: ${f.pagina}.`, 'Er is nog geen live pagina; dat is een idee voor een content-brief.');

  const worked = !!f.vorm && f.vorm.posts >= MIN_POSTS && f.vorm.index >= 1;
  point(
    worked,
    `De vorm werkte eerder: ${f.vorm?.naam} haalde ${f.vorm?.index.toFixed(1).replace('.', ',')}× de mediaan over ${f.vorm?.posts} posts.`,
    f.vorm && f.vorm.posts < MIN_POSTS ? `Van ${f.vorm.naam} zijn nog te weinig posts (${f.vorm.posts} van ${MIN_POSTS}).` : 'De vorm deed het eerder niet beter dan gewoonlijk.',
  );

  const rested = f.laatstePost === null || daysBetween(f.laatstePost, f.datum) >= PAGE_REST_DAYS;
  point(
    rested,
    f.laatstePost === null ? 'De pagina had nog geen post.' : `De pagina had ${Math.floor(daysBetween(f.laatstePost, f.datum) / 7)} weken geen post.`,
    'De pagina had in de laatste zes weken al een post.',
  );

  return { punten: redenen.length, redenen, ontbreekt };
}

/** The best ideas first; on equal points the one with a page and demand, then by subject. At most `limit`. */
export function rankIdeas(ideas: readonly IdeaFacts[], limit = 10): { idee: IdeaFacts; score: Score }[] {
  return ideas
    .map((idee) => ({ idee, score: scoreIdea(idee) }))
    .sort(
      (a, b) =>
        b.score.punten - a.score.punten ||
        Number(!!b.idee.pagina) - Number(!!a.idee.pagina) ||
        Number(!!b.idee.vraag) - Number(!!a.idee.vraag) ||
        a.idee.onderwerp.localeCompare(b.idee.onderwerp, 'nl'),
    )
    .slice(0, limit);
}
