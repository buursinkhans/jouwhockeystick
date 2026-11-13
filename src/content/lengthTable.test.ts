import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LENGTH_GUIDE, alsoFitsInch } from '@/advice-engine/sizeAdvice';
import { getAdvice } from '@/advice-engine/engine';
import { buildDevelopAnswers } from '@/advice-engine/testFixtures';
import { getAllProducts, getProductBySlug } from '@/catalog';
import { ProductDetail } from '@/components/catalog/ProductDetail';
import { RecommendationCard } from '@/components/stickwijzer/RecommendationCard';
import { LENGTH_TABLE_PATH } from '@/lib/site';
import { LENGTH_ROWS, hockeystickLengteTabel as article } from './articles/hockeystick-lengte-tabel';
import { hockeystickKinderenEnBeginners } from './articles/hockeystick-kinderen-en-beginners';
import { QUESTIONS } from './stickwijzer/questions';

const links = (html: string) => html.split(`href="${LENGTH_TABLE_PATH}"`).length - 1;

describe('length table improvements (decision log 2026-10-29)', () => {
  it('measures height without shoes in the stickwijzer, its measuring help and the article', () => {
    expect(QUESTIONS.height_cm.question).toBe('Hoe lang is de speler, zonder schoenen?');
    expect(QUESTIONS.height_uncertain.helpText).toBe(
      'Meten: laat de speler zonder schoenen rechtop tegen een muur staan en meet van de vloer tot de kruin.',
    );
    // Every question that mentions shoes says "zonder", whatever kind of shoe.
    for (const question of Object.values(QUESTIONS)) {
      const text = `${question.question} ${question.helpText ?? ''}`;
      if (/schoen/i.test(text)) expect(text, question.id).toMatch(/zonder schoenen/);
    }
    expect(JSON.stringify(article.sections)).toMatch(/zonder schoenen/);
  });

  it('has no instruction to measure with shoes on anywhere in the site code or the leading spec', () => {
    // "met schoenen", "met hockeyschoenen aan", "schoenen aan"… (the 2026-10-29 fix missed "met hockeyschoenen" at first).
    const withShoes = /\bmet\s+(?:\w+)?schoenen\b|\bschoenen\s+aan\b/i;
    const files = [
      ...readdirSync('src', { recursive: true, encoding: 'utf8' })
        .filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f))
        .map((f) => join('src', f)),
      'docs/spec/keuzehulp-instructie-v1.1.md',
    ];
    expect(files.length).toBeGreaterThan(100);
    const offenders = files.filter((file) => withShoes.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
    // The pattern itself does catch the old wordings.
    expect(withShoes.test('Hoe lang is de speler met schoenen aan?')).toBe(true);
    expect(withShoes.test('laat de speler met hockeyschoenen aan rechtop staan')).toBe(true);
    expect(withShoes.test('Hoe lang is de speler, zonder schoenen?')).toBe(false);
  });

  it('states the measuring rule in the leading spec', () => {
    const spec = readFileSync('docs/spec/keuzehulp-instructie-v1.1.md', 'utf8');
    expect(spec).toContain('| `height_cm` | Hoe lang is de speler, zonder schoenen? |');
    expect(spec).toContain('3. Lichaamslengte zonder schoenen');
  });

  it('keeps the length data the stickwijzer uses', () => {
    expect(LENGTH_GUIDE.map((b) => [b.minCm, b.maxCm, [...b.sizes]])).toEqual([
      [95, 107, [22, 24]],
      [108, 115, [24, 26]],
      [116, 122, [27, 28]],
      [123, 127, [29]],
      [128, 132, [30]],
      [133, 137, [31]],
      [138, 142, [32]],
      [143, 147, [33]],
      [148, 154, [34]],
      [155, 162, [35]],
      [163, 184, [36.5]],
      [185, 192, [37.5]],
      [193, 210, [38.5]],
    ]);
  });

  it('shows every size and alternative in three columns, with the advised length in cm', () => {
    const table = article.sections.flatMap((s) => s.body).find((b) => typeof b === 'object' && b.type === 'table');
    expect(table && typeof table === 'object' && table.type === 'table' && table.columns).toEqual([
      'Lichaamslengte',
      'Stick (inch)',
      'Kan ook (inch)',
    ]);
    expect(LENGTH_ROWS).toHaveLength(LENGTH_GUIDE.length);
    LENGTH_GUIDE.forEach((band, i) => {
      const [height, stick, also] = LENGTH_ROWS[i]!;
      expect(height).toContain(`${band.minCm}`);
      expect(stick).toEqual({
        text: band.sizes.map((s) => String(s).replace('.', ',')).join(' of '),
        note: `ca. ${band.sizes.map((s) => Math.round(s * 2.54)).join(' / ')} cm`,
      });
      const alternatives = alsoFitsInch(band).map((s) => String(s).replace('.', ','));
      expect(also).toBe(alternatives.length ? alternatives.join(' of ') : '–');
    });
    expect(LENGTH_ROWS[10]).toEqual(['163–184 cm', { text: '36,5', note: 'ca. 93 cm' }, '35 of 37,5']);
    expect(article.sections[0]?.body).toContain('1 inch = 2,54 cm.');
  });

  it('adds the section on length versus age; the age indication lives only in its own sourced section (decision log 2026-11-11)', () => {
    const section = article.sections.find((s) => s.heading === 'Lichaamslengte, niet leeftijd');
    expect(section?.body).toEqual([
      'De juiste sticklengte bepaal je op basis van lichaamslengte, niet op leeftijd. Twee kinderen van dezelfde leeftijd kunnen behoorlijk in lengte verschillen. Meet daarom de lichaamslengte zonder schoenen en gebruik de tabel om de passende stickmaat te vinden.',
    ]);
    // Age appears only in the sourced section "En op leeftijd? Een indicatie" (childHeight.test.ts), nowhere else on the page.
    const elsewhere = { ...article, sources: [], sections: article.sections.filter((s) => s.id !== 'leeftijd') };
    expect(JSON.stringify(elsewhere)).not.toMatch(/\bjaar\b.*inch|leeftijdstabel/i);
  });

  it('keeps the SEO fields of the article', () => {
    expect(article.slug).toBe('hockeystick-lengte-tabel');
    expect(article.title).toBe('Hockeystick lengte tabel: welke maat stick past bij jouw lengte?');
    expect(article.seoTitle).toBeUndefined();
    expect(article.metaDescription).toBe(
      'Hockeystick lengte tabel: zie per lichaamslengte welke sticklengte in inch past, voor kinderen en volwassenen. Plus tips bij twijfel tussen twee maten.',
    );
  });

  it('links a stick page to the length table once, at the available lengths', () => {
    const product = getProductBySlug('grays-db8-composite')!;
    const html = renderToStaticMarkup(createElement(ProductDetail, { product }));
    expect(links(html)).toBe(1);
    expect(html).toMatch(/Beschikbare lengtes[\s\S]*Welke lengte past bij jou\? Bekijk de/);
  });

  it('links the size on an advice card with "Waarom deze maat?", and not while filling in the stickwijzer', () => {
    const advice = getAdvice(buildDevelopAnswers(), getAllProducts(new Date(), { includeImported: true }));
    const item = advice.results[0]!;
    const html = renderToStaticMarkup(createElement(RecommendationCard, { item, route: advice.route }));
    expect(links(html)).toBe(1);
    expect(html).toContain('Waarom deze maat?');
    for (const file of ['src/components/stickwijzer/QuizForm.tsx', 'src/content/stickwijzer/questions.ts']) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('hockeystick-lengte-tabel');
    }
  });
});

