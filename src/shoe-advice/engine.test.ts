import { describe, expect, it } from 'vitest';
import { getCuratedShoes, getShoeListings } from '@/catalog/shoes';
import { getShoeOffers } from '@/catalog/shoes/offers';
import { UNKNOWN } from '@/catalog/shoes/types';
import { shoeAnswersSchema, type ShoeAnswers } from './answers';
import { getShoeAdvice, sizeKey } from './engine';
import { fitNotes, PAIN_NOTICE } from './fitNotes';
import { NOW, brand, fieldAnswers, testCatalog, testShoe } from './testFixtures';
import { SHOE_RULE_SET_VERSION, type CategoryAdvice, type ShoeAdvice, type ShoeCatalog } from './types';

const advise = (answers: ShoeAnswers, catalog: ShoeCatalog) => getShoeAdvice(shoeAnswersSchema.parse(answers), catalog, NOW);
const only = (advice: ShoeAdvice): CategoryAdvice => {
  if (advice.kind !== 'advice') throw new Error('keeper');
  return advice.advices[0]!;
};
const slugs = (advice: ShoeAdvice) => (advice.kind === 'advice' ? advice.advices.flatMap((a) => a.items.map((i) => i.shoe.slug)) : []);

const water = testShoe('water', { surfaceWater: brand('bevestigd' as const, '"for water-based turf"') });
const waterSand = testShoe('water-zand', {
  surfaceWater: brand('bevestigd' as const, '"water- and sand-based"'),
  surfaceSand: brand('bevestigd' as const, '"water- and sand-based"'),
});
const indoor = testShoe('zaal', { category: brand('zaal' as const), indoorNonMarking: brand('bevestigd' as const, '"non-marking"') });
const narrowHeel = testShoe('smalle-hiel', {
  surfaceWater: brand('bevestigd' as const, '"water"'),
  fitHeel: brand({ code: 'smal' as const, description: 'snug heel' }),
});
const wideHeelLight = testShoe('ruime-hiel-licht', {
  surfaceWater: brand('bevestigd' as const, '"water"'),
  fitHeel: brand({ code: 'ruim' as const, description: 'roomy heel' }),
  weight: brand({ grams: 250, size: '42', method: 'per schoen' }),
});

