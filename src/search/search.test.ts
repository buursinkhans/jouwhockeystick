import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/data/zoekindex.json/route';
import { Header } from '@/components/layout/Header';
import { getAllProducts, isFeedImport } from '@/catalog';
import { getAllArticles } from '@/content';
import { clearStickwijzerFromSearch, isFromSearch, markSearchSelection, markStickwijzerFromSearch, stickwijzerFromSearch } from '@/lib/analytics/searchContext';
import { SEARCH_CONFIG } from './config';
import { buildSearchIndex } from './buildIndex';
import { priceLine, stickFacts } from './display';
import { prepareIndex, search, type SearchItem } from './engine';

vi.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: () => undefined }) }));

const NOW = new Date('2026-11-24T12:00:00Z');
const index = buildSearchIndex(NOW);
const prepared = prepareIndex(index);
const limits = { sticks: 4, brands: 2, articles: 3 };

describe('search-config.json', () => {
  it('has at most five popular searches, and each one finds something', () => {
    expect(SEARCH_CONFIG.popular.length).toBeGreaterThan(0);
    expect(SEARCH_CONFIG.popular.length).toBeLessThanOrEqual(5);
    for (const entry of SEARCH_CONFIG.popular) {
      expect(search(prepared, entry.query, SEARCH_CONFIG, limits).total, entry.label).toBeGreaterThan(0);
    }
  });

  it('corrections point at a spelling that exists in the catalog', () => {
    for (const [wrong, right] of Object.entries(SEARCH_CONFIG.corrections)) {
      expect(wrong).not.toBe(right);
      expect(search(prepared, right, SEARCH_CONFIG, limits).total, right).toBeGreaterThan(0);
      expect(search(prepared, wrong, SEARCH_CONFIG, limits).total, wrong).toBeGreaterThan(0);
    }
  });
});

