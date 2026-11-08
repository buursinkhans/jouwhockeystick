import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HockeyschoenenPage from '@/app/hockeyschoenen/page';
import ZaalsticksPage from '@/app/zaalsticks/page';
import { ShoeArticleLinks } from '@/components/shoes/ShoeArticleLinks';
import { getAllArticles } from './index';
import { hockeystickLengteTabel } from './articles/hockeystick-lengte-tabel';
import { SHOE_ARTICLE_SLUGS, shoeArticleLinks } from './shoeArticles';
import { ZAAL } from './zaal';

/** Phase 4 of #100: links to the shoe articles once they are live, and quiet pointers to the shoes. */
describe('links to the shoe articles', () => {
  it('lists only live articles with an agreed slug, in the agreed order', () => {
    const live = new Set(getAllArticles().map((a) => a.slug));
    expect(shoeArticleLinks().map((l) => l.href)).toEqual(SHOE_ARTICLE_SLUGS.filter((s) => live.has(s)).map((s) => `/kennis/${s}`));
    const fake = [
      { slug: 'hockeyschoenen-versleten', title: 'Wanneer zijn je hockeyschoenen versleten?' },
      { slug: 'welke-hockeyschoenen-heb-je-nodig', title: 'Welke hockeyschoenen heb je nodig?' },
      { slug: 'hockeystick-lengte-tabel', title: 'Lengtetabel' },
    ];
    expect(shoeArticleLinks(fake)).toEqual([
      { href: '/kennis/welke-hockeyschoenen-heb-je-nodig', title: 'Welke hockeyschoenen heb je nodig?' },
      { href: '/kennis/hockeyschoenen-versleten', title: 'Wanneer zijn je hockeyschoenen versleten?' },
    ]);
  });

  it('shows the block only when there is something to read', async () => {
    expect(renderToStaticMarkup(createElement(ShoeArticleLinks, { links: [] }))).toBe('');
    const html = renderToStaticMarkup(createElement(ShoeArticleLinks, { links: [{ href: '/kennis/hockeyschoenen-versleten', title: 'Versleten?' }] }));
    expect(html).toContain('Meer weten over hockeyschoenen');
    expect(html).toContain('href="/kennis/hockeyschoenen-versleten"');
    const overview = renderToStaticMarkup(await HockeyschoenenPage({ searchParams: Promise.resolve({}) }));
    expect(overview.includes('Meer weten over hockeyschoenen')).toBe(shoeArticleLinks().length > 0);
  });
});

describe('quiet pointers to the shoes', () => {
  it('from the length table, at the end', () => {
    const last = hockeystickLengteTabel.sections.at(-1)!;
    expect(JSON.stringify(last.body)).toContain('](/hockeyschoenen)');
  });

  it('from /zaalsticks, to the indoor shoes', () => {
    expect(ZAAL.shoesNote).toContain('](/hockeyschoenen?type=zaal)');
    expect(renderToStaticMarkup(ZaalsticksPage())).toContain('href="/hockeyschoenen?type=zaal"');
  });
});
