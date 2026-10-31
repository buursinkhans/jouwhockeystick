import { describe, expect, it } from 'vitest';
import type { ShoeModel } from '../shoeFeed';
import { articleCode, buildShoeImport, modelKey } from './feedImport';
import { SHOE_CONTENT_PROPERTIES } from './types';

const DATE = '2026-10-31';
const GENERAL = 'Hockey > Hockeyschoenen';

function page(overrides: Partial<ShoeModel> & Pick<ShoeModel, 'url' | 'name'>): ShoeModel {
  return {
    shop: 'PassaHockey',
    brand: 'ASICS',
    discipline: 'veld',
    junior: false,
    sizes: ['40', '41'],
    sizesInStock: ['40'],
    eans: [],
    priceMin: 80,
    priceMax: 90,
    inStock: true,
    categories: [GENERAL],
    ...overrides,
  };
}

const run = (passa: ShoeModel[], pluto: ShoeModel[] = [], curated: { slug: string; eans: string[] }[] = []) =>
  buildShoeImport({ passa, pluto }, curated, DATE);

describe('shoe feed import: colours into one model (decision log 2026-10-31)', () => {
  it('merges the colour pages of one model, with the cheapest colour in stock as the shop link', () => {
    const result = run([
      page({ url: 'https://www.passasports.nl/asics-gel-peake-3-1113a057-100', name: 'ASICS Gel-Peake 3', priceMin: 71.95, sizes: ['38'], sizesInStock: ['38'], eans: ['1'.repeat(13)] }),
      page({ url: 'https://www.passasports.nl/asics-gel-peake-3-1113a057-102', name: 'Asics Gel-Peake 3', priceMin: 65, inStock: false, sizes: ['36'], sizesInStock: [], eans: ['2'.repeat(13)] }),
      page({ url: 'https://www.passasports.nl/asics-gel-peake-3-1113a057-105', name: 'ASICS Gel-Peake 3', priceMin: 95.95, sizes: ['40', '39 1/2'], sizesInStock: ['40'], eans: ['3'.repeat(13)] }),
    ]);
    expect(result.shoes).toHaveLength(1);
    const [shoe] = result.shoes;
    expect(shoe).toMatchObject({ slug: 'asics-gel-peake-3', brand: 'ASICS', model: 'Gel-Peake 3', ageGroup: 'senior' });
    expect(shoe!.eans).toHaveLength(3);
    expect(result.listings['asics-gel-peake-3']).toEqual([
      {
        shop: 'passasports',
        url: 'https://www.passasports.nl/asics-gel-peake-3-1113a057-100',
        priceEur: 71.95,
        inStock: true,
        sizes: ['36', '38', '39 1/2', '40'],
        sizesInStock: ['38', '40'],
        colourPages: 3,
        readAt: DATE,
      },
    ]);
  });

  it('keeps cuts apart (heren, dames, junior, indoor) and reads "Men" as "Heren"', () => {
    expect(modelKey({ name: 'adidas Speedcourt Men', brand: 'adidas' })).toBe(modelKey({ name: 'adidas Speedcourt Heren', brand: 'Adidas' }));
    expect(modelKey({ name: 'Asics Upcourt 6 Gs Kids', brand: 'ASICS' })).toBe(modelKey({ name: 'ASICS Upcourt 6 Kids', brand: 'Asics' }));
    expect(modelKey({ name: 'Brabo Force Junior Indoor', brand: 'Brabo' })).toBe(modelKey({ name: 'Brabo Force Indoor Junior', brand: 'Brabo' }));
    const keys = ['Mizuno Wave Mirage', 'Mizuno Wave Mirage Dames', 'Brabo Force Junior', 'Brabo Force Junior Indoor'].map((name) =>
      modelKey({ name, brand: name.split(' ')[0]! }),
    );
    expect(new Set(keys).size).toBe(4);
  });

  it('drops the words Plutosport adds, so its name gives the same key', () => {
    expect(modelKey({ name: 'Asics Gel-Peake 3 Hockeyschoenen Senior', brand: 'ASICS' })).toBe(modelKey({ name: 'ASICS Gel-Peake 3', brand: 'ASICS' }));
    expect(modelKey({ name: 'Brabo Elite Outdoor Hockeyschoenen Senior', brand: 'Brabo' })).toBe(modelKey({ name: 'Brabo Elite', brand: 'Brabo' }));
  });

  it('keeps the same name with different article codes apart, each with its code in the slug', () => {
    expect(articleCode('https://www.passasports.nl/asics-powerbreak-ff-heren-1071a101-020')).toBe('1071a101');
    expect(articleCode('https://www.passasports.nl/grays-raid-67624')).toBeNull();
    const result = run([
      page({ url: 'https://www.passasports.nl/asics-powerbreak-ff-heren-1071a101-020', name: 'Asics Powerbreak FF Heren', eans: ['4'.repeat(13)] }),
      page({ url: 'https://www.passasports.nl/asics-powerbreak-ff-heren-1071a133-020', name: 'Asics Powerbreak FF Heren', eans: ['5'.repeat(13)] }),
    ]);
    expect(result.shoes.map((s) => s.slug)).toEqual(['asics-powerbreak-ff-heren-1071a101', 'asics-powerbreak-ff-heren-1071a133']);
    expect(result.shoes.every((s) => s.variant === 'Heren')).toBe(true);
    expect(result.splitByArticle).toEqual([{ name: 'Asics Powerbreak FF Heren', codes: ['1071a101', '1071a133'] }]);
  });
});

