import { describe, expect, it } from 'vitest';
import { QUESTIONS } from './stickwijzer/questions';
import { answersFromSearch } from './stickwijzer/prefill';
import { CLUBS_PAGE } from './clubs';
import { HOCKEYSCHOENEN } from './hockeyschoenen';
import { getArticlesIncludingScheduled } from './index';
import { getBlogPostsIncludingScheduled } from './blog';

/**
 * "Dochter of zoon" in running text (decision log 2026-11-22). The words
 * "kind", "kinderen" and "junior" stay in titles, headings, meta descriptions,
 * URLs and link labels, because that is how people search. In the text, a
 * personal address ("je kind") may become "je dochter of zoon", at most once per
 * section, so the text does not turn stiff. Always the two together, and never
 * as advice for one of them.
 */
const PHRASE = /dochter of zoon/g;
const ALL = [
  ...getArticlesIncludingScheduled().map((article) => ({ base: '/kennis', article })),
  ...getBlogPostsIncludingScheduled().map((article) => ({ base: '/blog', article })),
];
const count = (value: unknown) => (JSON.stringify(value).match(PHRASE) ?? []).length;

describe('dochter of zoon in articles and blog posts', () => {
  it.each(ALL)('$base/$article.slug uses it at most once per section and in the intro', ({ article }) => {
    expect(count(article.intro)).toBeLessThanOrEqual(1);
    for (const section of article.sections) {
      expect(count(section.body), section.heading).toBeLessThanOrEqual(1);
    }
  });

  it.each(ALL)('$base/$article.slug never has "dochter" or "zoon" apart from each other', ({ article }) => {
    const text = JSON.stringify([article.intro, article.sections]);
    expect(text.replace(PHRASE, '')).not.toMatch(/\b(dochter|zoon)\b/i);
  });

  it.each(ALL)('$base/$article.slug keeps "dochter of zoon" out of the title, the search title, the headings and the meta description', ({ article }) => {
    const searchFacing = JSON.stringify([article.title, article.seoTitle, article.metaDescription, article.sections.map((s) => s.heading)]);
    expect(searchFacing).not.toMatch(/dochter|zoon/i);
  });

  it('keeps the child words in the titles that are written for them', () => {
    const titles = Object.fromEntries(ALL.map(({ article }) => [article.slug, article.title]));
    expect(titles['hockeystick-kinderen-en-beginners']).toContain('kinderen');
    expect(titles['zaalstick-voor-kinderen']).toContain('kinderen');
    expect(titles['hockeyschoenen-kinderen-maat']).toContain('kinderen');
    expect(titles['hockeystick-cadeau']).toContain('kind');
  });

  it('does not touch the gift article: the giver may be a grandparent, not a parent', () => {
    expect(count(ALL.find(({ article }) => article.slug === 'hockeystick-cadeau')?.article)).toBe(0);
  });

  it('gives no age per length: the only age indication stays in its own sourced section', () => {
    for (const { article } of ALL) {
      const text = JSON.stringify([article.intro, article.sections.filter((s) => s.id !== 'leeftijd')]);
      expect(text, article.slug).not.toMatch(/dochter of zoon[^.]{0,80}\b\d+ jaar\b/i);
    }
  });
});

describe('dochter of zoon in pages and the stickwijzer', () => {
  it('has the label "Voor mijn dochter of zoon", with the answer value and the link parameter unchanged', () => {
    const goal = QUESTIONS.advice_goal;
    expect(goal.input.kind).toBe('single');
    const options = goal.input.kind === 'single' ? goal.input.options : [];
    expect(options.find((o) => o.value === 'child')?.label).toBe('Voor mijn dochter of zoon');
    expect(answersFromSearch('?snel&voor=kind')).toEqual({ route_self_select: 'quick', advice_goal: 'child' });
  });

  it('keeps the search question on the clubs page as people ask it', () => {
    expect(JSON.stringify(CLUBS_PAGE)).toContain('Welke stick moet mijn kind hebben?');
    expect(count(CLUBS_PAGE)).toBeLessThanOrEqual(1);
    expect(count(HOCKEYSCHOENEN)).toBeLessThanOrEqual(1);
  });
});
