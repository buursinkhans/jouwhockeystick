import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { getArticlesIncludingScheduled } from './index';
import { kennisFaq, merkenFaq, stickwijzerFaq } from './landingFaqs';

// SEO/GEO step B (decision log 2026-11-08): the landing-page questions.
const sets = { stickwijzer: stickwijzerFaq(), kennis: kennisFaq(), merken: merkenFaq() };
const links = (text: string) => [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1] ?? '');

describe('landing page questions', () => {
  it.each(Object.entries(sets))('%s: every link points to a page that exists', (_page, items) => {
    const articles = new Set(getArticlesIncludingScheduled().map((a) => a.slug));
    for (const href of items.flatMap((i) => links(i.answer))) {
      const [path = ''] = href.split('#');
      const [, section, slug] = path.split('/');
      if (section === 'kennis' && slug) expect(articles.has(slug), href).toBe(true);
      else expect(existsSync(`src/app/${section}/page.tsx`), href).toBe(true);
    }
  });

  it.each(Object.entries(sets))('%s: follows the house style (docs/schrijfstijl.md)', (_page, items) => {
    for (const { question, answer } of items) {
      expect(answer, question).not.toMatch(/[—–!]/);
      expect(answer, question).not.toMatch(/goedkoopst|beste prijs|undefined|NaN/i);
    }
    // At most one "niet X, maar Y" per text.
    const contrasts = items.map((i) => i.answer).join(' ').match(/\bniet\b[^.]*\bmaar\b/g) ?? [];
    expect(contrasts.length).toBeLessThanOrEqual(1);
  });

  it('fills the brand numbers from the catalog', () => {
    const [best, beginners] = sets.merken;
    expect(best!.answer).toMatch(/We vergelijken sticks van \d+ merken\. .* hebben \d+ merken een veldstick voor beginners en \d+ merken/);
    expect(beginners!.answer).not.toMatch(/hebben\s+een veldstick/);
  });
});
