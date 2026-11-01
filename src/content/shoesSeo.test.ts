import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HockeyschoenenPage, { metadata as overviewMetadata } from '@/app/hockeyschoenen/page';
import { metadata as wizardMetadata } from '@/app/hockeyschoenen/wijzer/page';
import sitemap from '@/app/sitemap';
import { getCuratedShoes, getImportedShoes } from '@/catalog/shoes';
import { UNKNOWN } from '@/catalog/shoes/types';
import { SITE_URL } from '@/lib/site';
import { HOCKEYSCHOENEN, intentFactLine, intentFacts } from './hockeyschoenen';
import { getAllArticles, getArticlesIncludingScheduled } from './index';
import { dueItems, isPublished, visibleItems } from './schedule';
import { progressLabel, progressQuestions, quizProgress, visibleQuestions, type ShoeQuizState } from './schoenenwijzer/questions';
import { SHOE_ARTICLE_SLUGS, shoeArticleLink } from './shoeArticles';

/** PR A of the shoe SEO analysis (decision log 2026-11-01). */
afterEach(() => vi.useRealTimers());

const overview = async () => renderToStaticMarkup(await HockeyschoenenPage({ searchParams: Promise.resolve({}) }));

describe('intent sections on /hockeyschoenen', () => {
  it('adds three H2 sections, each with a choice question, a filter link and the fact line, and keeps title, H1 and canonical', async () => {
    const html = await overview();
    for (const intent of ['veld', 'zaal', 'kinderen'] as const) {
      const section = HOCKEYSCHOENEN.intents[intent];
      expect(html).toContain(`<h2 id="intentie-${intent}" class="text-2xl font-bold">${section.heading}</h2>`);
      expect(html).toContain(section.question);
      expect(html).toContain(`href="${section.filterHref.replace('&', '&amp;')}"`);
    }
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(HOCKEYSCHOENEN.title).toBe('Hockeyschoenen');
    expect(HOCKEYSCHOENEN.seoTitle).toBe('Hockeyschoenen voor veld en zaal: ondergrond en pasvorm');
    expect(overviewMetadata.alternates?.canonical).toBe('/hockeyschoenen');
  });

  it('counts only from the catalog, and never an unknown kind as field', () => {
    const facts = intentFacts(getCuratedShoes(), getImportedShoes());
    expect(facts.veld.checked).toBe(getCuratedShoes().filter((s) => s.category.value === 'veld').length);
    expect(facts.veld.feed).toBe(getImportedShoes().filter((s) => s.category.value === 'veld').length);
    expect(facts.zaal.nonMarkingConfirmed + facts.zaal.nonMarkingEstimated).toBeLessThanOrEqual(facts.zaal.checked);
    // A feed model with an unknown kind turns up in no count at all.
    const unknownKind = { ...getImportedShoes()[0]!, category: UNKNOWN, ageGroup: 'junior' as const };
    const withUnknown = intentFacts([], [unknownKind]);
    expect([withUnknown.veld.feed, withUnknown.zaal.feed, withUnknown.kinderen.feed]).toEqual([0, 0, 0]);
    expect(intentFactLine('zaal', facts)).toMatch(/merk of de winkel/);
  });

  it('makes no forbidden or stuffed claims', () => {
    // Visible text only: headings, questions, answers and link labels (not slugs or hrefs).
    const text = Object.values(HOCKEYSCHOENEN.intents)
      .map((s) => [s.heading, s.question, s.answer, s.filterLabel].join(' '))
      .join(' ');
    expect(text).not.toMatch(/beste|gegarandeerd|voorkomt|perfect|\d+\s?%/i);
    // A search term as heading and link label, not repeated through the answers.
    for (const term of [/veldhockeyschoen/gi, /zaalhockeyschoen/gi, /hockeyschoenen voor kinderen/gi]) {
      expect(text.match(term)?.length ?? 0, String(term)).toBeLessThanOrEqual(3);
    }
  });

  it('links an article only once it is live, under its own section', async () => {
    expect(SHOE_ARTICLE_SLUGS).toContain(HOCKEYSCHOENEN.intents.zaal.articleSlug);
    const fake = [{ slug: 'zaalhockeyschoenen-of-indoorschoenen', title: 'Zaalhockeyschoenen of gewone indoorschoenen?' }];
    expect(shoeArticleLink('zaalhockeyschoenen-of-indoorschoenen', fake)).toEqual({
      href: '/kennis/zaalhockeyschoenen-of-indoorschoenen',
      title: 'Zaalhockeyschoenen of gewone indoorschoenen?',
    });
    expect(shoeArticleLink('zaalhockeyschoenen-of-indoorschoenen', [])).toBeNull();
    const html = await overview();
    for (const intent of ['veld', 'zaal', 'kinderen'] as const) {
      const live = getAllArticles().some((a) => a.slug === HOCKEYSCHOENEN.intents[intent].articleSlug);
      expect(html.includes(`href="/kennis/${HOCKEYSCHOENEN.intents[intent].articleSlug}"`), intent).toBe(live);
    }
  });
});