describe('shoe feed import: shops linked on EAN only', () => {
  it('links PassaHockey and Plutosport on a shared EAN, whatever the names', () => {
    const result = run(
      [page({ url: 'https://www.passasports.nl/brabo-elite-31662043050', name: 'Brabo Elite', brand: 'Brabo', eans: ['8'.repeat(13)] })],
      [
        page({
          shop: 'Plutosport',
          url: 'https://www.plutosport.nl/brabo-elite-outdoor-hockeyschoenen-senior-316-62043-010',
          name: 'Brabo Elite Outdoor Hockeyschoenen Senior',
          brand: 'Brabo',
          eans: ['8'.repeat(13), '9'.repeat(13)],
          priceMin: 60.95,
          categories: ['Hockey > Schoenen > Veldhockey'],
        }),
      ],
    );
    expect(result.shoes).toHaveLength(1);
    expect(result.shoes[0]).toMatchObject({
      slug: 'brabo-elite',
      passaSportsProductUrl: 'https://www.passasports.nl/brabo-elite-31662043050',
      plutosportProductUrl: 'https://www.plutosport.nl/brabo-elite-outdoor-hockeyschoenen-senior-316-62043-010',
      feedImport: { feeds: ['passahockey', 'plutosport'], importedAt: DATE },
    });
    expect(result.listings['brabo-elite']!.map((l) => l.shop)).toEqual(['passasports', 'plutosport']);
  });

  it('never links on the name alone', () => {
    const result = run(
      [page({ url: 'https://www.passasports.nl/brabo-elite-31662043050', name: 'Brabo Elite', brand: 'Brabo', eans: ['8'.repeat(13)] })],
      [page({ shop: 'Plutosport', url: 'https://www.plutosport.nl/brabo-elite-1', name: 'Brabo Elite', brand: 'Brabo', eans: ['7'.repeat(13)] })],
    );
    expect(result.shoes).toHaveLength(2);
    expect(Object.values(result.listings).every((l) => l.length === 1)).toBe(true);
    expect(new Set(result.shoes.map((s) => s.slug)).size).toBe(2);
  });

  it('gives a hand-checked model the feed listings when an EAN matches, and does not import it again', () => {
    const result = run(
      [page({ url: 'https://www.passasports.nl/grays-aero-cage-x10-67639', name: 'Grays Aero Cage X10', brand: 'Grays', eans: ['6'.repeat(13)] })],
      [],
      [{ slug: 'grays-aerocage-xw10', eans: ['6'.repeat(13)] }],
    );
    expect(result.shoes).toEqual([]);
    expect(result.curatedMatched).toEqual(['grays-aerocage-xw10']);
    expect(result.listings['grays-aerocage-xw10']).toHaveLength(1);
  });

  it('merges two feed models of one checked model into one listing per shop, cheapest in stock first', () => {
    const result = run(
      [
        page({ url: 'https://www.passasports.nl/osaka-kai-mk1-pro-tour-ftw00033-coolgray', name: 'Osaka KAI MK1 - PRO TOUR', brand: 'Osaka', eans: ['1'.repeat(13)], priceMin: 99, sizes: ['40'], sizesInStock: ['40'] }),
        page({ url: 'https://www.passasports.nl/osaka-kai-mk1-pro-tour-ftw00044-bluetopaz', name: 'Osaka KAI MK1 - PRO TOUR', brand: 'Osaka', eans: ['2'.repeat(13)], priceMin: 89, sizes: ['38'], sizesInStock: ['38'] }),
      ],
      [],
      [{ slug: 'osaka-kai-mk1-pro-tour', eans: ['1'.repeat(13), '2'.repeat(13)] }],
    );
    expect(result.shoes).toEqual([]);
    expect(result.listings['osaka-kai-mk1-pro-tour']).toEqual([
      expect.objectContaining({ shop: 'passasports', priceEur: 89, sizes: ['38', '40'], sizesInStock: ['38', '40'], colourPages: 2 }),
    ]);
  });
});

