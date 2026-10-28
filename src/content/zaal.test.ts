import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ZaalsticksPage, { metadata } from '@/app/zaalsticks/page';
import { MAX_DESCRIPTION_LENGTH } from '@/lib/site';
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
    expect(ZAAL.stickwijzerNote).toMatch(/Op de pagina van elke stick/);
  });

  it('shows the change date of this edit, also as dateModified', () => {
    expect(ZAAL.updatedAt).toBe('2026-10-29');
    const html = renderToStaticMarkup(ZaalsticksPage());
    expect(html).toContain('"dateModified":"2026-10-29"');
    expect(html).toContain('<time dateTime="2026-10-29">2026-10-29</time>');
  });

  it('renders with the same structured data (Article and breadcrumbs, no FAQPage) and the same anchor', () => {
    const html = renderToStaticMarkup(ZaalsticksPage());
    const types = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
      (m) => (JSON.parse(m[1] ?? '{}') as { '@type'?: string })['@type'],
    );
    expect(types).toEqual(['Article', 'BreadcrumbList']);
    expect(html).not.toContain('FAQPage');
    expect(html).toContain('id="alle-zaalsticks"');
    expect(html).toContain('Alle zaalhockeysticks in onze catalogus');
    expect(html).toContain('Waar kun je een zaalhockeystick kopen?');
  });
});
