import { describe, expect, it } from 'vitest';
import { DAKA_SHIPPING, RETAILERS, dakaTrackingUrl, isDakaProductPage, shippingCostEur } from '@/lib/retailers';
import { dakaPageUrl, dakaShoes, dakaStickMatches, dakaSticks, isDakaShoe, isDakaStick, parseDakaFeed, groupByPage } from './dakaFeed';
import { matchStick, type CatalogStick, type StickMatch } from './plutosportFeed';
import type { DakaStickModel } from './dakaFeed';

const link = (path: string) =>
  `https://partner.daka.nl/c/?si=7290&amp;li=1765148&amp;wi=441384&amp;pid=abc&amp;dl=${encodeURIComponent(`${path}?channable=xyz`)}&amp;ws=`;

const row = (o: { title: string; brand: string; size: string; path: string; price?: string; inStock?: string; desc?: string; ean?: string }) => `
  <product_info>
    <brand><![CDATA[${o.brand}]]></brand>
    <ean>${o.ean ?? ''}</ean>
    <description><![CDATA[${o.desc ?? ''}]]></description>
    <in_stock><![CDATA[${o.inStock ?? 'true'}]]></in_stock>
    <in_stock_amount><![CDATA[1]]></in_stock_amount>
    <link><![CDATA[${link(o.path).replaceAll('&amp;', '&')}]]></link>
    <price><![CDATA[${o.price ?? '129.99'}]]></price>
    <price_old><![CDATA[189.99]]></price_old>
    <title><![CDATA[${o.title}]]></title>
    <size><![CDATA[${o.size}]]></size>
    <images><image><location><![CDATA[https://daka.b-cdn.net/x.jpg]]></location></image></images>
  </product_info>`;

const FEED = `<?xml version="1.0"?><datafeed>
${row({ title: 'Grays Db6.5 Mc', brand: 'Grays', size: '36,5', path: 'p/grays-db65-mc-sku_1', desc: 'Een hockeystick met dynabow.' })}
${row({ title: 'Grays Db6.5 Mc', brand: 'Grays', size: '37,5', path: 'p/grays-db65-mc-sku_1', inStock: 'false', price: '119.99', desc: 'Een hockeystick met dynabow.' })}
${row({ title: 'Brabo Brabo It Pure 40', brand: 'Brabo', size: '35', path: 'p/brabo-it-pure-40-sku_2', desc: 'Deze stick is licht.' })}
${row({ title: 'Adidas Fabela X Empower', brand: 'Adidas', size: '38 2/3', path: 'p/adidas-fabela-x-empower-sku_3', price: '109.99', desc: 'Hockeyschoen met een stevige zool.' })}
${row({ title: 'Adidas Predator League Fg Kids', brand: 'Adidas', size: '33', path: 'p/adidas-predator-sku_4', desc: 'Voetbalschoen.' })}
${row({ title: 'Osaka Hc Rotterdam Uitshirt Heren', brand: 'Osaka', size: 'M', path: 'p/osaka-hc-rotterdam-sku_5', desc: 'Clubshirt voor hockey.' })}
${row({ title: 'Adidas Shinguard', brand: 'Adidas', size: 'M', path: 'p/adidas-shinguard-sku_6', desc: 'Scheenbeschermer voor hockey, past onder je stick sok.' })}
</datafeed>`;

const rows = parseDakaFeed(FEED);

describe('Daka links (decision log 2026-11-04)', () => {
  it('builds a Daisycon deeplink to a product page, with the placement as sub id', () => {
    const url = new URL(dakaTrackingUrl('https://www.daka.nl/p/grays-db65-mc-sku_1', 'stickwijzer')!);
    expect(url.host).toBe('partner.daka.nl');
    expect(url.searchParams.get('si')).toBe('7290');
    expect(url.searchParams.get('wi')).toBe('441384');
    expect(url.searchParams.get('ws')).toBe('stickwijzer');
    expect(url.searchParams.get('dl')).toBe('p/grays-db65-mc-sku_1');
    expect(url.searchParams.has('pid')).toBe(false);
  });

  it('only links to product pages, never a search or another host', () => {
    expect(isDakaProductPage(new URL('https://www.daka.nl/p/grays-db65-mc-sku_1'))).toBe(true);
    expect(isDakaProductPage(new URL('https://www.daka.nl/zoeken?q=stick'))).toBe(false);
    expect(isDakaProductPage(new URL('https://www.daka.nl/p/x?channable=1'))).toBe(false);
    expect(dakaTrackingUrl('https://example.com/p/x', 'stickwijzer')).toBeNull();
    expect(RETAILERS.daka.getUrl({ productName: 'x', brand: 'Grays', placement: 'stickwijzer' })).toBeNull();
  });

  it('charges €4,95 below €50 and nothing from €50', () => {
    expect(shippingCostEur(DAKA_SHIPPING, 49.99)).toBe(4.95);
    expect(shippingCostEur(DAKA_SHIPPING, 50)).toBe(0);
  });
});