describe('size sprint (2026-11-11): from a size to the sticks, ranking signals kept', () => {
  const kids = hockeystickKinderenEnBeginners;

  it('keeps the title, intro, table and every heading of the length table article', () => {
    expect(article.title).toBe('Hockeystick lengte tabel: welke maat stick past bij jouw lengte?');
    expect(article.intro.startsWith('Welke lengte stick heb je nodig?')).toBe(true);
    expect(article.sections.map((s) => s.heading)).toEqual([
      'De lengtetabel',
      'Zo gebruik je de tabel',
      'Lichaamslengte, niet leeftijd',
      'Twijfel tussen twee maten',
      'Koop een kinderstick niet op de groei',
      'En op leeftijd? Een indicatie',
      'Volwassenen: 36,5 inch of langer?',
      'Wat zeggen de maattabellen van merken?',
      'Waarom verschillen de tabellen?',
      'Tussen twee maten: 36,5 of 37,5 inch?',
      'Geldt dezelfde lengte in de zaal?',
      'Veelgestelde vragen',
      'Ik ben 175 cm, welke sticklengte?',
      'Liever sticks in jouw maat zien?',
    ]);
    expect(LENGTH_ROWS).toHaveLength(LENGTH_GUIDE.length);
  });

  it('sends the length table reader to the sticks in a size that exists, and still to the stickwijzer', () => {
    const text = JSON.stringify(article.sections);
    expect(text).toContain('](/sticks?lengte=36.5)');
    expect(text).toContain('](/stickwijzer)');
    const size = 36.5;
    expect(LENGTH_GUIDE.some((band) => band.sizes.includes(size))).toBe(true);
    expect(getAllProducts().some((p) => p.lengthsInches.value.includes(size))).toBe(true);
  });

  it('asks the parents question in the heading and links the kids article to the filtered list', () => {
    expect(kids.sections.map((s) => s.heading)).toContain('Welke maat hockeystick heeft je kind nodig?');
    expect(JSON.stringify(kids.sections)).toContain('](/sticks)');
    expect(JSON.stringify(kids.sections)).toContain('](/kennis/hockeystick-lengte-tabel)');
  });
});