describe('shoe feed import: field or indoor only from a shop that says so', () => {
  const one = (categories: string[], shop: ShoeModel['shop'] = 'PassaHockey', name = 'Asics Upcourt 6 Heren') =>
    run(shop === 'PassaHockey' ? [page({ url: 'https://www.passasports.nl/x-1071a104-107', name, categories })] : [], shop === 'Plutosport' ? [page({ shop, url: 'https://www.plutosport.nl/x', name, categories })] : []).shoes[0]!;

  it('leaves the general PassaHockey category unknown: it is no field claim', () => {
    expect(one([GENERAL]).category).toEqual({ value: 'onbekend' });
  });

  it('takes indoor from the shop’s indoor category, and field only from Plutosport’s field category', () => {
    expect(one([GENERAL, 'Hockey > Zaalhockey > Zaalhockey schoenen']).category).toMatchObject({ value: 'zaal', source: 'partner-shop', lastVerifiedAt: DATE });
    expect(one(['Hockey > Schoenen > Veldhockey'], 'Plutosport').category).toMatchObject({ value: 'veld', source: 'partner-shop' });
    expect(one([GENERAL], 'PassaHockey', 'Brabo Force Indoor Junior').category).toMatchObject({ value: 'zaal' });
  });

  it('applies the indoor category of one colour to the whole model', () => {
    const result = run([
      page({ url: 'https://www.passasports.nl/asics-upcourt-6-heren-1071a104-407', name: 'Asics Upcourt 6 Heren', categories: [GENERAL] }),
      page({ url: 'https://www.passasports.nl/asics-upcourt-6-heren-1071a104-107', name: 'ASICS Upcourt 6 Heren', categories: [GENERAL, 'Hockey > Zaalhockey > Zaalhockey schoenen'] }),
    ]);
    expect(result.shoes).toHaveLength(1);
    expect(result.shoes[0]!.category.value).toBe('zaal');
  });

  it('leaves a model unknown, and reports it, when one shop says field and the other indoor', () => {
    const result = run(
      [page({ url: 'https://www.passasports.nl/a-1071a111-100', name: 'Asics Court Hunter FF Heren', eans: ['3'.repeat(13)], categories: [GENERAL, 'Hockey > Zaalhockey > Zaalhockey schoenen'] })],
      [page({ shop: 'Plutosport', url: 'https://www.plutosport.nl/a', name: 'Asics Court Hunter FF', eans: ['3'.repeat(13)], categories: ['Hockey > Schoenen > Veldhockey'] })],
    );
    expect(result.shoes[0]!.category).toEqual({ value: 'onbekend' });
    expect(result.disciplineConflicts).toHaveLength(1);
  });
});

describe('shoe feed import: nothing is known about the shoe itself', () => {
  it('sets every content property to unknown and marks the model as a feed import (noindex)', () => {
    const [shoe] = run([page({ url: 'https://www.passasports.nl/mizuno-wave-lynx-3-x1ga2630-80', name: 'Mizuno Wave Lynx 3', brand: 'Mizuno' })]).shoes;
    for (const property of SHOE_CONTENT_PROPERTIES) expect(shoe![property], property).toEqual({ value: 'onbekend' });
    expect(shoe!.feedImport).toBeDefined();
    expect(shoe!.sizesAndWidths).toMatchObject({ value: { sizes: ['40', '41'] }, source: 'partner-shop', lastVerifiedAt: DATE });
    expect(shoe!.evidenceLimits.length).toBeGreaterThan(0);
  });

  it('marks junior from the name', () => {
    const [shoe] = run([page({ url: 'https://www.passasports.nl/x-1114a026-001', name: 'ASICS Gel-Peake 3 Junior', junior: true })]).shoes;
    expect(shoe!.ageGroup).toBe('junior');
  });
});
