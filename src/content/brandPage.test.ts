import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import MerkenPage from '@/app/merken/page';
import BrandPage, { generateMetadata, generateStaticParams } from '@/app/merken/[merk]/page';
import SeriesPage from '@/app/vergelijk/[reeks]/page';
import { getProductBySlug } from '@/catalog';
import { BRAND_PAGES, brandPagePath, evaluateBrandPage } from '@/catalog/brandPages';
import { productPath } from '@/catalog/paths';
import { ProductDetail } from '@/components/catalog/ProductDetail';
import { plainText } from '@/components/article/inlineMarkup';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
import { inSitemap, urlsForFiles } from '@/seo/indexnow';
import { getArticleBySlug } from './index';
import { brandDescription, brandFaq, brandIntro, brandReadMore, brandTitle } from './brandPage';

const evaluations = BRAND_PAGES.map((b) => evaluateBrandPage(b));
const FORBIDDEN = /\b(beste|goedkoopst\w*|scherpste prijs|onafhankelijk\w*|objectief|objectieve|persoonlijk advies|korting\w*|bespaar\w*|gegarandeerd|ideaal|ideale|perfect\w*)\b/i;

describe.each(evaluations.map((e) => [e.definition.slug, e] as const))('text of the brand page %s', (_slug, e) => {
  const all = () => [brandTitle(e), brandDescription(e), brandIntro(e), ...brandFaq(e).flatMap((f) => [f.question, f.answer])].join('\n');

  it('has a title of at most 60 characters and a description that fits without being cut', () => {
    expect(brandTitle(e).length).toBeLessThanOrEqual(60);
    expect(brandDescription(e).length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(brandTitle(e)).toContain(e.definition.brand);
  });

  it('answers in the first 80 words: how many sticks, which levels, bows and carbon', () => {
    const intro = brandIntro(e);
    expect(intro.split(/\s+/).length).toBeLessThanOrEqual(80);
    expect(intro).toContain(`${e.sticks.length} ${e.definition.brand}-sticks`);
    expect(intro).toContain('geen rangorde');
  });

  it('makes no ranking, discount or absolute claim, and follows the house style', () => {
    const text = all();
    expect(text).not.toMatch(FORBIDDEN);
    expect(text).not.toMatch(/[!—–]/);
  });

  it('has five questions, no prices in the answers, and links that exist', () => {
    const faq = brandFaq(e);
    expect(faq).toHaveLength(5);
    for (const f of faq) expect(f.answer).not.toContain('€');
    const links = [...faq.map((f) => f.answer).join(' ').matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]!);
    for (const href of links) expect(getArticleBySlug(href.split('/')[2]!), href).toBeDefined();
  });

  it('uses the real titles of the articles it links to', () => {
    for (const link of brandReadMore(e).filter((l) => l.href.startsWith('/kennis/'))) {
      expect(getArticleBySlug(link.href.split('/')[2]!)?.title, link.href).toBe(link.label);
    }
  });
});

describe('titles and descriptions', () => {
  it('are unique per brand', () => {
    expect(new Set(evaluations.map(brandTitle)).size).toBe(evaluations.length);
    expect(new Set(evaluations.map(brandDescription)).size).toBe(evaluations.length);
  });
});

