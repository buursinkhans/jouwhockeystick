import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LENGTH_GUIDE } from '@/advice-engine/sizeAdvice';
import { ArticleBody } from '@/components/article/ArticleBody';
import { hockeystickKinderenEnBeginners as kids } from './articles/hockeystick-kinderen-en-beginners';
import { hockeystickLengteTabel as article } from './articles/hockeystick-lengte-tabel';
import { zaalstickVoorKinderen as zaalKids } from './articles/zaalstick-voor-kinderen';
import {
  AGE_TABLE_ROWS,
  CHILD_HEIGHT_BY_AGE,
  CHILD_HEIGHT_CROSS_CHECK,
  CHILD_HEIGHT_SOURCE,
  ageIndication,
} from './childHeight';
import { stickwijzerFaq } from './landingFaqs';
import { articleSchema } from './types';

const section = article.sections.find((s) => s.id === 'leeftijd');
const bandOf = (cm: number) => LENGTH_GUIDE.find((b) => Math.round(cm) <= b.maxCm)!;
const nl = (n: number) => String(n).replace('.', ',');

describe('age indication (decision log 2026-11-11): the source data', () => {
  it('names its sources: the JGZ guideline and Schönbeck et al. 2013', () => {
    expect(CHILD_HEIGHT_SOURCE.guidelineUrl).toMatch(/^https:\/\/www\.jgzrichtlijnen\.nl\/.*Bijlage-1-formules-lengtegroei\.pdf$/);
    expect(CHILD_HEIGHT_SOURCE.studyLabel).toMatch(/Schönbeck/);
    expect(CHILD_HEIGHT_SOURCE.studyUrl).toBe('https://doi.org/10.1038/pr.2012.189');
    expect(article.sources.map((s) => s.url)).toEqual(
      expect.arrayContaining([CHILD_HEIGHT_SOURCE.guidelineUrl, CHILD_HEIGHT_SOURCE.studyUrl]),
    );
  });

  it('agrees with the values the same document prints elsewhere (worked examples, final height)', () => {
    const at = (age: number) => CHILD_HEIGHT_BY_AGE.find((r) => r.age === age)!;
    // The guideline's worked example uses "(105 - 119,9) / 5,1" for a boy of 6.0 years.
    expect(at(6).boys).toEqual(CHILD_HEIGHT_CROSS_CHECK.boysAt6);
    expect(CHILD_HEIGHT_CROSS_CHECK.girlsAt4).toEqual({ mean: 104.9, sd: 4.2 });
    // Tabel 2 and the 21.0 row: the final height 183,8 / 170,7 cm.
    expect(CHILD_HEIGHT_CROSS_CHECK.finalBoys.mean).toBe(183.8);
    expect(CHILD_HEIGHT_CROSS_CHECK.finalGirls.mean).toBe(170.7);
    expect(CHILD_HEIGHT_BY_AGE.map((r) => r.age)).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('is plausible: heights rise with age and stay below the final height, standard deviations are sensible', () => {
    for (const sex of ['girls', 'boys'] as const) {
      const means = CHILD_HEIGHT_BY_AGE.map((r) => r[sex].mean);
      expect(means).toEqual([...means].sort((a, b) => a - b));
      const final = sex === 'girls' ? CHILD_HEIGHT_CROSS_CHECK.finalGirls.mean : CHILD_HEIGHT_CROSS_CHECK.finalBoys.mean;
      expect(Math.max(...means)).toBeLessThan(final);
    }
    for (const row of CHILD_HEIGHT_BY_AGE) {
      expect(row.girls.sd).toBeGreaterThan(4);
      expect(row.boys.sd).toBeLessThan(9);
    }
  });
});

describe('age indication: sizes come from LENGTH_GUIDE', () => {
  it('gives at the average height exactly the sizes of the length table, for each sex', () => {
    for (const row of CHILD_HEIGHT_BY_AGE) {
      const girls = bandOf(row.girls.mean).sizes.map(nl).join(' of ');
      const boys = bandOf(row.boys.mean).sizes.map(nl).join(' of ');
      expect(ageIndication(row).size).toBe(girls === boys ? girls : `${girls} / ${boys}`);
    }
  });

  it('spans from the shortest size at mean minus one SD to the longest at mean plus one SD', () => {
    const eight = ageIndication(CHILD_HEIGHT_BY_AGE.find((r) => r.age === 8)!);
    expect(eight).toEqual({ age: 8, meanHeight: '131,3 / 132,5', size: '30 / 31', range: '29 t/m 32' });
    for (const row of CHILD_HEIGHT_BY_AGE) {
      const low = Math.min(row.girls.mean - row.girls.sd, row.boys.mean - row.boys.sd);
      const high = Math.max(row.girls.mean + row.girls.sd, row.boys.mean + row.boys.sd);
      expect(ageIndication(row).range).toBe(`${nl(bandOf(low).sizes[0])} t/m ${nl(bandOf(high).sizes.at(-1)!)}`);
    }
  });

  it('never gives a range that excludes the size at the average height', () => {
    for (const row of CHILD_HEIGHT_BY_AGE) {
      const [from, to] = ageIndication(row)
        .range.split(' t/m ')
        .map((s) => Number(s.replace(',', '.')));
      for (const sex of ['girls', 'boys'] as const) {
        const sizes = bandOf(row[sex].mean).sizes;
        expect(from).toBeLessThanOrEqual(sizes[0]);
        expect(to).toBeGreaterThanOrEqual(sizes.at(-1)!);
      }
    }
  });

  it('has the generated rows in the table of the article, one per age', () => {
    expect(AGE_TABLE_ROWS).toHaveLength(CHILD_HEIGHT_BY_AGE.length);
    const table = section?.body.find((b) => typeof b === 'object' && b.type === 'table');
    expect(table && typeof table === 'object' && 'rows' in table ? table.rows : null).toEqual(AGE_TABLE_ROWS);
  });
});

describe('age indication: the section on the length table page', () => {
  it('sits after the kids section and before the adults section, with its own anchor', () => {
    const headings = article.sections.map((s) => s.heading);
    const i = headings.indexOf('En op leeftijd? Een indicatie');
    expect(headings[i - 1]).toBe('Koop een kinderstick niet op de groei');
    expect(headings[i + 1]).toBe('Volwassenen: 36,5 inch of langer?');
    expect(section?.id).toBe('leeftijd');
    expect(section?.level).toBe(2);
  });

  it('opens with the warning that age is only an indication and body height leads', () => {
    const first = section?.body[0];
    expect(first && typeof first === 'object' && first.type === 'callout' ? first.text : '').toBe(
      'Gebruik leeftijd alleen als eerste indicatie. Twee kinderen van dezelfde leeftijd kunnen een andere stickmaat nodig hebben. Gebruik altijd de lichaamslengte als uitgangspunt, of doe de [stickwijzer](/stickwijzer).',
    );
    const text = JSON.stringify(section);
    expect(text).toMatch(/lichaamslengte/);
    expect(text).not.toMatch(/leeftijd bepaalt|op basis van leeftijd kies|past bij elk kind van/i);
  });

  it('names both sources and keeps external links out of the running text (sources go in the list)', () => {
    const text = JSON.stringify(section?.body);
    expect(text).toMatch(/JGZ-richtlijn Lengtegroei/);
    expect(text).toMatch(/Vijfde landelijke groeistudie/);
    expect(text).not.toMatch(/\]\(https?:/);
  });

  it('keeps the title, the intro and the main length table of the page', () => {
    expect(article.title).toBe('Hockeystick lengte tabel: welke maat stick past bij jouw lengte?');
    expect(article.intro.startsWith('Welke lengte stick heb je nodig?')).toBe(true);
    expect(article.sections[0]?.heading).toBe('De lengtetabel');
  });

  it('is valid for the article schema and renders an anchor, the callout and the table', () => {
    expect(articleSchema.safeParse(article).success).toBe(true);
    const html = renderToStaticMarkup(createElement(ArticleBody, { article }));
    expect(html).toContain('id="leeftijd"');
    expect(html).toContain('role="note"');
    expect(html).toContain('Op de verjaardag van');
    expect(html).toContain('131,3 / 132,5');
  });
});

describe('age indication: links to the section', () => {
  it('is linked from the beginners article, the indoor kids article and the stickwijzer FAQ, each keeping body height leading', () => {
    for (const a of [kids, zaalKids]) {
      expect(JSON.stringify(a.sections), a.slug).toContain('](/kennis/hockeystick-lengte-tabel#leeftijd)');
    }
    const faq = stickwijzerFaq().find((f) => f.question === 'Welke hockeystick past bij een kind van 12?');
    expect(faq?.answer).toContain('](/kennis/hockeystick-lengte-tabel#leeftijd)');
    expect(faq?.answer).toMatch(/lichaamslengte, niet naar de leeftijd/);
  });

  it('only links to an anchor that exists on the page', () => {
    const ids = article.sections.map((s) => s.id).filter(Boolean);
    expect(ids).toContain('leeftijd');
    const source = readFileSync('src/content/landingFaqs.ts', 'utf8');
    for (const [, id] of source.matchAll(/hockeystick-lengte-tabel#([a-z-]+)/g)) expect(ids).toContain(id);
  });
});