describe('the search index', () => {
  it('holds the hand-checked sticks only, never a feed import', () => {
    const sticks = index.items.filter((item) => item.type === 'stick');
    expect(sticks.length).toBe(getAllProducts(NOW).length);
    const imported = new Set(getAllProducts(NOW, { includeImported: true }).filter(isFeedImport).map((p) => p.slug));
    for (const stick of sticks) expect(imported.has(stick.id), stick.id).toBe(false);
  });

  it('links every item to a page of the site', () => {
    for (const item of index.items) {
      if (item.type === 'stick') expect(item.path).toMatch(/^\/(sticks|zaalsticks)\/[a-z0-9-]+$/);
      if (item.type === 'article') expect(item.path).toMatch(/^\/(kennis|blog)\/[a-z0-9-]+$/);
      if (item.type === 'brand') expect(item.path).toMatch(/^\/merken(\/[a-z]+|#merk-[a-z0-9-]+)$/);
    }
  });

  it('gives the five brands with a page their own address', () => {
    const pages = index.items.filter((item) => item.type === 'brand' && item.hasPage).map((item) => item.path);
    expect(pages.sort()).toEqual(['/merken/brabo', '/merken/grays', '/merken/jdh', '/merken/osaka', '/merken/princess']);
  });

  it('stays small: a light file for a lazy load', () => {
    expect(JSON.stringify(index).length).toBeLessThan(120_000);
  });

  it('is served as static JSON that search engines are told to skip', async () => {
    const response = GET();
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    const body = (await response.json()) as { items: SearchItem[] };
    expect(body.items.length).toBe(index.items.length);
  });

  it('finds a real stick by brand and model, first', () => {
    const result = search(prepared, 'grays jb10', SEARCH_CONFIG, limits);
    expect(result.sticks[0]?.item.id).toBe('grays-jb10-composite');
  });
});

describe('the price line under a stick', () => {
  const base: SearchItem = { type: 'stick', id: 's', title: 'S', path: '/sticks/s', carbon: 70, bow: 'Low bow' };

  it('shows a current price with the number of shops, with the date rule of "Waar te koop"', () => {
    const item = { ...base, price: { shopEur: 179.99, shopCount: 3, readAt: '2026-11-20', indicativeEur: 200 } };
    expect(priceLine(item, NOW)).toEqual({ text: 'Vergelijk prijzen vanaf €179,99 bij 3 winkels', indicative: false });
    expect(priceLine({ ...item, price: { ...item.price, shopCount: 1 } }, NOW)?.text).toBe('€179,99 incl. verzending bij 1 winkel');
  });

  it('drops the amount of a price older than 14 days and shows the indicative price, marked as such', () => {
    const old = { ...base, price: { shopEur: 179.99, shopCount: 3, readAt: '2026-11-09', indicativeEur: 200 } };
    expect(priceLine(old, NOW)).toEqual({ text: 'Richtprijs €200,00, geen actuele winkelprijs', indicative: true });
    expect(priceLine({ ...old, price: { readAt: '2026-11-09' } }, NOW)).toBeNull();
  });

  it('never says cheapest or best price', () => {
    const texts = index.items.filter((item) => item.type === 'stick').map((item) => priceLine(item, NOW)?.text ?? '');
    for (const text of texts) expect(text).not.toMatch(/goedkoopst|beste prijs|scherpste|korting|%/i);
  });

  it('lists carbon and bow', () => {
    expect(stickFacts(base)).toBe('70% carbon · Low bow');
    expect(stickFacts({ ...base, carbon: 0 })).toBe('geen carbon · Low bow');
    expect(stickFacts({ ...base, carbon: null, bow: undefined })).toBe('');
  });
});

describe('the search in the header', () => {
  it('has a search button with an accessible name and a dialog with a combobox', () => {
    const html = renderToStaticMarkup(createElement(Header));
    expect(html).toContain('aria-label="Zoeken (Ctrl of Cmd + K)"');
    expect(html).toContain('<dialog');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-controls=');
    expect(html).toContain('Zoek op merk, model of onderwerp...');
  });
});

describe('the answers and the stickwijzer pointer in search-config.json', () => {
  const articles = new Map(getAllArticles().map((article) => [article.slug, article]));

  it('covers the five knowledge questions of the brief, each with its article', () => {
    for (const query of ['carbon', 'beginner', 'lengte', 'maat', 'low bow']) {
      const result = search(prepared, query, SEARCH_CONFIG, limits);
      expect(result.answer, query).not.toBeNull();
      expect(result.answer?.path, query).toMatch(/^\/kennis\/[a-z0-9-]+$/);
      expect(result.knowledgeFirst, query).toBe(true);
    }
  });

  it.each(SEARCH_CONFIG.answers.map((answer) => [answer.article, answer] as const))('the answer for %s comes from a published article and claims nothing the article does not say', (slug, answer) => {
    const article = articles.get(slug);
    expect(article, `no published article ${slug}`).toBeDefined();
    // Every number in the answer is in the article: nothing invented.
    const articleText = JSON.stringify(article);
    for (const number of answer.text.match(/\d+(?:[.,]\d+)?/g) ?? []) expect(articleText, number).toContain(number);
    expect(answer.text).not.toMatch(/altijd|nooit|gegarandeerd|garantie|zeker weten|de beste|beste stick|voorkomt/i);
    expect(answer.text).not.toMatch(/[!]|—/);
  });

  it('points at the stickwijzer for every general word, and never for a model', () => {
    for (const term of SEARCH_CONFIG.stickwijzer.terms) {
      expect(search(prepared, term, SEARCH_CONFIG, limits).wijzerHint, term).toBe(true);
    }
    expect(search(prepared, 'grays jb10', SEARCH_CONFIG, limits).wijzerHint).toBe(false);
  });

  it('lists an article before the sticks for a knowledge question', () => {
    const result = search(prepared, 'carbon', SEARCH_CONFIG, limits);
    expect(result.articles.length).toBeGreaterThan(0);
    expect(result.knowledgeFirst).toBe(true);
  });
});

describe('the stickwijzer from the search (source: search)', () => {
  function withStorage(run: () => void) {
    const store = new Map<string, string>();
    const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { sessionStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) }, location: { pathname: '/sticks/x' } },
    });
    try {
      run();
    } finally {
      if (original) Object.defineProperty(globalThis, 'window', original);
      else delete (globalThis as { window?: unknown }).window;
    }
  }

  it('is remembered after a click from the search and cleared when the quiz is done', () => {
    withStorage(() => {
      expect(stickwijzerFromSearch()).toBe(false);
      markStickwijzerFromSearch();
      expect(stickwijzerFromSearch()).toBe(true);
      clearStickwijzerFromSearch();
      expect(stickwijzerFromSearch()).toBe(false);
    });
  });

  it('expires after 30 minutes', () => {
    withStorage(() => {
      const now = Date.now();
      const spy = vi.spyOn(Date, 'now');
      spy.mockReturnValue(now);
      markStickwijzerFromSearch();
      spy.mockReturnValue(now + 31 * 60 * 1000);
      expect(stickwijzerFromSearch()).toBe(false);
      spy.mockRestore();
    });
  });

  it('remembers the stick page that was opened from a result, only for that page', () => {
    withStorage(() => {
      expect(isFromSearch()).toBe(false);
      markSearchSelection('/sticks/x');
      expect(isFromSearch()).toBe(true);
      markSearchSelection('/sticks/other');
      expect(isFromSearch()).toBe(false);
    });
  });

  it('does not break when storage is blocked', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        get sessionStorage(): never {
          throw new Error('blocked');
        },
        location: { pathname: '/' },
      },
    });
    try {
      expect(() => markStickwijzerFromSearch()).not.toThrow();
      expect(stickwijzerFromSearch()).toBe(false);
      expect(isFromSearch()).toBe(false);
    } finally {
      if (original) Object.defineProperty(globalThis, 'window', original);
      else delete (globalThis as { window?: unknown }).window;
    }
  });
});
