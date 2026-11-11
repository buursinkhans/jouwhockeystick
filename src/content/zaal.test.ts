import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ZaalsticksPage, { metadata } from '@/app/zaalsticks/page';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
import { getIndoorProducts, isFeedImport } from '@/catalog';
import { productPath } from '@/catalog/paths';
import { ZAAL } from './zaal';

/** Claims the data does not support: prices are weekly, shipping is sometimes unknown (decision log 2026-10-29). */
const OVERCLAIMS = /actuele prijs|actuele winkelprijs|altijd inclusief verzending|goedkoopst|beste prijs|korting/i;

const words = (text: string) => text.split(/\s+/).filter(Boolean);

describe('/zaalsticks copy (SEO change of 2026-10-29)', () => {
  it('keeps the search title, H1 and the catalog anchor', () => {
    expect(ZAAL.seoTitle).toBe('Zaalhockeystick kiezen en kopen: zaalsticks vergeleken');
    expect(ZAAL.title).toBe('Zaalhockeystick kiezen: waar let je op in de zaal?');
    expect(JSON.stringify(metadata.title)).toContain(ZAAL.seoTitle);
  });

  it('has a meta description that fits and claims only what the data supports', () => {
    expect(ZAAL.metaDescription.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
    expect(ZAAL.metaDescription).toMatch(/zaalhockeystick/i);
    expect(ZAAL.metaDescription).toMatch(/kopen/);
    expect(ZAAL.metaDescription).toMatch(/wekelijks bijgewerkte/);
    expect(ZAAL.metaDescription).not.toMatch(OVERCLAIMS);
  });

  it('still answers the main question in the first 80 words of the intro', () => {
    const first80 = words(ZAAL.intro).slice(0, 80).join(' ');
    expect(first80).toMatch(/Een zaalhockeystick kies je/);
    expect(ZAAL.intro).toMatch(/alle zaalhockeysticks uit onze catalogus/);
  });

  it('words the buying question from the visitor, with the partner-link disclosure', () => {
    const buying = ZAAL.faq.items.find((item) => /kopen/.test(item.question));
    expect(buying?.question).toBe('Waar kun je een zaalhockeystick kopen?');
    expect(buying?.answer).toMatch(/Waar je wilt/);
    expect(buying?.answer).toMatch(/partnerlinks/);
    expect(buying?.answer).toMatch(/de winkel is de verkoper/);
    expect(buying?.answer).toContain('(/kennis/waar-koop-je-een-hockeystick)');
    expect(buying?.answer).not.toMatch(/\bbeste\b|voordelig|aanrader|bestel nu|nu kopen/i);
  });

  it('says how current the shop prices are and that shipping is not always known', () => {
    const answer = ZAAL.faq.price.answer(20, '€30', '€250');
    expect(answer).toMatch(/richtprijs van €30 tot €250/);
    expect(answer).toMatch(/inclusief verzendkosten voor zover die bekend zijn/);
    expect(answer).toMatch(/wekelijks/);
    for (const text of [answer, ZAAL.intro, ZAAL.stickwijzerNote, ...ZAAL.faq.items.map((i) => i.answer)]) {
      expect(text).not.toMatch(OVERCLAIMS);
    }
    expect(ZAAL.stickwijzerNote).not.toMatch(/winkel-listing op bol\.com/);
  });

  it('only promises what the stick cards show: the full list of shops is on the stick page', () => {
    // A card in the list shows the shop with the lowest price and "Vergelijk alle N winkels".
    for (const text of [ZAAL.intro, ZAAL.stickwijzerNote, ZAAL.faq.price.answer(1, '€1', '€2'), ...ZAAL.faq.items.map((i) => i.answer)]) {
      expect(text).not.toMatch(/bij elke stick zie je bij welke|per stick bij welke partnerwinkels/i);
    }
    // Since 2026-11-09 "Zo maken we deze pagina" says where the sources and shops are.
    expect(ZAAL.howWeWork.items.join(' ')).toMatch(/Op de pagina van elke stick/);
  });

  it('shows the change date of this edit, also as dateModified', () => {
    expect(ZAAL.updatedAt).toBe('2026-11-11');
    const html = renderToStaticMarkup(ZaalsticksPage());
    expect(html).toContain('"dateModified":"2026-11-11"');
    expect(html).toContain('<time dateTime="2026-11-11">2026-11-11</time>');
  });

  it('renders Article, breadcrumbs, the hand-checked sticks as ItemList and the visible FAQ as FAQPage (2026-11-09), with the same anchors', () => {
    const html = renderToStaticMarkup(ZaalsticksPage());
    const types = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
      (m) => (JSON.parse(m[1] ?? '{}') as { '@type'?: string })['@type'],
    );
    expect([...types].sort()).toEqual(['Article', 'BreadcrumbList', 'FAQPage', 'ItemList']);
    expect(html).toContain('id="alle-zaalsticks"');
    expect(html).toContain('id="zaal-selector-heading"');
    expect(html).toContain('Alle zaalhockeysticks in onze catalogus');
    expect(html).toContain('Waar kun je een zaalhockeystick kopen?');
  });
});

