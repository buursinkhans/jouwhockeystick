import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SticksPage, { generateMetadata } from '@/app/sticks/page';
import sitemap from '@/app/sitemap';
import { getFieldProducts } from '@/catalog';
import { FEED_READ_DATES, getFeedReadDates } from '@/catalog/feedDates';
import { PASSAHOCKEY_IMPORT_DATE } from '@/catalog/imported/passahockey';
import { isJuniorStick } from '@/catalog/similar';
import { getCatalogStats } from '@/catalog/stats';
import { plainText } from '@/components/article/inlineMarkup';
import { MAX_DESCRIPTION_LENGTH, SITE_URL } from '@/lib/site';
import { VELD, veldFaq, veldMetaDescription } from './veld';

const render = async (searchParams: { brand?: string } = {}) =>
  renderToStaticMarkup(await SticksPage({ searchParams: Promise.resolve(searchParams) }));

describe('/sticks meta description (decision log 2026-10-29)', () => {
  it('names the live stick and brand counts, uncut, in the meta and Open Graph description', () => {
    const stats = getCatalogStats(new Date());
    const metadata = generateMetadata();
    const description = metadata.description!;
    expect(description).toBe(
      `Vergelijk ${stats.fieldSticks} veldhockeysticks van ${stats.fieldBrands.length} merken op lengte, bow, carbon en niveau, met de bron bij elk gegeven. Plus een eerste keuze per niveau.`,
    );
    expect(description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(description).not.toContain('…');
    expect(metadata.openGraph?.description).toBe(description);
  });

  it('keeps the SEO title, H1, canonical and Open Graph URL', () => {
    const metadata = generateMetadata();
    expect(VELD.title).toBe('Veldhockeysticks vergelijken');
    expect(VELD.seoTitle).toBe('Veldhockeysticks vergelijken: lengte, bow, carbon en niveau');
    expect(JSON.stringify(metadata.title)).toContain(VELD.seoTitle);
    expect(metadata.alternates?.canonical).toBe('/sticks');
    expect(metadata.openGraph?.url).toBe('/sticks');
  });

  it('falls back to the plain text, never a cut-off one, when the counts are missing or too long', () => {
    expect(VELD.metaDescription.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(VELD.metaDescription).not.toMatch(/\d/);
    expect(veldMetaDescription(0, 18)).toBe(VELD.metaDescription);
    expect(veldMetaDescription(482, 1)).toBe(VELD.metaDescription);
    expect(veldMetaDescription(10 ** 15, 10 ** 15)).toBe(VELD.metaDescription);
    expect(veldMetaDescription(NaN, 18)).toBe(VELD.metaDescription);
    // Four-digit counts still fit.
    expect(veldMetaDescription(9999, 99)).toContain('9999 veldhockeysticks van 99 merken');
  });
});

describe('/sticks offer date (decision log 2026-10-29)', () => {
  it('reads the dates the weekly sync writes, not today', () => {
    expect(FEED_READ_DATES).toHaveLength(5);
    expect(FEED_READ_DATES).toContain(PASSAHOCKEY_IMPORT_DATE);
    expect(getFeedReadDates(['2026-10-28', '2026-10-28'])).toEqual({ from: '2026-10-28', to: '2026-10-28' });
    expect(getFeedReadDates(['2026-10-28', '2026-10-21', '2026-10-27'])).toEqual({ from: '2026-10-21', to: '2026-10-28' });
  });

  it('shows no offer date when a sync date is missing or malformed', () => {
    expect(getFeedReadDates([])).toBeNull();
    expect(getFeedReadDates(['2026-10-28', ''])).toBeNull();
    expect(getFeedReadDates(['2026-10-28', '28-10-2026'])).toBeNull();
    expect(getFeedReadDates(['2026-13-45'])).toBeNull();
  });

  it('shows the offer date apart from the editorial date, which stays the sitemap lastmod', async () => {
    const html = await render();
    const dates = getFeedReadDates()!;
    expect(html).toMatch(new RegExp(`bijgewerkt op <time dateTime="${VELD.updatedAt}">`, 'i'));
    expect(html).toMatch(new RegExp(`Aanbod en winkelprijzen gelezen (op|tussen) <time dateTime="${dates.from}">`, 'i'));
    const entry = sitemap().find((e) => e.url === `${SITE_URL}/sticks`);
    expect(entry?.lastModified).toBe(VELD.updatedAt);
    // The page never makes up a date from the clock.
    expect(readFileSync('src/catalog/feedDates.ts', 'utf8')).not.toMatch(/new Date\(\)/);
  });
});

describe('/sticks FAQ (decision log 2026-10-29)', () => {
  const products = getFieldProducts(new Date(), { includeImported: true });
  const faq = veldFaq(products);
  const answer = (start: string) => faq.find((item) => item.question.startsWith(start))!.answer;

  it('says the price ranges include junior sticks and gives junior and adult apart', () => {
    const price = answer('Wat kost');
    expect(price).toContain(`${products.length} veldsticks, juniorsticks en sticks voor volwassenen samen`);
    const juniors = products.filter(isJuniorStick).map((p) => p.priceIndicativeEur.value);
    const adults = products.filter((p) => !isJuniorStick(p)).map((p) => p.priceIndicativeEur.value);
    const euro = (n: number) => `€${Math.round(n)}`;
    expect(price).toContain(`juniorsticks ${euro(Math.min(...juniors))} tot ${euro(Math.max(...juniors))}`);
    expect(price).toContain(`sticks voor volwassenen ${euro(Math.min(...adults))} tot ${euro(Math.max(...adults))}`);
    expect(price).toContain('Per niveau, junior en volwassen samen:');
  });

  it('explains carbon instead of a 0–100% range, with the link to the carbon article', () => {
    const carbon = answer('Hoeveel carbon');
    expect(carbon).not.toMatch(/\d+\s?%/);
    expect(carbon).toContain('](/kennis/meer-carbon-hockeystick-beter)');
    expect(carbon).toContain('een vaste norm is er niet');
  });

  it('keeps five questions, also in the FAQPage structured data', async () => {
    expect(faq).toHaveLength(5);
    const html = await render();
    const jsonLd = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1]!) as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(jsonLd.mainEntity.map((q) => q.name)).toEqual(faq.map((item) => item.question));
    expect(jsonLd.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(faq.map((item) => plainText(item.answer)));
  });
});