describe('shoe advice: acceptance tests (keuzemodel §11)', () => {
  it('1. a field player gets no indoor shoe for outdoor play', () => {
    const advice = advise(fieldAnswers(), testCatalog([[water], [indoor]]));
    expect(slugs(advice)).toEqual(['water']);
  });

  it('2. an indoor player gets no field shoe', () => {
    const advice = advise(fieldAnswers({ purpose: 'zaal', surface: undefined }), testCatalog([[water], [indoor], [waterSand]]));
    expect(slugs(advice)).toEqual(['zaal']);
  });

  it('3. a player on two surfaces gets no confirmed all-round claim when one surface is unknown', () => {
    const advice = only(advise(fieldAnswers({ surface: 'gemengd' }), testCatalog([[water]])));
    const item = advice.items[0]!;
    expect(item.certainty).not.toBe('goede-onderbouwing');
    expect(item.hard).toMatchObject({ water: 'voldoet', zand: 'onbekend' });
    expect(item.reasons.filter((r) => r.code === 'ONDERGROND').map((r) => r.code === 'ONDERGROND' && r.surface)).toEqual(['water']);
    expect(item.checks).toContainEqual({ code: 'ONDERGROND_ONBEKEND', surface: 'zand' });
    // Both confirmed ranks first.
    expect(slugs(advise(fieldAnswers({ surface: 'gemengd' }), testCatalog([[water], [waterSand]])))[0]).toBe('water-zand');
  });

  it('4. a wide forefoot and a narrow heel are handled together, part by part', () => {
    const both = testShoe('voorvoet-ruim-hiel-smal', {
      surfaceWater: brand('bevestigd' as const, '"water"'),
      fitForefoot: brand({ code: 'ruim' as const, description: 'roomy toe box' }),
      fitHeel: brand({ code: 'smal' as const, description: 'snug heel' }),
    });
    const advice = only(advise(fieldAnswers({ fitIssues: ['krap-voorvoet', 'ruim-hiel'] }), testCatalog([[narrowHeel], [both]])));
    const first = advice.items[0]!;
    expect(first.shoe.slug).toBe('voorvoet-ruim-hiel-smal');
    expect(first.reasons.filter((r) => r.code === 'PASVORM').map((r) => r.code === 'PASVORM' && r.part).sort()).toEqual(['hiel', 'voorvoet']);
    // The other one: heel matches, forefoot is still to check.
    expect(advice.items.find((i) => i.shoe.slug === 'smalle-hiel')?.checks).toContainEqual({ code: 'PASVORM_ONBEKEND', part: 'voorvoet' });
  });

  it('5. changing only the position never changes the selection', () => {
    const catalog = testCatalog([[water], [waterSand], [narrowHeel], [wideHeelLight]]);
    const base = fieldAnswers({ movements: ['sprints'], fitIssues: ['ruim-hiel'], preferences: ['licht'] });
    const results = (['aanval', 'middenveld', 'verdediging', 'wisselend', undefined] as const).map((position) =>
      JSON.stringify(advise({ ...base, position }, catalog)),
    );
    expect(new Set(results).size).toBe(1);
  });

  it('6. a preference for a light shoe never makes up for a clear fit conflict', () => {
    const advice = only(advise(fieldAnswers({ fitIssues: ['ruim-hiel'], preferences: ['licht'] }), testCatalog([[wideHeelLight], [water]])));
    expect(advice.items[0]!.shoe.slug).toBe('water');
    const light = advice.items.find((i) => i.shoe.slug === 'ruime-hiel-licht');
    if (light) expect(light.limits).toContainEqual(expect.objectContaining({ code: 'PASVORM_CONFLICT', part: 'hiel' }));
  });

  it('7. a child is not sent to premium models', () => {
    const premium = testShoe('premium-senior', { surfaceWater: brand('bevestigd' as const, '"water"') });
    const basic = testShoe('basis-junior', { surfaceWater: brand('bevestigd' as const, '"water"'), ageGroup: 'junior' });
    const catalog = testCatalog([[premium, { priceEur: 140 }], [basic, { priceEur: 45 }]]);
    expect(only(advise(fieldAnswers({ player: 'kind' }), catalog)).items[0]!.shoe.slug).toBe('basis-junior');
    // No price step up anywhere: with equal claims the cheaper model comes first for any player.
    const twoSeniors = testCatalog([[premium, { priceEur: 140 }], [testShoe('basis-senior', { surfaceWater: brand('bevestigd' as const, '"water"') }), { priceEur: 45 }]]);
    expect(only(advise(fieldAnswers({ player: 'kind' }), twoSeniors)).items[0]!.shoe.slug).toBe('basis-senior');
  });

  it('8. an injury answer gives no diagnosis or cure claim, and does not change the selection', () => {
    const notes = fitNotes(['pijn-blessure']);
    expect(notes.notices).toEqual([PAIN_NOTICE]);
    const text = [...notes.notices, ...notes.checks].join(' ');
    expect(text).not.toMatch(/diagnose is|je hebt (een )?[a-z]+itis|lost .* op|voorkomt|geneest|corrigeert/i);
    expect(text).toMatch(/geen oplossing voor klachten/);
    // Question 7 is not even an input of the rules.
    expect(() => shoeAnswersSchema.parse({ ...fieldAnswers(), fitParticulars: ['pijn-blessure'] })).toThrow();
  });

  it('9. missing product data never raises the match', () => {
    const catalog = testCatalog([[water], [testShoe('onbekend-water')]]);
    expect(only(advise(fieldAnswers(), catalog)).items.map((i) => i.shoe.slug)).toEqual(['water']);
    // Removing a confirmed claim can only lower a model, never lift it.
    const withSupport = testShoe('steun', { surfaceWater: brand('bevestigd' as const, '"water"'), support: brand('stable upper') });
    const withoutSupport = testShoe('zonder-steun', { surfaceWater: brand('bevestigd' as const, '"water"'), support: UNKNOWN });
    const order = slugs(advise(fieldAnswers({ movements: ['zijwaarts'] }), testCatalog([[withoutSupport], [withSupport]])));
    expect(order[0]).toBe('steun');
  });

  it('10. with no suitable model the advice says so honestly, without a sales advice', () => {
    const none = only(advise(fieldAnswers({ purpose: 'zaal', surface: undefined }), testCatalog([[water]])));
    expect(none).toMatchObject({ items: [], noMatch: { reason: 'geen-kandidaat' } });
    // Indoor shoes exist, but none has a confirmed non-marking sole: no products, the reason instead.
    const unconfirmed = only(
      advise(fieldAnswers({ purpose: 'zaal', surface: undefined }), testCatalog([[testShoe('zaal-onbekend', { category: brand('zaal' as const) })]])),
    );
    expect(unconfirmed).toMatchObject({ items: [], noMatch: { reason: 'niet-bevestigd', missing: 'non-marking' } });
    // Never a softer hard condition: a size that is not in stock stays excluded.
    const size = only(advise(fieldAnswers({ size: '44' }), testCatalog([[water, { sizesInStock: ['42', '43'] }]])));
    expect(size.items).toEqual([]);
  });

  it('11. without a confirmed size and stock no direct availability is promised', () => {
    const noData = only(advise(fieldAnswers({ size: '42' }), testCatalog([[water]])));
    expect(noData.items[0]!.hard.maat).toBe('onbekend');
    expect(noData.items[0]!.checks).toContainEqual({ code: 'MAAT_NIET_BEVESTIGD', size: '42' });
    expect(noData.items[0]!.reasons.some((r) => r.code === 'MAAT_OP_VOORRAAD')).toBe(false);
    const confirmed = only(advise(fieldAnswers({ size: '41,5' }), testCatalog([[water, { sizesInStock: ['41 1/2'] }]])));
    expect(confirmed.items[0]!.reasons).toContainEqual({ code: 'MAAT_OP_VOORRAAD', size: '41,5', shops: ['passasports'] });
    expect(sizeKey('41 1/2')).toBe(sizeKey('41,5'));
    expect(sizeKey('EU 40')).toBe('40');
    // "Maat nog bepalen": a profile advice with the size still to choose.
    expect(only(advise(fieldAnswers(), testCatalog([[water]]))).items[0]!.checks).toContainEqual({ code: 'MAAT_NOG_BEPALEN' });
  });

  it('12. a keeper gets a separate boundary, no field-player advice', () => {
    const advice = advise({ purpose: 'veld', player: 'keeper' }, testCatalog([[water]]));
    expect(advice).toEqual({ kind: 'keeper', ruleSetVersion: SHOE_RULE_SET_VERSION });
  });
});