describe('the page /merken/[merk]', () => {
  it('is built for exactly the defined brands', () => {
    expect(generateStaticParams()).toEqual(BRAND_PAGES.map((b) => ({ merk: b.slug })));
  });

  it('returns a 404 for a brand without a page', async () => {
    await expect(BrandPage({ params: Promise.resolve({ merk: 'stag' }) })).rejects.toThrow();
  });

  it.each(evaluations.map((e) => [e.definition.slug, e] as const))('%s: one H1, unique ids, a row for every stick, sources visible and no shop button', async (slug, e) => {
    const html = renderToStaticMarkup(await BrandPage({ params: Promise.resolve({ merk: slug }) }));
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!);
    expect(new Set(ids).size, 'duplicate ids').toBe(ids.length);
    for (const p of e.sticks) expect(html).toContain(`href="${productPath(p)}"`);
    expect(html).toMatch(/Merksite|Partnerwinkel/);
    expect(html).toContain('Hoe we vergelijken');
    // Shop clicks happen on the stick page: no partner link, no sponsored link, no price claim here.
    expect(html).not.toMatch(/partner\.bol\.com|awin1\.com|passasports\.nl\/tt|tradetracker|partner\.daka\.nl|rel="[^"]*sponsored/i);
    expect(html).not.toMatch(/goedkoopst(?!e standaardoptie)|beste prijs|scherpste prijs/i);
  });

  it.each(evaluations.map((e) => [e.definition.slug, e] as const))('%s: FAQ data equals the visible text, and the item list names the sticks', async (slug, e) => {
    const html = renderToStaticMarkup(await BrandPage({ params: Promise.resolve({ merk: slug }) }));
    const json = html.match(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema.org","@type":"FAQPage".*?\})<\/script>/)?.[1];
    expect(json).toBeDefined();
    const parsed = JSON.parse(json!.replace(/\\u003c/g, '<')) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    for (const [i, f] of brandFaq(e).entries()) {
      expect(parsed.mainEntity[i]?.name).toBe(f.question);
      expect(parsed.mainEntity[i]?.acceptedAnswer.text).toBe(plainText(f.answer));
    }
    expect(html).toContain('"@type":"ItemList"');
    expect(html).not.toMatch(/"@type":"(Offer|AggregateOffer|Review|AggregateRating)"/);
  });

  it.each(evaluations.map((e) => [e.definition.slug] as const))('%s: has its own canonical and is not noindex while it passes the gate', async (slug) => {
    const meta = await generateMetadata({ params: Promise.resolve({ merk: slug }) });
    expect(meta.alternates?.canonical).toBe(brandPagePath(slug));
    expect(meta.robots).toBeUndefined();
  });

  it('shows a group table only from three sticks, and says what is missing', async () => {
    const html = renderToStaticMarkup(await BrandPage({ params: Promise.resolve({ merk: 'princess' }) }));
    expect(html).toContain('Veldsticks voor kinderen en junioren');
    expect(html).not.toContain('Veldsticks voor volwassenen');
    expect(html).toContain('Overige modellen');
    const grays = renderToStaticMarkup(await BrandPage({ params: Promise.resolve({ merk: 'grays' }) }));
    expect(grays).toContain('Nog niet in de tabel');
    expect(grays).toContain(getProductBySlug('grays-db2xi-dynabow-indoor')!.name);
    expect(grays).toContain('de kromming (bow) staat niet in onze gegevens');
  });
});

describe('sitemap, IndexNow and links (brand pages)', () => {
  const urls = sitemap().map((entry) => entry.url);

  it('lists every brand page that passes the gate, with a lastmod date', () => {
    for (const b of BRAND_PAGES) {
      const entry = sitemap().find((e) => e.url === `https://jouwhockeystick.nl${brandPagePath(b.slug)}`);
      expect(entry, b.slug).toBeDefined();
      expect(entry?.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('reports the brand pages when their definition, gate, text or profiles change, and only those in the sitemap', () => {
    for (const file of ['src/catalog/brandPageDefinitions.ts', 'src/catalog/brandPages.ts', 'src/content/brandPage.ts', 'src/content/brands.ts']) {
      const reported = inSitemap(urlsForFiles([file]), urls);
      for (const b of BRAND_PAGES) expect(reported, file).toContain(`https://jouwhockeystick.nl${brandPagePath(b.slug)}`);
    }
  });

  it('/merken links to a brand page next to each profile that has one', async () => {
    const html = renderToStaticMarkup(createElement(MerkenPage));
    for (const b of BRAND_PAGES) expect(html).toContain(`href="${brandPagePath(b.slug)}"`);
    expect(html).not.toContain('href="/merken/jdh"');
  });

  it('a stick page links its brand label to the brand page; a brand without a page has no link', () => {
    const jb10 = renderToStaticMarkup(createElement(ProductDetail, { product: getProductBySlug('grays-jb10-composite')! }));
    expect(jb10).toContain('href="/merken/grays"');
    const jdh = renderToStaticMarkup(createElement(ProductDetail, { product: getProductBySlug('jdh-x93-pro-bow')! }));
    expect(jdh).not.toContain('href="/merken/jdh"');
  });

  it('the Grays series pages link to the Grays brand page', async () => {
    const html = renderToStaticMarkup(await SeriesPage({ params: Promise.resolve({ reeks: 'grays-jb-serie' }) }));
    expect(html).toContain('href="/merken/grays"');
  });

  it('the zaalhockey article links to the Grays brand page', () => {
    expect(JSON.stringify(getArticleBySlug('veldstick-zaalhockey')!.sections)).toContain('](/merken/grays)');
  });
});
