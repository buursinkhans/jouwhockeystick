import type { Article } from './types';

/**
 * Themes on /kennis (redesign fase 2, 2026-11-03), so a visitor finds the
 * article for their question instead of reading a list. An article that is
 * in no theme (a new one from the content agent) lands under "Meer uitleg",
 * so nothing ever disappears from the page.
 */
export const KENNIS_THEMES: ReadonlyArray<{ id: string; heading: string; intro: string; slugs: readonly string[] }> = [
  {
    id: 'stick-kiezen',
    heading: 'Een stick kiezen',
    intro: 'Lengte, kromming en carbon: de keuzes achter een veldstick.',
    slugs: [
      'hoe-kies-je-de-juiste-hockeystick',
      'hockeystick-lengte-tabel',
      'hockeystick-kinderen-en-beginners',
      'low-bow-vs-mid-bow',
      'meer-carbon-hockeystick-beter',
    ],
  },
  {
    id: 'zaalhockey',
    heading: 'Zaalhockey',
    intro: 'Wat een zaalstick anders maakt, voor kinderen en per budget.',
    slugs: ['veldstick-zaalhockey', 'zaalstick-voor-kinderen', 'zaalstick-budget'],
  },
  {
    id: 'hockeyschoenen',
    heading: 'Hockeyschoenen',
    intro: 'Veld of zaal, ondergrond en de juiste maat.',
    slugs: ['welke-hockeyschoenen-heb-je-nodig', 'hockeyschoenen-waterveld-zandveld', 'hockeyschoenen-kinderen-maat'],
  },
  {
    id: 'kopen',
    heading: 'Kopen',
    intro: 'Waar je koopt en waar de winkels in verschillen.',
    slugs: ['waar-koop-je-een-hockeystick'],
  },
];

const OTHER = { id: 'meer', heading: 'Meer uitleg', intro: '' };

/** The themes with their visible articles, in theme order; empty themes are left out. */
export function groupArticles(articles: readonly Article[]) {
  const placed = new Set<string>();
  const groups = KENNIS_THEMES.map((theme) => {
    const items = theme.slugs
      .map((slug) => articles.find((article) => article.slug === slug))
      .filter((article): article is Article => article !== undefined);
    for (const article of items) placed.add(article.slug);
    return { ...theme, articles: items };
  });
  const rest = articles.filter((article) => !placed.has(article.slug));
  return [...groups, { ...OTHER, slugs: [], articles: rest }].filter((group) => group.articles.length > 0);
}

/** Every string in a value, for counting words. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

/** Minutes to read the intro and sections, at about 200 words a minute; at least 1. */
export function readingMinutes(article: Pick<Article, 'intro' | 'sections'>): number {
  const words = strings([article.intro, article.sections]).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
