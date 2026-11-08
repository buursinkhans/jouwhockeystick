import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import SharedShoeAdvicePage, { metadata as sharedMetadata } from '@/app/hockeyschoenen/wijzer/advies/page';
import { metadata as wizardMetadata } from '@/app/hockeyschoenen/wijzer/page';
import sitemap from '@/app/sitemap';
import { ShoeAdviceView } from '@/components/schoenenwijzer/ShoeAdviceView';
import { SHOE_QUESTIONS, visibleQuestions } from '@/content/schoenenwijzer/questions';
import { PRIVACY } from '@/content/privacy';
import { POSTHOG_INIT_OPTIONS, withoutSharedAnswers } from '@/lib/analytics/posthog';
import { readShare, shareHref } from '@/lib/shareAdvice';
import { SITE_URL } from '@/lib/site';
import { shoeAnswersSchema, type ShoeAnswers } from './answers';
import { shoeAdviceCatalog } from './catalog';
import { getShoeAdvice } from './engine';
import { PAIN_NOTICE } from './fitNotes';
import { SHOE_SHARE_PATH, toServerAnswers } from './share';
import { fieldAnswers } from './testFixtures';

/** The schoenenwijzer around the rules: questions, privacy of question 7, sharing and the outcome (decision log 2026-11-01). */
const FORBIDDEN = /beste (hockey)?schoen|voorkomt (enkel)?blessures|gegarandeerd|perfecte pasvorm|\d+\s?% match|gripscore|diagnose:|geneest|corrigeert/i;

const render = (answers: ShoeAnswers, fitParticulars: ('inlegzool-brace' | 'pijn-blessure' | 'blaren-schuiven' | 'geen')[] = []) =>
  renderToStaticMarkup(
    createElement(ShoeAdviceView, { advice: getShoeAdvice(answers, shoeAdviceCatalog(), new Date('2026-11-01')), answers, fitParticulars, shareHref: null }),
  );