describe('parseDakaFeed', () => {
  it('reads one row per size with the page without its query, and never the old price', () => {
    expect(rows).toHaveLength(7);
    expect(rows[0]).toMatchObject({ url: 'https://www.daka.nl/p/grays-db65-mc-sku_1', size: '36,5', priceEur: 129.99, inStock: true });
    expect(JSON.stringify(rows)).not.toContain('189.99');
    expect(dakaPageUrl('https://partner.daka.nl/c/?dl=zoeken%3Fq%3Dx')).toBeNull();
  });

  it('drops a repeated brand from the name and writes brands as the catalog does', () => {
    expect(rows.find((r) => r.url.includes('pure-40'))?.title).toBe('Brabo It Pure 40');
    expect(rows.find((r) => r.url.includes('fabela'))?.brand).toBe('adidas');
  });
});

describe('sticks and shoes', () => {
  const pages = groupByPage(rows);
  const page = (part: string) => pages.find((p) => p[0]!.url.includes(part))!;

  it('recognises sticks by the word stick and a length in inches, not by shop category', () => {
    expect(isDakaStick(page('grays-db65'))).toBe(true);
    expect(isDakaStick(page('pure-40'))).toBe(true);
    expect(isDakaStick(page('shinguard'))).toBe(false);
    expect(isDakaStick(page('rotterdam'))).toBe(false);
  });

  it('recognises hockey shoes, not a football boot or club clothing', () => {
    expect(isDakaShoe(page('fabela'))).toBe(true);
    expect(isDakaShoe(page('predator'))).toBe(false);
    expect(isDakaShoe(page('rotterdam'))).toBe(false);
  });

  it('joins the rows of a page: lengths in stock and their lowest price', () => {
    const [grays] = dakaSticks(rows);
    expect(grays).toMatchObject({ name: 'Grays Db6.5 Mc', lengths: [36.5], inStockPriceMin: 129.99, inStock: true });
  });

  it('makes shoe models with EU sizes; field or indoor stays unknown without the word in the name', () => {
    const [fabela] = dakaShoes(rows);
    expect(fabela).toMatchObject({ shop: 'Daka', sizes: ['38 2/3'], discipline: 'onbekend', eans: [] });
  });

  it('gives a button only for a zeker match or a confirmed page that is in stock', () => {
    const sticks = dakaSticks(rows);
    const grays = sticks.find((s) => s.name.startsWith('Grays'))!;
    const twijfel: StickMatch<DakaStickModel> = { slug: 'a', level: 'twijfel', model: grays, note: '' };
    const zeker: StickMatch<DakaStickModel> = { slug: 'b', level: 'zeker', model: grays, note: '' };
    const result = dakaStickMatches(
      [
        { slug: 'a', match: twijfel },
        { slug: 'b', match: zeker },
        { slug: 'c', match: twijfel },
      ],
      sticks,
      { c: grays.url },
    );
    expect(Object.keys(result).sort()).toEqual(['b', 'c']);
    expect(result.b).toMatchObject({ method: 'naam', priceEur: 129.99, lengths: [36.5] });
    expect(result.c?.method).toBe('handmatig');
  });

  it('links the same name with only the model year unknown, but only with one candidate (owner, decision log 2026-11-04)', () => {
    const sticks = dakaSticks(rows);
    const grays = { ...sticks.find((s) => s.name.startsWith('Grays'))!, name: 'Grays Dynabow 6.5' };
    const ours: CatalogStick = { slug: 'grays-db65', brand: 'Grays', name: 'Grays DB 6.5 Composite', discipline: grays.discipline, bow: 'dynabow', eans: [] };
    const one = matchStick(ours, [grays], 'Daka');
    expect(one).toMatchObject({ level: 'twijfel', yearOnly: true, note: 'modeljaar niet bekend in onze catalogus' });
    expect(dakaStickMatches([{ slug: 'grays-db65', match: one }], [grays], {})['grays-db65']).toMatchObject({ method: 'naam-zonder-jaar', priceEur: 129.99 });

    // Two pages with this name (two collections, other prices?): the owner decides.
    const two = matchStick(ours, [grays, { ...grays, key: `${grays.key}-2`, url: 'https://www.daka.nl/p/grays-db65-mc-sku_9' }], 'Daka');
    expect(two.level).toBe('twijfel');
    expect(two.yearOnly).toBeUndefined();
    expect(dakaStickMatches([{ slug: 'grays-db65', match: two }], [grays], {})).toEqual({});

    // A word more in Daka's name is not the same name.
    const extra = matchStick(ours, [{ ...grays, name: 'Grays Dynabow 6.5 Limited' }], 'Daka');
    expect(extra.yearOnly).toBeUndefined();
    // A known year on both sides that differs is never a match.
    expect(matchStick({ ...ours, modelYear: 2025 }, [{ ...grays, name: 'Grays Dynabow 6.5 2024' }], 'Daka').level).not.toBe('zeker');
  });
});
