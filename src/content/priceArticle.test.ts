import { describe, expect, it } from 'vitest';
import { DIRECT_MIN_CARBON } from '@/advice-engine/carbon';
import { GET as llmsTxt } from '@/app/llms.txt/route';
import sitemap from '@/app/sitemap';
import { getFieldProducts } from '@/catalog';
import { isJuniorStick } from '@/catalog/similar';
import { MAX_DESCRIPTION_LENGTH, absoluteUrl } from '@/lib/site';
import { hockeystickKinderenEnBeginners } from './articles/hockeystick-kinderen-en-beginners';
import { meerCarbonHockeystickBeter } from './articles/meer-carbon-hockeystick-beter';
import { waarKoopJeEenHockeystick } from './articles/waar-koop-je-een-hockeystick';
import {
  PRICE_CLASSES,
  inClass,
  median,
  priceFacts,
  priceTableRows,
  watKostEenHockeystick as article,
} from './articles/wat-kost-een-hockeystick';
import { getAllArticles } from './index';
import { KENNIS_THEMES } from './kennisThemes';

const PATH = '/kennis/wat-kost-een-hockeystick';
const text = JSON.stringify([article.title, article.seoTitle, article.intro, article.sections, article.metaDescription]);
const sticks = getFieldProducts();
const carbonMedian = (min: number, max?: number) =>
  median(
    sticks
      .filter((p) => p.priceIndicativeEur.value >= min && (max === undefined || p.priceIndicativeEur.value < max))
      .flatMap((p) => (p.carbonPercentage ? [p.carbonPercentage.value] : [])),
  );

describe('Wat kost een hockeystick? (decision log 2026-11-13)', () => {
  it('is registered on /kennis under "Kopen", in the sitemap and in llms.txt', async () => {
    expect(getAllArticles().map((a) => a.slug)).toContain('wat-kost-een-hockeystick');
    expect(KENNIS_THEMES.find((t) => t.id === 'kopen')?.slugs).toContain('wat-kost-een-hockeystick');
    expect(sitemap().map((entry) => entry.url)).toContain(absoluteUrl(PATH));
    const llms = await llmsTxt().text();
    expect(llms).toContain(`[${article.title}](${absoluteUrl(PATH)}): ${article.metaDescription}`);
  });

  it('answers the price question in the first 80 words, with euro amounts from the catalog', () => {
    const facts = priceFacts();
    expect(article.intro.split(/\s+/).length).toBeLessThanOrEqual(80);
    expect(article.intro).toMatch(/^Een veldhockeystick kost in onze catalogus €\d+ tot €\d+\./);
    expect(article.intro).toContain(`€${Math.round(facts.min)} tot €${Math.round(facts.max)}`);
    expect(article.intro).not.toContain('onbekend');
  });

  it('has a table with one row per price class that covers every field stick in the catalog', () => {
    const rows = priceTableRows();
    expect(rows).toHaveLength(PRICE_CLASSES.length);
    const counted = PRICE_CLASSES.reduce((sum, c) => sum + sticks.filter((p) => inClass(p, c)).length, 0);
    expect(counted).toBe(sticks.length);
    const table = article.sections[0]?.body.find((b) => typeof b === 'object' && b.type === 'table');
    expect(table && typeof table === 'object' && 'columns' in table ? table.columns : []).toEqual([
      'Prijsklasse',
      'Voor wie (aantal sticks)',
      'Carbon (middelste waarde)',
      'Bow',
      'Waar je op let',
    ]);
    // A missing value is never estimated: the carbon cell counts only sticks that name it.
    for (const row of rows) expect(row[2]).toMatch(/^(rond \d+%.*; bij \d+ van \d+ vermeld|niet vermeld)$/);
  });

  it('only says in fixed text what the catalog shows', () => {
    const facts = priceFacts();
    // "Voor een kind of beginner ben je meestal onder de €100 klaar."
    expect(facts.beginnerUnder100 * 2).toBeGreaterThan(facts.beginnerCount);
    expect(facts.juniorMedian!).toBeLessThan(100);
    // "Een duurdere stick heeft meestal meer carbon", and the top class is "stijf en direct".
    const medians = PRICE_CLASSES.map((c) => carbonMedian(c.min, c.max));
    expect(medians.every((m) => m !== null)).toBe(true);
    for (let i = 1; i < medians.length; i += 1) expect(medians[i]!).toBeGreaterThanOrEqual(medians[i - 1]!);
    expect(medians.at(-1)!).toBeGreaterThanOrEqual(DIRECT_MIN_CARBON);
    // "Meer carbon en vaker een low bow" from €100: low bow is more common there than under €100.
    const lowBowShare = (list: typeof sticks) => list.filter((p) => p.bowProfile?.value === 'lowbow').length / Math.max(1, list.length);
    const under100 = sticks.filter((p) => p.priceIndicativeEur.value < 100);
    const from100to200 = sticks.filter((p) => p.priceIndicativeEur.value >= 100 && p.priceIndicativeEur.value < 200);
    expect(lowBowShare(from100to200)).toBeGreaterThan(lowBowShare(under100));
    expect(sticks.filter(isJuniorStick).length).toBe(facts.juniorCount);
  });

  it('names its date, the partner links and the seller, and keeps sticks bol.com does not sell', () => {
    expect(text).toMatch(/gecontroleerd tussen \d+ \w+ 20\d\d en \d+ \w+ 20\d\d/);
    expect(text).toContain('partnerlinks');
    expect(text).toContain('de winkel is de verkoper');
    expect(text).toMatch(/Niet elke stick is bij bol\.com te koop \(\d+ van de \d+ niet\); die staan gewoon in de tabel en in de stickwijzer/);
  });

  it('makes no forbidden claim and follows the house style', () => {
    expect(text).not.toMatch(/\bbeste\b|korting|onafhankelijk|objectief|goedkoopst|scherpste prijs|laagste prijs|gegarandeerd|bewezen/i);
    expect(text).not.toMatch(/[—–]/);
    expect(text.replace(/!==|!\w/g, '')).not.toContain('!');
    expect((text.match(/\bniet\b[^.]*\bmaar\b/g) ?? []).length).toBeLessThanOrEqual(1);
  });

  it('links to the carbon, kids and length articles, the quick advice and the full stickwijzer', () => {
    for (const href of [
      '/kennis/meer-carbon-hockeystick-beter',
      '/kennis/hockeystick-kinderen-en-beginners',
      '/kennis/hockeystick-lengte-tabel',
      '/stickwijzer?snel',
      '/stickwijzer',
    ]) {
      expect(text).toContain(`](${href})`);
    }
  });

  it('has three or four questions in the FAQ', () => {
    const headings = article.sections.map((s) => `${s.level}:${s.heading}`);
    const start = headings.indexOf('2:Veelgestelde vragen');
    expect(start).toBeGreaterThan(-1);
    const questions = [];
    for (const h of headings.slice(start + 1)) {
      if (!h.startsWith('3:')) break;
      questions.push(h);
    }
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions.length).toBeLessThanOrEqual(4);
    expect(questions).toContain('3:Is een goedkope hockeystick slecht?');
  });

  it('fits the search title and the meta description', () => {
    expect(article.seoTitle!.length).toBeLessThanOrEqual(60);
    expect(article.metaDescription.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });

  it('is linked from three existing articles', () => {
    for (const source of [hockeystickKinderenEnBeginners, meerCarbonHockeystickBeter, waarKoopJeEenHockeystick]) {
      expect(JSON.stringify(source.sections), source.slug).toContain(`](${PATH})`);
    }
  });
});
