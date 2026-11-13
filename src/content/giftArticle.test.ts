import { describe, expect, it } from 'vitest';
import { GET as llmsTxt } from '@/app/llms.txt/route';
import sitemap from '@/app/sitemap';
import { RETAILERS } from '@/lib/retailers';
import { MAX_DESCRIPTION_LENGTH, absoluteUrl } from '@/lib/site';
import { hockeystickCadeau as article, GIFT_AGE_ROWS, giftPriceFacts } from './articles/hockeystick-cadeau';
import { hockeystickKinderenEnBeginners } from './articles/hockeystick-kinderen-en-beginners';
import { hockeystickLengteTabel } from './articles/hockeystick-lengte-tabel';
import { BLACK_FRIDAY } from './blackFriday';
import { AGE_TABLE_ROWS, CHILD_HEIGHT_SOURCE } from './childHeight';
import { getAllArticles } from './index';
import { KENNIS_THEMES } from './kennisThemes';

const PATH = '/kennis/hockeystick-cadeau';
const text = JSON.stringify([article.title, article.intro, article.sections, article.metaDescription]);
const sectionText = (heading: string) => JSON.stringify(article.sections.find((s) => s.heading === heading)?.body ?? []);

describe('Hockeystick als cadeau (decision log 2026-11-13)', () => {
  it('is registered on /kennis, in the sitemap and in llms.txt', async () => {
    expect(getAllArticles().map((a) => a.slug)).toContain('hockeystick-cadeau');
    expect(KENNIS_THEMES.find((t) => t.id === 'stick-kiezen')?.slugs).toContain('hockeystick-cadeau');
    expect(sitemap().map((entry) => entry.url)).toContain(absoluteUrl(PATH));
    expect(await llmsTxt().text()).toContain(`[${article.title}](${absoluteUrl(PATH)}): ${article.metaDescription}`);
  });

  it('answers in the first 80 words: length, field or indoor, how long the child plays, and the price from the catalog', () => {
    const facts = giftPriceFacts();
    expect(article.intro.split(/\s+/).length).toBeLessThanOrEqual(80);
    for (const part of ['lichaamslengte', 'veld', 'zaal', 'hoe lang het al hockeyt']) expect(article.intro).toContain(part);
    // "de meeste kindersticks in onze catalogus kosten minder dan €100"
    expect(facts.under100 * 2).toBeGreaterThan(facts.count);
    expect(article.intro).toContain(`de middelste prijs is €${Math.round(facts.median)}`);
  });

  it('reuses the age indication of the length table, with its warning and source, without copying the data', () => {
    // The same rows as the length table's age indication, up to 12 years.
    expect(GIFT_AGE_ROWS).toEqual(AGE_TABLE_ROWS.filter((row) => Number(row[0]!.split(' ')[0]) <= 12));
    const maat = sectionText('De maat, als het kind er niet bij is');
    expect(maat).toContain('Gebruik leeftijd alleen als eerste indicatie.');
    expect(maat).toContain('Gebruik altijd de lichaamslengte als uitgangspunt');
    expect(maat).toContain('](/kennis/hockeystick-lengte-tabel#leeftijd)');
    expect(maat).toMatch(/liever niet een maat groter om in te groeien/);
    expect(article.sources.map((s) => s.url)).toEqual(expect.arrayContaining([CHILD_HEIGHT_SOURCE.guidelineUrl, CHILD_HEIGHT_SOURCE.studyUrl]));
  });

  it('explains field or indoor with the kids indoor article, and does not link to /zaalsticks', () => {
    expect(sectionText('Veld of zaal?')).toContain('](/kennis/zaalstick-voor-kinderen)');
    expect(text).not.toContain('](/zaalsticks');
  });

  it('answers the left-handed question from the FIH rules', () => {
    expect(sectionText('Bestaat er een linkshandige hockeystick?')).toMatch(/vlakke kant links/);
    expect(article.sources.some((s) => /regel 4\.6/.test(s.label) && /regel 9\.5/.test(s.label))).toBe(true);
  });

  it('gives a checklist without naming any shop’s exchange or return terms', () => {
    const list = sectionText('Geef dit mee met het cadeau');
    for (const item of ['bonnetje', 'ruiltermijn', 'club of de trainer']) expect(list).toContain(item);
    const faq = sectionText('Kan ik een hockeystick ruilen als hij niet past?');
    for (const shop of Object.values(RETAILERS).map((r) => r.label)) {
      expect(list, shop).not.toContain(shop);
      expect(faq, shop).not.toContain(shop);
    }
    expect(`${list}${faq}`).not.toMatch(/\d+\s*dagen/);
    expect(list).toContain('partnerlinks');
    expect(list).toContain('de winkel is de verkoper');
  });

  it('sends the reader to the quick advice filled in for a child, and to the full stickwijzer', () => {
    expect(text).toContain('](/stickwijzer?snel&voor=kind)');
    expect(text).toContain('](/stickwijzer)');
    expect(text).toContain('](/kennis/hockeystick-kinderen-en-beginners)');
  });

  it('has three or four FAQ questions', () => {
    const headings = article.sections.map((s) => `${s.level}:${s.heading}`);
    const start = headings.indexOf('2:Veelgestelde vragen');
    const questions: string[] = [];
    for (const h of headings.slice(start + 1)) {
      if (!h.startsWith('3:')) break;
      questions.push(h);
    }
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions.length).toBeLessThanOrEqual(4);
  });

  it('makes no forbidden claim and follows the house style', () => {
    expect(text).not.toMatch(/\bbeste\b|korting|onafhankelijk|objectief|goedkoopst|gegarandeerd|bewezen/i);
    expect(text).not.toMatch(/[—–]/);
    expect(text).not.toContain('!');
    expect((text.match(/\bniet\b[^.]*\bmaar\b/g) ?? []).length).toBeLessThanOrEqual(1);
    expect(article.title.length).toBeLessThanOrEqual(60);
    expect(article.metaDescription.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH);
  });

  it('is linked from the length table, the kids and beginners article and the Black Friday page', () => {
    for (const source of [hockeystickLengteTabel, hockeystickKinderenEnBeginners]) {
      expect(JSON.stringify(source.sections), source.slug).toContain(`](${PATH})`);
    }
    expect(BLACK_FRIDAY.advice.items.map((item) => item.href)).toContain(PATH);
  });
});
