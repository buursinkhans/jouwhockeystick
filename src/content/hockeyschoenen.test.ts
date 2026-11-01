import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HockeyschoenenPage, { metadata as overviewMetadata } from '@/app/hockeyschoenen/page';
import ShoePage, { generateMetadata, generateStaticParams } from '@/app/hockeyschoenen/[slug]/page';
import { GET as feedList } from '@/app/data/aanbod-schoenen.json/route';
import sitemap from '@/app/sitemap';
import { getCuratedShoes, getImportedShoes, getShoeBySlug, getShoeListings, shoePath } from '@/catalog/shoes';
import { shoeCertainty } from '@/catalog/shoes/certainty';
import { getShoeOffers } from '@/catalog/shoes/offers';
import { UNKNOWN, type Shoe } from '@/catalog/shoes/types';
import { plainText } from '@/components/article/inlineMarkup';
import { SHIPPING, shippingCostEur } from '@/lib/retailers';
import { SITE_URL } from '@/lib/site';
import { HOCKEYSCHOENEN, checksFor } from './hockeyschoenen';

/** Phase 2 of /hockeyschoenen (decision log 2026-11-01). */
const overview = async (query: { type?: string; leeftijd?: string } = {}) =>
  renderToStaticMarkup(await HockeyschoenenPage({ searchParams: Promise.resolve(query) }));
const modelPage = async (slug: string) => renderToStaticMarkup(await ShoePage({ params: Promise.resolve({ slug }) }));
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]!) as Record<string, unknown>);
const curated = (slug: string) => getCuratedShoes().find((s) => s.slug === slug)!;

/** Claims the keuzemodel forbids (§8, §3.3) and the site never makes. */
const FORBIDDEN = /beste (hockey)?schoen|voorkomt (enkel)?blessures|gegarandeerd|perfecte pasvorm|\d+\s?% match|gripscore|goedkoopste? (winkel|prijs|aanbieding)|beste prijs|korting/i;

afterEach(() => vi.useRealTimers());

describe('model certainty (laag C per model)', () => {
  it('rates feed models as insufficient and checked models by what is confirmed', () => {
    for (const shoe of getImportedShoes()) expect(shoeCertainty(shoe), shoe.slug).toBe('onvoldoende-informatie');
    // Field confirmed, surface confirmed, no fit data: still conditional.
    expect(shoeCertainty(curated('grays-aerocage-x10'))).toBe('voorwaardelijk');
    // Indoor with non-marking but no fit: conditional.
    expect(shoeCertainty(curated('brabo-force-zaal'))).toBe('voorwaardelijk');
    const withFit: Shoe = {
      ...curated('grays-aerocage-x10'),
      fitHeel: { value: { code: 'smal', description: 'narrow heel' }, source: 'brand-website', lastVerifiedAt: '2026-11-01' },
    };
    expect(shoeCertainty(withFit)).toBe('goede-onderbouwing');
    // Without a confirmed surface a fit claim is not enough.
    expect(shoeCertainty({ ...withFit, surfaceWater: UNKNOWN, surfaceSand: UNKNOWN })).toBe('voorwaardelijk');
    expect(shoeCertainty({ ...withFit, category: UNKNOWN })).toBe('onvoldoende-informatie');
  });
});

describe('shoe offers', () => {
  it('turn the feed listings into offers with the shops’ shipping, and no inch lengths', () => {
    for (const shoe of getCuratedShoes()) {
      const listings = getShoeListings(shoe.slug);
      const offers = getShoeOffers(shoe);
      expect(offers.map((o) => o.retailer), shoe.slug).toEqual(listings.map((l) => l.shop));
      for (const offer of offers) {
        expect(offer.shippingEur).toBe(shippingCostEur(SHIPPING[offer.retailer], offer.priceEur!));
        expect(offer.lengths).toBeUndefined();
      }
    }
  });
});

describe('/hockeyschoenen overview', () => {
  it('answers the main question in the first 80 words and has unique metadata', () => {
    const first80 = plainText(HOCKEYSCHOENEN.intro).split(/\s+/).slice(0, 80).join(' ').toLowerCase();
    expect(first80).toContain('welke hockeyschoenen');
    for (const word of ['veld', 'zaal', 'non-marking', 'pasvorm']) expect(first80).toContain(word);
    expect(overviewMetadata.alternates?.canonical).toBe('/hockeyschoenen');
    expect(HOCKEYSCHOENEN.metaDescription.length).toBeLessThanOrEqual(158);
  });

  it('shows the checked models as cards and the feed models as a plain list, with one H1', async () => {
    const html = await overview();
    expect(html.match(/<h1/g)).toHaveLength(1);
    for (const shoe of getCuratedShoes()) expect(html).toContain(`href="${shoePath(shoe)}"`);
    expect(html).toContain(`${HOCKEYSCHOENEN.feed.heading} <span class="font-normal text-lijngrijs">(${getImportedShoes().length})`);
    expect(html).toContain('Pascontrole');
    expect(html).not.toMatch(FORBIDDEN);
  });

  it('loads the feed models only after a click, like the imported sticks', async () => {
    const html = await overview();
    for (const shoe of getImportedShoes()) expect(html, shoe.slug).not.toContain(`href="${shoePath(shoe)}"`);
    expect(html).toContain(`Toon ook ${getImportedShoes().length} modellen uit het aanbod van de winkels`);
    const response = feedList();
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex');
    const items = (await response.json()) as { slug: string; category: string }[];
    expect(items.map((i) => i.slug).sort()).toEqual(getImportedShoes().map((s) => s.slug).sort());
    // A light list: no specs, listings or images.
    expect(Object.keys(items[0]!).sort()).toEqual(['ageGroup', 'brand', 'category', 'model', 'slug']);
    // The button counts with the filter, unknown kinds left out.
    const zaal = await overview({ type: 'zaal' });
    expect(zaal).toContain(`Toon ook ${getImportedShoes().filter((s) => s.category.value === 'zaal').length} modellen`);
  });

  it('filters on field or indoor and on age, and never counts an unknown kind as a match', async () => {
    const html = await overview({ type: 'zaal', leeftijd: 'senior' });
    const zaalSenior = getCuratedShoes().filter((s) => s.category.value === 'zaal' && s.ageGroup === 'senior');
    expect(zaalSenior.length).toBeGreaterThan(0);
    expect(html).toContain(`${HOCKEYSCHOENEN.checked.heading} <span class="font-normal text-lijngrijs">(${zaalSenior.length})`);
    for (const shoe of getCuratedShoes().filter((s) => !zaalSenior.includes(s))) expect(html, shoe.slug).not.toContain(`href="${shoePath(shoe)}"`);
    for (const shoe of getImportedShoes().filter((s) => s.category.value === 'onbekend')) {
      expect(html, shoe.slug).not.toContain(`href="${shoePath(shoe)}"`);
    }
    expect(html).toContain('aria-current="page"');
  });
});