describe('shoe advice: example profiles (keuzemodel §9), as directions', () => {
  it('A. attacker, water pitch, narrow heel, light: confirmed water and heel first, weight after', () => {
    const advice = only(
      advise(
        fieldAnswers({ surface: 'bijna-alleen-water', frequency: '2-3x', movements: ['sprints'], fitIssues: ['ruim-hiel'], preferences: ['licht'], position: 'aanval' }),
        testCatalog([[wideHeelLight], [narrowHeel], [water]]),
      ),
    );
    expect(advice.items[0]!.shoe.slug).toBe('smalle-hiel');
    expect(advice.items.map((i) => i.shoe.slug).indexOf('ruime-hiel-licht')).not.toBe(0);
  });

  it('B. defender, sand pitch, wide forefoot, durability: sand and forefoot room first, durability only when backed', () => {
    const sandRoomy = testShoe('zand-ruim', {
      surfaceSand: brand('bevestigd' as const, '"sand-based"'),
      fitForefoot: brand({ code: 'ruim' as const, description: 'wide toe box' }),
    });
    const sandDurable = testShoe('zand-slijtvast', { surfaceSand: brand('bevestigd' as const, '"sand-based"'), durability: brand('durable outsole') });
    const advice = only(
      advise(
        fieldAnswers({ surface: 'vooral-zand-semi', movements: ['zijwaarts'], fitIssues: ['krap-voorvoet'], preferences: ['slijtvast'], position: 'verdediging' }),
        testCatalog([[sandDurable], [sandRoomy], [water]]),
      ),
    );
    expect(advice.items[0]!.shoe.slug).toBe('zand-ruim');
    expect(advice.items.some((i) => i.shoe.slug === 'water')).toBe(false);
  });

  it('C. midfielder on mixed pitches, four times a week: both surfaces confirmed first, comfort backed by a claim', () => {
    const both = testShoe('beide-demping', {
      surfaceWater: brand('bevestigd' as const, '"water"'),
      surfaceSand: brand('bevestigd' as const, '"sand"'),
      cushioning: brand('foam midsole'),
    });
    const advice = only(
      advise(fieldAnswers({ surface: 'gemengd', frequency: '4x-plus', movements: ['loopmeters'], preferences: ['comfort'] }), testCatalog([[water], [waterSand], [both]])),
    );
    expect(advice.items[0]!.shoe.slug).toBe('beide-demping');
    expect(advice.items[0]!.reasons.some((r) => r.code === 'DEMPING')).toBe(true);
  });

  it('D. a beginning child: a basic pair for the surface, no premium step up, fit to check', () => {
    const premium = testShoe('premium', { surfaceWater: brand('bevestigd' as const, '"water"'), cushioning: brand('foam') });
    const junior = testShoe('junior-basis', { surfaceWater: brand('bevestigd' as const, '"water"'), ageGroup: 'junior' });
    const advice = only(
      advise(
        fieldAnswers({ player: 'kind', frequency: '1x', movements: ['beginner'], fitIssues: ['weet-niet'], preferences: ['geen'], position: 'wisselend' }),
        testCatalog([[premium, { priceEur: 130 }], [junior, { priceEur: 40 }]]),
      ),
    );
    expect(advice.items[0]!.shoe.slug).toBe('junior-basis');
    expect(advice.items[0]!.checks).toContainEqual({ code: 'PASVORM_ALGEMEEN' });
  });
});

