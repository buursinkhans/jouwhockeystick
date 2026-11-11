import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { ROUTE_WEIGHTS } from '../advice-engine/scoring';
import { ADVICE_VERSION, RULE_SET_VERSION } from '../advice-engine/ruleSetVersion';
import { methodeJsonLd } from '../lib/methodeJsonLd';
import { getArticlesIncludingScheduled } from './index';
import { stickwijzerFaq } from './landingFaqs';
import { METHODE } from './methode';
import { METHODIEK, methodeVersionLine } from './methodiek';

// De Jouwhockeystick-methode (decision log 2026-11-11): the name, the sentence
// and every place that repeats it. These tests keep the text honest and keep
// it in step with the advice engine.

const words = (text: string) => text.trim().split(/\s+/).length;
const countName = (text: string) => text.split(METHODE.name).length - 1;

/** Every sentence of the method text, with a label for the failure message. */
const texts: Array<[string, string]> = [
  ['kernzin', METHODE.kernzin],
  ['s25', METHODE.s25],
  ['m50', METHODE.m50],
  ['l100', METHODE.l100],
  ['h1', METHODE.h1],
  ['metaTitle', METHODE.metaTitle],
  ['metaDescription', METHODE.metaDescription],
  ['howToName', METHODE.howToName],
  ['home.heading', METHODE.home.heading],
  ['home.body', METHODE.home.body],
  ['home.cta', METHODE.home.cta],
  ['stickwijzer', METHODE.stickwijzer],
  ['faq.question', METHODE.faq.question],
  ['partsHeading', METHODE.partsHeading],
  ['limitsHeading', METHODE.limitsHeading],
  ...METHODE.parts.flatMap((part): Array<[string, string]> => [
    [`${part.id}.lead`, part.lead],
    [`${part.id}.origin`, part.origin],
    ...part.counts.map((item, i): [string, string] => [`${part.id}.counts.${i}`, item]),
  ]),
  ...METHODE.limits.map((limit, i): [string, string] => [`limits.${i}`, limit]),
];

describe('the sentence', () => {
  it('has one official sentence of 25 to 30 words, and the other versions fit their length', () => {
    expect(words(METHODE.kernzin)).toBeGreaterThanOrEqual(25);
    expect(words(METHODE.kernzin)).toBeLessThanOrEqual(30);
    expect(words(METHODE.s25)).toBeGreaterThanOrEqual(22);
    expect(words(METHODE.s25)).toBeLessThanOrEqual(28);
    expect(words(METHODE.m50)).toBeGreaterThanOrEqual(45);
    expect(words(METHODE.m50)).toBeLessThanOrEqual(55);
    expect(words(METHODE.l100)).toBeGreaterThanOrEqual(90);
    expect(words(METHODE.l100)).toBeLessThanOrEqual(110);
  });

  it('keeps the title and description within what search results show', () => {
    expect(METHODE.metaTitle.length).toBeLessThanOrEqual(60);
    expect(METHODE.metaDescription.length).toBeLessThanOrEqual(158);
  });

  it('uses one spelling of the name', () => {
    expect(METHODE.name).toBe('Jouwhockeystick-methode');
    for (const [label, text] of texts) {
      expect(text, label).not.toMatch(
        /Jouwhockeystick methode|jouwhockeystickmethode|JouwHockeystick-methode|Jouwhockeystick-Methode/,
      );
    }
  });
});

describe('claims we do not make', () => {
  it('has none of the banned words', () => {
    for (const [label, text] of texts) {
      expect(text, label).not.toMatch(
        /bewezen|gecertificeerd|keurmerk|gegarandeerd|objectief|onafhankelijk|\bbeste\b|™/i,
      );
    }
  });

  it('only says "wetenschappelijk" in the sentence "niet wetenschappelijk getoetst"', () => {
    for (const [label, text] of texts) {
      const rest = text.replace(/niet wetenschappelijk getoetst/gi, '');
      expect(rest, label).not.toMatch(/wetenschappelijk/i);
    }
    expect(METHODE.l100).toMatch(/niet wetenschappelijk getoetst/);
    expect(METHODE.limits.join(' ')).toMatch(/niet wetenschappelijk getoetst/);
  });

  it('does not announce an outside review or test that does not exist', () => {
    for (const [label, text] of texts) {
      expect(text, label).not.toMatch(
        /beoordeeld door|gevalideerd|gebaseerd op onderzoek|getest door|wordt binnenkort|binnenkort getest|externe beoordeling volgt/i,
      );
    }
  });
});

describe('house style (docs/schrijfstijl.md)', () => {
  it('has no dashes in running text and no exclamation marks', () => {
    for (const [label, text] of texts) {
      expect(text, label).not.toMatch(/[—–!]/);
    }
  });

  it('has at most one "niet X, maar Y" per text', () => {
    for (const [label, text] of texts) {
      const contrasts = text.match(/\bniet\b[^.]*\bmaar\b|\bgeen\b[^.]*\bmaar\b/g) ?? [];
      expect(contrasts.length, label).toBeLessThanOrEqual(1);
    }
    const whole = texts.map(([, text]) => text).join(' ');
    expect((whole.match(/\bniet\b[^.]*\bmaar\b/g) ?? []).length).toBeLessThanOrEqual(1);
  });
});