describe('shoe model page', () => {
  it('has one H1, the status, the checks, the sources, "Waar te koop" and the fit check', async () => {
    const html = await modelPage('grays-aerocage-x10');
    expect(html.match(/<h1/g)).toHaveLength(1);
    for (const text of ['Basis en zekerheid', 'Voorwaardelijk', HOCKEYSCHOENEN.model.checkHeading, HOCKEYSCHOENEN.model.specsHeading, 'Waar te koop', 'Pascontrole']) {
      expect(html).toContain(text);
    }
    expect(html).toContain('rock-solid stability on both water- and sand-based turfs');
    expect(html).toContain('href="https://www.grays-hockey.com/products/aerocage-x10-shoe"');
    // Shop links carry the shoe placement; the shop is the seller.
    expect(html).toMatch(/passasports[^"]*schoenpagina|schoenpagina[^"]*passasports/i);
    expect(html).toContain('de winkel is de verkoper');
    expect(html).toContain('voor één paar');
  });

  it('never makes a forbidden claim on any checked model page', async () => {
    for (const shoe of getCuratedShoes()) expect(await modelPage(shoe.slug), shoe.slug).not.toMatch(FORBIDDEN);
  });

  it('describes only visible, current prices in the structured data, and never a review or rating', async () => {
    const html = await modelPage('grays-aerocage-x10');
    const product = jsonLd(html).find((d) => d['@type'] === 'Product')!;
    expect(JSON.stringify(product)).not.toMatch(/Review|AggregateRating|ratingValue/);
    // More than 14 days after the feed was read the amounts disappear, and so do the offers.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2027-06-01'));
    const later = jsonLd(await modelPage('grays-aerocage-x10')).find((d) => d['@type'] === 'Product')!;
    expect(later.offers).toBeUndefined();
  });

  it('keeps feed models out of Google and checked models in', async () => {
    const feedShoe = getImportedShoes()[0]!;
    const feedMeta = await generateMetadata({ params: Promise.resolve({ slug: feedShoe.slug }) });
    expect(feedMeta.robots).toMatchObject({ index: false, follow: true });
    const checkedMeta = await generateMetadata({ params: Promise.resolve({ slug: 'brabo-elite' }) });
    expect(checkedMeta.robots).toBeUndefined();
    expect(checkedMeta.alternates?.canonical).toBe('/hockeyschoenen/brabo-elite');
    expect(await modelPage(feedShoe.slug)).toContain(HOCKEYSCHOENEN.model.feedNotice);
    expect(generateStaticParams()).toHaveLength(getCuratedShoes().length + getImportedShoes().length);
  });

  it('lists what is still to check instead of showing unknowns as strengths', () => {
    const elite = checksFor(curated('brabo-elite'));
    expect(elite.join(' ')).toMatch(/water, zand of semi-water/);
    expect(elite.join(' ')).toMatch(/pasvorm bij voorvoet, hiel en wreef/);
    expect(checksFor(curated('osaka-furo-court')).join(' ')).toMatch(/non-marking/);
    expect(checksFor(curated('brabo-force-zaal')).join(' ')).not.toMatch(/non-marking/);
    expect(checksFor(curated('asics-gel-peake-3')).join(' ')).toMatch(/van de winkel, niet van het merk/);
    expect(checksFor(getShoeBySlug(getImportedShoes()[0]!.slug)!)[0]).toMatch(/nog niet gecontroleerd/);
  });
});

describe('navigation, sitemap and llms.txt', () => {
  it('lists the overview and the checked models in the sitemap, not the feed models', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/hockeyschoenen`);
    for (const shoe of getCuratedShoes()) expect(urls).toContain(`${SITE_URL}${shoePath(shoe)}`);
    for (const shoe of getImportedShoes()) expect(urls).not.toContain(`${SITE_URL}${shoePath(shoe)}`);
  });

  it('links the section from the menu, the footer and quietly from the stickwijzer result', () => {
    for (const file of ['src/components/layout/Header.tsx', 'src/components/layout/Footer.tsx', 'src/components/stickwijzer/QuizResult.tsx', 'src/app/llms.txt/route.ts']) {
      expect(readFileSync(file, 'utf8'), file).toContain('/hockeyschoenen');
    }
    expect(readFileSync('src/components/stickwijzer/QuizResult.tsx', 'utf8')).toContain('Ook nieuwe hockeyschoenen nodig?');
    // Not on the homepage hero.
    expect(readFileSync('src/app/page.tsx', 'utf8')).not.toContain('/hockeyschoenen');
  });
});