describe('schoenenwijzer progress', () => {
  const field: ShoeQuizState = { purpose: 'veld', player: 'volwassene', surface: 'vooral-water', budget: 'tot-50' };

  it('says "maximaal acht vragen" in the metadata, which the main questions match', () => {
    expect(wizardMetadata.description).toMatch(/^Maximaal acht vragen/);
    expect(quizProgress(visibleQuestions(field), 0).mains).toBe(8);
    expect(quizProgress(visibleQuestions({ purpose: 'zaal', player: 'volwassene' }), 0).mains).toBe(7);
    expect(quizProgress(visibleQuestions({ purpose: 'veld', player: 'keeper' }), 0).mains).toBe(2);
  });

  it('keeps the main number on follow-ups, ends with the size, and shows the real step count', () => {
    const questions = visibleQuestions(field);
    const labels = questions.map((_, i) => progressLabel(quizProgress(questions, i)));
    const ids = questions.map((q) => q.id);
    expect(labels[ids.indexOf('surface')]).toBe('Vraag 3 van 8');
    expect(labels[ids.indexOf('secondSurface')]).toBe('Vraag 3 van 8 · aanvullende vraag');
    expect(labels[ids.indexOf('allowAboveBudget')]).toBe('Vraag 8 van 8 · aanvullende vraag');
    expect(labels.at(-1)).toBe('Laatste stap: je maat');
    const steps = questions.map((_, i) => quizProgress(questions, i).step);
    expect(steps).toEqual(questions.map((_, i) => i + 1));
    expect(quizProgress(questions, 0).steps).toBe(questions.length);
    // Main numbers only go up, one at a time.
    const mains = questions.map((_, i) => quizProgress(questions, i).main);
    for (let i = 1; i < mains.length; i++) expect(mains[i]! - mains[i - 1]!).toBeGreaterThanOrEqual(0);
    expect(Math.max(...mains)).toBe(8);
  });

  it('stays right after branching and going back', () => {
    // Indoor has no surface question: question 3 is then "Hoe vaak".
    const indoor = visibleQuestions({ purpose: 'zaal', player: 'volwassene' });
    expect(progressLabel(quizProgress(indoor, indoor.findIndex((q) => q.id === 'frequency')))).toBe('Vraag 3 van 7');
    // Going back to the surface and choosing "gemengd" removes the follow-up: the next screen is question 4.
    const after = visibleQuestions({ ...field, surface: 'gemengd' });
    const surface = after.findIndex((q) => q.id === 'surface');
    expect(after[surface + 1]!.id).toBe('frequency');
    expect(progressLabel(quizProgress(after, surface + 1))).toBe('Vraag 4 van 8');
    // An index beyond the list (after a branch shrank it) falls back to the last screen.
    expect(quizProgress(after, 99).step).toBe(after.length);
    // A keeper: two questions, the second is the last.
    const keeper = visibleQuestions({ purpose: 'veld', player: 'keeper' });
    expect(keeper.map((_, i) => progressLabel(quizProgress(keeper, i)))).toEqual(['Vraag 1 van 2', 'Vraag 2 van 2']);
  });

  it('does not jump from "van 7" to "van 8" after the first answer', () => {
    expect(progressLabel(quizProgress(progressQuestions({}), 0))).toBe('Vraag 1 van 8');
    expect(progressLabel(quizProgress(progressQuestions({ purpose: 'veld' }), 0))).toBe('Vraag 1 van 8');
    // Indoor chosen: from then on the real count.
    expect(quizProgress(progressQuestions({ purpose: 'zaal' }), 1).mains).toBe(7);
    expect(readFileSync('src/components/schoenenwijzer/ShoeQuiz.tsx', 'utf8')).toContain('quizProgress(progressQuestions(state), step)');
  });

  it('decides the last screen from the questions shown, not from the keeper answer', () => {
    const quiz = readFileSync('src/components/schoenenwijzer/ShoeQuiz.tsx', 'utf8');
    expect(quiz).toMatch(/const last = step >= questions\.length - 1;/);
  });
});

describe('scheduled publication of the shoe articles', () => {
  const article = { slug: 'hockeyschoenen-versleten', publishedAt: '2026-11-06' };

  it('is not visible before its date, and is from that date (Dutch time)', () => {
    expect(visibleItems([article], { today: '2026-11-05', includeScheduled: false })).toEqual([]);
    expect(visibleItems([article], { today: '2026-11-06', includeScheduled: false })).toEqual([article]);
    expect(isPublished(article, '2026-11-07')).toBe(true);
  });

  it('goes live straight away when it is merged after its date', () => {
    // The merge build includes it (published ≤ today); the morning run need not rebuild.
    expect(visibleItems([article], { today: '2026-11-08', includeScheduled: false })).toEqual([article]);
    expect(dueItems([article], '2026-11-08', '2026-11-08')).toEqual([]);
    // Merged before its date: the morning run on the date rebuilds the site.
    expect(dueItems([article], '2026-11-04', '2026-11-06')).toEqual([article]);
  });

  it('keeps the sitemap and the shoe links to what is live', () => {
    const live = new Set(getAllArticles().map((a) => a.slug));
    const urls = sitemap().map((e) => e.url);
    for (const a of getArticlesIncludingScheduled()) {
      expect(urls.includes(`${SITE_URL}/kennis/${a.slug}`), a.slug).toBe(live.has(a.slug));
    }
    for (const slug of SHOE_ARTICLE_SLUGS) expect(shoeArticleLink(slug) !== null, slug).toBe(live.has(slug));
  });

  it('installs the dependencies before the morning schedule check', () => {
    const workflow = readFileSync('.github/workflows/publicatie.yml', 'utf8');
    const install = workflow.indexOf('- run: npm ci');
    expect(install).toBeGreaterThan(0);
    expect(install).toBeLessThan(workflow.indexOf('content:schedule'));
  });
});