describe('/zaalsticks without JavaScript (redesign 2026-11-09)', () => {
  const html = renderToStaticMarkup(ZaalsticksPage());
  const all = getIndoorProducts(new Date(), { includeImported: true });

  it('has every hand-checked stick as a crawlable link, and no shop-feed stick in the first load', () => {
    for (const product of all.filter((p) => !isFeedImport(p))) {
      expect(html, product.slug).toContain(`href="${productPath(product)}"`);
    }
    for (const product of all.filter(isFeedImport).slice(0, 20)) {
      expect(html, product.slug).not.toContain(`href="${productPath(product)}"`);
    }
  });

  it('shows the three questions, the advice per player and how the page is made', () => {
    for (const text of [ZAAL.finder.playerLabel, ZAAL.finder.budgetLabel, ZAAL.whoFits.heading, ZAAL.howWeWork.heading]) {
      expect(html).toContain(text);
    }
    for (const item of ZAAL.whoFits.items) expect(html).toContain(item.title);
    expect(html).toContain(`${all.length} zaalsticks`);
  });

  it('keeps the advice honest: no best stick, no overclaims, no em dash in running text', () => {
    const texts = [ZAAL.finder.intro, ZAAL.finder.sortNote, ZAAL.finder.budgetNote, ...ZAAL.whoFits.items.map((i) => i.body), ...ZAAL.howWeWork.items];
    for (const text of texts) {
      expect(text).not.toMatch(OVERCLAIMS);
      // "Er is geen beste zaalstick voor iedereen" is allowed; a claim that one is best is not.
      expect(text).not.toMatch(/(?<!geen )beste zaalstick|aanrader|!/i);
      expect(text).not.toMatch(/ [–—] /);
    }
  });
});

describe('/zaalsticks SEO and conversion sprint (2026-11-11)', () => {
  const html = renderToStaticMarkup(ZaalsticksPage());
  const checked = getIndoorProducts(new Date(), { includeImported: true }).filter((p) => !isFeedImport(p));

  it('compares every hand-checked stick in a table with a heading, caption and column headers', () => {
    expect(html).toContain(`<h2 id="zaal-vergelijk-heading"`);
    expect(html).toContain(ZAAL.compare.heading);
    expect(html).toContain('<caption');
    for (const column of ['Stick', 'Lengtes', 'Carbon', 'Bow-profiel', 'Richtprijs']) expect(html).toContain(`>${column}</th>`);
    const table = html.slice(html.indexOf('zaal-vergelijk-heading'), html.indexOf('</table>'));
    for (const product of checked) expect(table, product.slug).toContain(`href="${productPath(product)}"`);
  });

  it('marks a missing carbon percentage or bow profile as "niet vermeld" instead of filling it in', () => {
    const missing = checked.filter((p) => !p.carbonPercentage || !p.bowProfile);
    if (missing.length > 0) expect(html).toContain(`>${ZAAL.compare.unknown}</td>`);
    expect(ZAAL.compare.note).toMatch(/Geen live winkelprijzen/);
    expect(ZAAL.compare.note).not.toMatch(OVERCLAIMS);
  });

  it('keeps the protected search elements: title, H1, intro and anchors', () => {
    expect(ZAAL.seoTitle).toBe('Zaalhockeystick kiezen en kopen: zaalsticks vergeleken');
    expect(ZAAL.title).toBe('Zaalhockeystick kiezen: waar let je op in de zaal?');
    expect(ZAAL.intro.startsWith('Een zaalhockeystick kies je net als een veldstick')).toBe(true);
    expect(html).toContain('id="zaal-selector-heading"');
    expect(html).toContain('id="alle-zaalsticks"');
    expect((html.match(/<h1/g) ?? []).length).toBe(1);
  });

  it('answers the child, beginner and carbon questions in the visible FAQ and in its FAQPage markup', () => {
    for (const question of ['Welke zaalhockeystick past bij een kind of beginner?', 'Hoeveel carbon heeft een zaalstick nodig?']) {
      expect(ZAAL.faq.items.map((i) => i.question)).toContain(question);
      expect(html).toContain(question);
    }
    const faqJson = html.match(/<script type="application\/ld\+json">([^<]*"FAQPage"[^<]*)<\/script>/)?.[1] ?? '';
    expect(faqJson).toContain('Hoeveel carbon heeft een zaalstick nodig?');
  });

  it('links to the stickwijzer for a field stick, without claiming it advises indoor sticks', () => {
    expect(ZAAL.stickwijzerNote).toMatch(/\]\(\/stickwijzer\)/);
    expect(ZAAL.stickwijzerNote).toMatch(/alleen advies voor veldsticks/);
    expect(html).toContain('href="/stickwijzer"');
  });

  it('keeps the new copy honest: no best stick, no overclaims, no exclamation mark', () => {
    for (const text of [ZAAL.compare.intro, ZAAL.compare.note, ZAAL.metaDescription, ...ZAAL.faq.items.map((i) => i.answer)]) {
      expect(text).not.toMatch(OVERCLAIMS);
      expect(text).not.toMatch(/(?<!geen )beste zaalstick|aanrader|!/i);
      expect(text).not.toMatch(/ [–—] /);
    }
  });
});