describe('schoenenwijzer questions', () => {
  it('has the eight main questions of the keuzemodel plus the size', () => {
    expect([...new Set(SHOE_QUESTIONS.map((q) => q.number))]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(SHOE_QUESTIONS.find((q) => q.id === 'size')?.number).toBe(9);
    const q6 = SHOE_QUESTIONS.find((q) => q.id === 'movements')!;
    expect(q6.max).toBe(2);
    expect(SHOE_QUESTIONS.find((q) => q.id === 'position')?.helpText).toMatch(/verandert de selectie niet/);
  });

  it('asks about the surface only for field hockey, and stops after "keeper"', () => {
    expect(visibleQuestions({ purpose: 'zaal' }).map((q) => q.id)).not.toContain('surface');
    expect(visibleQuestions({ purpose: 'beide' }).map((q) => q.id)).toContain('surface');
    expect(visibleQuestions({ purpose: 'veld', player: 'keeper' }).map((q) => q.id)).toEqual(['purpose', 'player']);
  });
});

describe('question 7 never leaves the browser', () => {
  const state = { ...fieldAnswers(), fitParticulars: ['pijn-blessure' as const, 'inlegzool-brace' as const] };

  it('is left out of the answers for the server and of the share link', () => {
    const answers = toServerAnswers(state);
    expect(answers).not.toHaveProperty('fitParticulars');
    expect(shoeAnswersSchema.safeParse(answers).success).toBe(true);
    const shared = readShare(Object.fromEntries(new URL(shareHref(answers, [], SHOE_SHARE_PATH), SITE_URL).searchParams));
    expect(JSON.stringify(shared)).not.toMatch(/pijn|blessure|inlegzool|fitParticulars/);
    // And the server refuses it anyway.
    expect(shoeAnswersSchema.safeParse({ ...answers, fitParticulars: ['pijn-blessure'] }).success).toBe(false);
  });

  it('drops the answers to questions that are not shown', () => {
    expect(toServerAnswers({ ...state, purpose: 'zaal', surface: 'gemengd' })).not.toHaveProperty('surface');
  });

  it('sends no answer to analytics: no answer fields in events, no autocapture in the questions', () => {
    const quiz = readFileSync('src/components/schoenenwijzer/ShoeQuiz.tsx', 'utf8');
    expect(quiz).toContain('ph-no-capture');
    for (const call of quiz.match(/trackEvent\(\{[\s\S]*?\}\)/g) ?? []) {
      expect(call).not.toMatch(/answerKey|questionId|fitParticulars|state\b|answers/);
    }
  });

  it('keeps the answers of a shared shoe advice out of PostHog', () => {
    expect(POSTHOG_INIT_OPTIONS.before_send).toBe(withoutSharedAnswers);
    const url = `${SITE_URL}${shareHref(fieldAnswers(), ['brabo-elite'], SHOE_SHARE_PATH)}`;
    const event = withoutSharedAnswers({ properties: { $current_url: url, $referrer: url, $pathname: SHOE_SHARE_PATH, other: 1 } });
    expect(event?.properties).toEqual({
      $current_url: `${SITE_URL}${SHOE_SHARE_PATH}`,
      $referrer: `${SITE_URL}${SHOE_SHARE_PATH}`,
      $pathname: SHOE_SHARE_PATH,
      other: 1,
    });
    // Other pages keep their query.
    expect(withoutSharedAnswers({ properties: { $current_url: `${SITE_URL}/hockeyschoenen?type=zaal` } })?.properties.$current_url).toContain('?type=zaal');
  });

  it('shows a fixed referral for pain or an injury, without changing the advice', () => {
    const answers = shoeAnswersSchema.parse(fieldAnswers());
    const withPain = render(answers, ['pijn-blessure']);
    const without = render(answers);
    expect(withPain).toContain(PAIN_NOTICE);
    expect(without).not.toContain(PAIN_NOTICE);
    const models = (html: string) => [...html.matchAll(/href="\/hockeyschoenen\/([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(models(withPain)).toEqual(models(without));
  });
});

describe('the outcome page', () => {
  it('follows the fixed structure, with reasons, checks and the basis, and no forbidden claim', () => {
    for (const answers of [
      fieldAnswers(),
      fieldAnswers({ surface: 'gemengd', fitIssues: ['krap-voorvoet', 'ruim-hiel'], movements: ['zijwaarts'], preferences: ['stevig'] }),
      fieldAnswers({ player: 'kind', size: '35', budget: 'tot-50' }),
      fieldAnswers({ purpose: 'zaal', surface: undefined, player: 'volwassene' }),
      fieldAnswers({ purpose: 'beide' }),
    ]) {
      const html = render(shoeAnswersSchema.parse(answers));
      expect(html).toContain('Jouw profiel');
      expect(html).not.toMatch(FORBIDDEN);
      if (html.includes('Waarom dit model')) {
        for (const heading of ['Wat je nog moet controleren', 'Basis en zekerheid van het advies', 'Bekijk prijs bij']) expect(html).toContain(heading);
      } else {
        expect(html).toMatch(/We versoepelen geen voorwaarde|Een verantwoord advies is daarom niet mogelijk/);
      }
    }
  });

  it('gives a keeper the boundary text and no shoes', () => {
    const html = render(shoeAnswersSchema.parse({ purpose: 'veld', player: 'keeper' }));
    expect(html).toContain('Schoenen voor keepers');
    expect(html).not.toContain('Bekijk prijs bij');
  });

  it('opens a shared advice without question 7 and keeps it out of Google', async () => {
    expect(sharedMetadata.robots).toMatchObject({ index: false });
    const href = shareHref(fieldAnswers(), [], SHOE_SHARE_PATH);
    const a = new URL(href, SITE_URL).searchParams.get('a')!;
    const html = renderToStaticMarkup(await SharedShoeAdvicePage({ searchParams: Promise.resolve({ a }) }));
    expect(html).toContain('Gedeeld schoenadvies');
    expect(html).toContain('Jouw profiel');
    expect(html).not.toContain(PAIN_NOTICE);
    const broken = renderToStaticMarkup(await SharedShoeAdvicePage({ searchParams: Promise.resolve({ a: 'kapot' }) }));
    expect(broken).toContain('Deze link werkt niet');
  });

  it('is linked from the overview and in the sitemap, the shared advice is not', () => {
    expect(wizardMetadata.alternates?.canonical).toBe('/hockeyschoenen/wijzer');
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE_URL}/hockeyschoenen/wijzer`);
    expect(urls).not.toContain(`${SITE_URL}${SHOE_SHARE_PATH}`);
    expect(readFileSync('src/app/hockeyschoenen/page.tsx', 'utf8')).toContain('href="/hockeyschoenen/wijzer"');
  });
});

describe('privacy statement 1.5 (decision log 2026-11-01)', () => {
  const section = PRIVACY.sections.find((s) => s.heading === 'De schoenenwijzer');
  const text = (section?.paragraphs ?? []).join(' ');

  it('describes the schoenenwijzer as built: not stored, question 7 only in the browser, no answers in the statistics', () => {
    // 1.6 since 2026-11-03 (HockeyCity); the 1.5 statements stay.
    expect(['1.5', '1.6', '1.7']).toContain(PRIVACY.version);
    expect(PRIVACY.updatedAt >= '2026-11-01').toBe(true);
    expect(text).toMatch(/We slaan ze daar niet op en koppelen ze niet aan jou/);
    expect(text).toMatch(/blijft in je browser\. Het gaat niet naar onze server, niet in de statistieken en niet in een deellink/);
    expect(text).toMatch(/we stellen geen diagnose/);
    expect(text).toMatch(/Van je antwoorden in de schoenenwijzer komt niets in de statistieken/);
    expect(text).toMatch(/behalve die over bijzonderheden bij het passen/);
    expect(PRIVACY.intro.join(' ')).toMatch(/stickwijzer en de schoenenwijzer/);
  });
});

describe('result copy', () => {
  it('quotes a source without a doubled full stop, and keeps the rest of its words', async () => {
    const { reasonText } = await import('@/content/schoenenwijzer/resultCopy');
    const text = reasonText({ code: 'DEMPING', claim: 'EVA Midsole: Energy-efficient cushioning for optimal speed.', why: 'comfort' });
    expect(text).toBe('Je vindt comfort belangrijk. Over de demping zegt de bron: “EVA Midsole: Energy-efficient cushioning for optimal speed”.');
    expect(reasonText({ code: 'DEMPING', claim: 'Genius Foam Midsole', why: 'comfort' })).toContain('“Genius Foam Midsole”.');
  });
});

describe('stickwijzer share link (owner, 2026-11-01)', () => {
  it('is described in the privacy statement and its answers stay out of PostHog too', () => {
    const stick = PRIVACY.sections.find((s) => s.heading === 'De stickwijzer')!.paragraphs.join(' ');
    expect(stick).toMatch(/Deel je het advies met de knop “Deel dit advies”, dan staan je antwoorden in de link zelf/);
    expect(stick).toMatch(/Wij bewaren die link niet/);
    expect(stick).toMatch(/halen we de antwoorden uit het webadres voordat het in onze statistieken komt/);
    const url = `${SITE_URL}${shareHref({ advice_goal: 'child' }, ['grays-db8-composite'])}`;
    expect(url).toContain('/stickwijzer/advies?a=');
    expect(withoutSharedAnswers({ properties: { $current_url: url } })?.properties.$current_url).toBe(`${SITE_URL}/stickwijzer/advies`);
  });
});