describe('repetition without spam', () => {
  it('names the method at most three times per place that is not /methodiek', () => {
    expect(countName(METHODE.home.heading + ' ' + METHODE.home.body + ' ' + METHODE.home.cta)).toBeLessThanOrEqual(3);
    expect(countName(METHODE.stickwijzer)).toBe(1);
    const faq = stickwijzerFaq().find((item) => item.question === METHODE.faq.question);
    expect(faq, 'FAQ item on /stickwijzer').toBeDefined();
    expect(countName(faq!.answer)).toBeLessThanOrEqual(3);
  });

  it('keeps the name out of the H2 and H3 of the pages it does not belong to', () => {
    expect(METHODE.home.heading).not.toContain(METHODE.name);
    expect(METHODE.faq.question).not.toContain(METHODE.name);
  });

  it('is wired in: homepage band, stickwijzer sentence, llms.txt, IndexNow', () => {
    expect(readFileSync('src/components/home/HomePage.tsx', 'utf8')).toMatch(/<MethodBand \/>/);
    expect(readFileSync('src/app/stickwijzer/page.tsx', 'utf8')).toMatch(/METHODE\.stickwijzer/);
    expect(readFileSync('src/app/llms.txt/route.ts', 'utf8')).toMatch(/METHODE\.kernzin/);
    expect(readFileSync('src/seo/indexnow.ts', 'utf8')).toMatch(/'src\/content\/methode\.ts': '\/methodiek'/);
  });
});

describe('the text matches the advice engine', () => {
  it('weighs exactly the six parts the text describes', () => {
    // If the engine gains or loses a weight, this fails and the method text
    // (and the three parts on /methodiek) must be read again.
    for (const route of ['START', 'ONTWIKKEL', 'PRESTATIE'] as const) {
      expect(Object.keys(ROUTE_WEIGHTS[route]).sort()).toEqual(
        ['availability', 'bow', 'budget', 'experience', 'feel', 'goal'],
      );
    }
  });

  it('only calls position a refinement, never a reason on its own', () => {
    for (const [label, text] of texts) {
      if (/positie/i.test(text)) expect(text, label).toMatch(/verfijning/);
    }
  });

  it('puts the size last, as a hard condition', () => {
    const order = ['speler', 'stick', 'maat'];
    expect(METHODE.parts.map((part) => part.id)).toEqual(order);
    expect(METHODE.parts[2].lead).toMatch(/Als laatste/);
    expect(METHODE.parts[2].lead).toMatch(/dan adviseren we hem niet/);
  });

  it('says that shop fees do not count, as CLAUDE.md and the score do', () => {
    expect(METHODE.m50).toMatch(/Winkelvergoedingen tellen niet mee/);
    expect(METHODE.l100).toMatch(/Winkelvergoedingen tellen niet mee/);
  });
});

describe('structured data is the visible text', () => {
  const graph = methodeJsonLd()['@graph'];
  const term = graph.find((node) => node['@type'] === 'DefinedTerm');
  const howTo = graph.find((node) => node['@type'] === 'HowTo');

  it('describes the term with the official sentence, word for word', () => {
    expect(term).toMatchObject({ name: METHODE.name, description: METHODE.kernzin });
  });

  it('lists the three parts with the same words as the page', () => {
    const steps = (howTo as unknown as { step: Array<{ name: string; text: string }> }).step;
    expect(steps.map((step) => step.name)).toEqual(METHODE.parts.map((part) => part.title));
    expect(steps.map((step) => step.text)).toEqual(METHODE.parts.map((part) => part.lead));
  });

  it('uses the page title and description of the page', () => {
    expect(graph[0]).toMatchObject({
      name: METHODE.metaTitle,
      description: METHODE.metaDescription,
      dateModified: METHODIEK.updatedAt,
    });
  });
});

describe('version line', () => {
  it('is built from the versions the engine runs on', () => {
    const line = methodeVersionLine();
    expect(line).toContain(ADVICE_VERSION);
    expect(line).toContain(RULE_SET_VERSION);
    expect(line).toContain(METHODIEK.updatedAt);
    expect(METHODIEK.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('links', () => {
  it('points every part to articles that exist', () => {
    const slugs = new Set(getArticlesIncludingScheduled().map((article) => article.slug));
    for (const part of METHODE.parts) {
      expect(part.articles.length, part.id).toBeGreaterThan(0);
      for (const slug of part.articles) expect(slugs.has(slug), slug).toBe(true);
    }
  });

  it('links the FAQ answer to a page that exists, with an anchor that is on that page', () => {
    const [path = '', anchor = ''] = METHODE.faq.link.split('#');
    expect(existsSync(`src/app${path}/page.tsx`)).toBe(true);
    expect(readFileSync('src/app/methodiek/page.tsx', 'utf8')).toContain(`id="${anchor}"`);
  });

  it('gives each part an anchor on /methodiek', () => {
    const page = readFileSync('src/app/methodiek/page.tsx', 'utf8');
    expect(page).toMatch(/id=\{part\.id\}/);
    expect(new Set(METHODE.parts.map((part) => part.id)).size).toBe(METHODE.parts.length);
  });
});
