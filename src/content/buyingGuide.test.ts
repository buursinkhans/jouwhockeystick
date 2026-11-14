import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ArticlePage, { generateMetadata as articleMetadata } from '@/app/kennis/[slug]/page';
import SticksPage, { generateMetadata as sticksMetadata } from '@/app/sticks/page';
import { getFieldProducts } from '@/catalog';
import { plainText } from '@/components/article/inlineMarkup';
import { BUDGET_BANDS, budgetRows, hoeKiesJeDeJuisteHockeystick as article } from './articles/hoe-kies-je-de-juiste-hockeystick';
import { METHODE } from './methode';
import { QUESTIONS } from './stickwijzer/questions';
import { VELD, veldFaq } from './veld';

/** Owner's brief 2026-11-14: one page per search intent (decision log). */
describe('"Welke hockeystick kopen" guide on /kennis/hoe-kies-je-de-juiste-hockeystick', () => {
  const text = JSON.stringify(article.sections);

  it('targets "welke hockeystick kopen" in title, H1 and the opening answer, within the length limits', async () => {
    expect(article.slug).toBe('hoe-kies-je-de-juiste-hockeystick');
    expect(article.title.toLowerCase()).toContain('welke hockeystick kopen');
    expect(article.seoTitle!.toLowerCase()).toContain('welke hockeystick kopen');
    expect(article.seoTitle!.length).toBeLessThanOrEqual(60);
    expect(article.metaDescription.length).toBeLessThanOrEqual(155);
    const metadata = await articleMetadata({ params: Promise.resolve({ slug: article.slug }) });
    expect(JSON.stringify(metadata.title)).toContain(article.seoTitle);
    // The direct answer: two to four sentences, within the first 80 words.
    const intro = plainText(article.intro);
    expect(intro.split(/\s+/).length).toBeLessThanOrEqual(80);
    expect(intro.split(/(?<=\.)\s/).length).toBeGreaterThanOrEqual(2);
    expect(intro.split(/(?<=\.)\s/).length).toBeLessThanOrEqual(4);
  });

  it('uses the Jouwhockeystick-methode as written in methode.ts, in its order speler, stick, maat', () => {
    expect(text).toContain(JSON.stringify(METHODE.m50).slice(1, -1));
    const ids = article.sections.map((s) => s.id).filter(Boolean);
    expect(ids.indexOf('speler')).toBeLessThan(ids.indexOf('stick'));
    expect(ids.indexOf('stick')).toBeLessThan(ids.indexOf('maat'));
  });

  it('keeps each step short and links the article that goes deeper', () => {
    for (const href of [
      '/kennis/hockeystick-kinderen-en-beginners',
      '/kennis/wat-kost-een-hockeystick',
      '/kennis/low-bow-vs-mid-bow',
      '/kennis/meer-carbon-hockeystick-beter',
      '/kennis/hockeystick-lengte-tabel',
      '/methodiek#methode',
    ]) {
      expect(text, href).toContain(`](${href})`);
    }
  });

  it('builds the budget table from the catalog, in the budget steps of the stickwijzer', () => {
    const curated = getFieldProducts();
    const rows = budgetRows(curated);
    expect(rows.reduce((sum, row) => sum + Number(row[1]), 0)).toBe(curated.length);
    for (const row of rows) expect(Number(row[3]) + Number(row[4]) + Number(row[5])).toBe(Number(row[1]));
    const options = QUESTIONS.budget_band.input.kind === 'single' ? QUESTIONS.budget_band.input.options.map((o) => o.value) : [];
    expect(options.slice(0, 5)).toEqual(['lt_75', '75_125', '125_175', '175_250', 'gt_250']);
    expect(BUDGET_BANDS.map((b) => b.max)).toEqual([75, 125, 175, 250, Infinity]);
  });

  it('says price, carbon and brand do not make a stick better, links /sticks and the stickwijzer, and does not target comparing', () => {
    expect(text).toContain('](/sticks)');
    expect(text.match(/\]\(\/stickwijzer\)/g)!.length).toBeGreaterThanOrEqual(3);
    for (const word of ['hogere prijs', 'Meer carbon', 'bekend merk']) expect(text).toContain(word);
    for (const section of article.sections) expect(section.heading.toLowerCase()).not.toContain('vergelijk');
    expect(article.seoTitle!.toLowerCase()).not.toContain('vergelijk');
    expect(text).toContain('partnerlinks');
    expect(JSON.stringify(article)).not.toMatch(/onafhankelijk|objectief|\bbeste\b/i);
  });

  it('renders one H1', async () => {
    const html = renderToStaticMarkup(await ArticlePage({ params: Promise.resolve({ slug: article.slug }) }));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });
});

describe('/sticks as the comparison page for veldhockeysticks (2026-11-14)', () => {
  it('targets veldhockeysticks and comparing, not "kopen", within the length limits', () => {
    const metadata = sticksMetadata();
    expect(VELD.seoTitle.toLowerCase()).toContain('veldhockeysticks vergelijken');
    expect(VELD.seoTitle.toLowerCase()).not.toMatch(/kopen|kiezen/);
    expect(VELD.seoTitle.length).toBeLessThanOrEqual(60);
    expect(String(metadata.description).length).toBeLessThanOrEqual(155);
    expect(VELD.metaDescription.length).toBeLessThanOrEqual(155);
  });

  it('keeps the intro short, links the stickwijzer and the buying guide, and the catalog stays near the top', async () => {
    expect(plainText(VELD.intro).split(/\s+/).length).toBeLessThanOrEqual(70);
    expect(VELD.intro).toContain('](/stickwijzer)');
    expect(VELD.intro).toContain('](/kennis/hoe-kies-je-de-juiste-hockeystick)');
    const html = renderToStaticMarkup(await SticksPage({ searchParams: Promise.resolve({}) }));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    // The filters come right after the intro, before the first block of sticks.
    expect(html.indexOf('aria-label="Sticks filteren"')).toBeLessThan(html.indexOf('id="veld-levels-heading"'));
  });

  it('explains the shop prices: which shops, that they change, the 14 days and the partner links', () => {
    const prices = veldFaq(getFieldProducts(new Date(), { includeImported: true })).find((q) => q.question === VELD.faq.prices.question)!;
    for (const shop of ['bol.com', 'PassaHockey', 'Plutosport', 'HockeyCity', 'Daka']) expect(prices.answer).toContain(shop);
    expect(prices.answer).toContain('14 dagen');
    expect(prices.answer).toContain('partnerlinks');
    expect(prices.answer).toContain('richtprijs');
  });

  it('keeps sticks that no partner shop sells in the list (the claim in the price answer)', async () => {
    const noShop = getFieldProducts().filter(
      (p) => p.bolNotSold && !p.bolProductUrl && !p.passaSportsProductUrl && !p.plutosportProductUrl && !p.hockeyCityProductUrl && !p.dakaProductUrl,
    );
    expect(noShop.length).toBeGreaterThan(0);
    const html = renderToStaticMarkup(await SticksPage({ searchParams: Promise.resolve({}) }));
    for (const product of noShop) expect(html, product.slug).toContain(`/sticks/${product.slug}`);
  });
});