describe('shoe advice: rules around the acceptance tests', () => {
  it('never ranks an unknown property above a confirmed one', () => {
    for (const [key, value] of [
      ['surfaceWater', brand('bevestigd' as const, '"water"')],
      ['support', brand('stable')],
      ['cushioning', brand('foam')],
    ] as const) {
      const confirmed = testShoe('bevestigd', { surfaceWater: brand('bevestigd' as const, '"water"'), [key]: value });
      const unknown = testShoe('onbekend', { surfaceWater: brand('bevestigd' as const, '"water"'), [key]: UNKNOWN });
      const answers = fieldAnswers({ movements: ['zijwaarts'], preferences: ['comfort'], frequency: '4x-plus' });
      const order = slugs(advise(answers, testCatalog([[unknown], [confirmed]])));
      expect(order.indexOf('bevestigd'), key).toBeLessThanOrEqual(Math.max(0, order.indexOf('onbekend')));
      expect(order[0], key).toBe('bevestigd');
    }
  });

  it('gives "beide" two separate advices, never one compromise pair', () => {
    const advice = advise(fieldAnswers({ purpose: 'beide' }), testCatalog([[water], [indoor]]));
    expect(advice.kind === 'advice' && advice.advices.map((a) => [a.category, a.items.map((i) => i.shoe.slug)])).toEqual([
      ['veld', ['water']],
      ['zaal', ['zaal']],
    ]);
  });

  it('shows at most three real candidates, never filled up, with at least two reasons each', () => {
    const many = Array.from({ length: 6 }, (_, i) => [testShoe(`w${i}`, { surfaceWater: brand('bevestigd' as const, '"water"') }), { priceEur: 60 + i }] as const);
    const advice = only(advise(fieldAnswers({ budget: '80-110' }), testCatalog(many)));
    expect(advice.items.length).toBeLessThanOrEqual(3);
    for (const item of advice.items) expect(item.reasons.length, item.shoe.slug).toBeGreaterThanOrEqual(2);
    // Same properties: no alternative "with another fit or property"; only a cheaper one if there is one.
    expect(advice.items.map((i) => i.role)).not.toContain('alternatief');
  });

  it('only shows a dearer model when the player allows it, and never as the first advice', () => {
    const cheap = testShoe('binnen', { surfaceWater: brand('bevestigd' as const, '"water"') });
    const dear = testShoe('boven', { surfaceWater: brand('bevestigd' as const, '"water"'), support: brand('stable') });
    const catalog = testCatalog([[cheap, { priceEur: 70 }], [dear, { priceEur: 120 }]]);
    expect(slugs(advise(fieldAnswers({ budget: '50-80' }), catalog))).toEqual(['binnen']);
    const allowed = only(advise(fieldAnswers({ budget: '50-80', allowAboveBudget: true }), catalog));
    expect(allowed.items[0]!.shoe.slug).toBe('binnen');
    expect(allowed.items.find((i) => i.shoe.slug === 'boven')?.limits).toContainEqual({ code: 'BOVEN_BUDGET', priceEur: 120, maxEur: 80 });
  });

  it('prefers the age group of the player only when all else is equal, and says so when it gives the other one', () => {
    const senior = testShoe('senior-water', { surfaceWater: brand('bevestigd' as const, '"water"') });
    const junior = testShoe('junior-water', { surfaceWater: brand('bevestigd' as const, '"water"'), ageGroup: 'junior' });
    const both = testCatalog([[junior, { priceEur: 40 }], [senior, { priceEur: 90 }]]);
    expect(only(advise(fieldAnswers({ player: 'volwassene' }), both)).items[0]!.shoe.slug).toBe('senior-water');
    // Only a junior model has the surface confirmed: the adult still gets it, with the limit.
    const onlyJunior = only(advise(fieldAnswers({ player: 'volwassene' }), testCatalog([[junior], [testShoe('senior-onbekend')]])));
    expect(onlyJunior.items[0]!.shoe.slug).toBe('junior-water');
    expect(onlyJunior.items[0]!.limits).toContainEqual({ code: 'ANDERE_LEEFTIJDSGROEP', modelFor: 'junior' });
  });

  it('turns a "goede onderbouwing" into conditional with an own insole or brace', () => {
    expect(fitNotes(['inlegzool-brace']).certainty('goede-onderbouwing')).toBe('voorwaardelijk');
    expect(fitNotes(['geen']).certainty('goede-onderbouwing')).toBe('goede-onderbouwing');
  });

  it('works on the real catalog: a water-pitch player gets checked field shoes with a confirmed water claim', () => {
    const catalog: ShoeCatalog = { shoes: getCuratedShoes(), listingsOf: (s) => getShoeListings(s.slug), offersOf: getShoeOffers };
    // The day of the latest feed read: a fixed date would put the prices of a newer weekly sync in the future.
    const lastRead = catalog.shoes.flatMap((s) => getShoeListings(s.slug).map((l) => l.readAt)).sort().at(-1)!;
    const advice = only(getShoeAdvice(fieldAnswers(), catalog, new Date(`${lastRead}T12:00:00Z`)));
    expect(advice.items.length).toBeGreaterThan(0);
    for (const item of advice.items) {
      expect(item.shoe.category.value).toBe('veld');
      expect(item.shoe.surfaceWater.value).toBe('bevestigd');
      expect(item.certainty).not.toBe('onvoldoende-informatie');
    }
    // Confirmed by the brand and nothing else open: a good basis, without fit data (owner, 2026-11-01).
    expect(advice.items[0]!.certainty).toBe('goede-onderbouwing');
  });

  it('counts a non-marking sole estimated from the photo as met, but never as a good basis', () => {
    const estimated = testShoe('zaal-foto', {
      category: brand('zaal' as const),
      indoorNonMarking: { value: 'bevestigd', source: 'editorial-estimate', sourceLabel: 'Inschatting: de loopzool is lichtgrijs', lastVerifiedAt: '2026-11-01' },
    });
    const item = only(advise(fieldAnswers({ purpose: 'zaal', surface: undefined }), testCatalog([[estimated]]))).items[0]!;
    expect(item.hard['non-marking']).toBe('voldoet');
    expect(item.checks).toContainEqual({ code: 'NON_MARKING_INSCHATTING' });
    expect(item.certainty).toBe('voorwaardelijk');
    const byBrand = testShoe('zaal-merk', { category: brand('zaal' as const), indoorNonMarking: brand('bevestigd' as const, '"non-marking"') });
    expect(only(advise(fieldAnswers({ purpose: 'zaal', surface: undefined }), testCatalog([[byBrand]]))).items[0]!.certainty).toBe('goede-onderbouwing');
  });
});
