import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAllProducts } from '@/catalog';
import { getOffers } from '@/catalog/offers';
import { getShoeOffers } from '@/catalog/shoes/offers';
import { getShoes } from '@/catalog/shoes';
import { GO_SHOP_HOSTS, goLinksEnabled, goUrl, isPlacement, isRetailerId, promoHref, resolveGo, retailerHref, shopPath } from './goLink';
import { RETAILERS, RETAILER_PLACEMENTS, shopPageTrackingUrl, type RetailerId } from './retailers';

/** The same reading of a /go/ URL that the route does. */
function follow(href: string): string | null {
  const url = new URL(href, 'https://jouwhockeystick.nl');
  const [, go, shop, placement] = url.pathname.split('/');
  expect(go).toBe('go');
  return resolveGo(shop ?? '', placement ?? '', { r: url.searchParams.get('r'), n: url.searchParams.get('n'), k: url.searchParams.get('k') });
}

describe('the /go/ link format', () => {
  it('has one fixed host per shop, all https, and a place list that matches the type', () => {
    expect(Object.keys(GO_SHOP_HOSTS).sort()).toEqual(['bolcom', 'daka', 'hockeycity', 'passasports', 'plutosport']);
    for (const host of Object.values(GO_SHOP_HOSTS)) expect(host).toMatch(/^www\.[a-z.]+$/);
    expect(RETAILER_PLACEMENTS).toContain('blackfriday');
    expect(isRetailerId('bolcom')).toBe(true);
    expect(isRetailerId('toString')).toBe(false);
    expect(isRetailerId('__proto__')).toBe(false);
    expect(isPlacement('versus')).toBe(true);
    expect(isPlacement('x')).toBe(false);
  });

  it('builds /go/<shop>/<place>?r=<path>, with the product name for bol.com only', () => {
    expect(goUrl({ retailer: 'passasports', placement: 'productpagina', pageUrl: 'https://www.passasports.nl/product/grays-jb10' })).toBe(
      '/go/passasports/productpagina?r=%2Fproduct%2Fgrays-jb10',
    );
    const bol = goUrl({ retailer: 'bolcom', placement: 'stickwijzer', pageUrl: 'https://www.bol.com/nl/nl/p/x/9300000226850913/', productName: 'Grays JB 10' });
    expect(bol).toBe('/go/bolcom/stickwijzer?r=%2Fnl%2Fnl%2Fp%2Fx%2F9300000226850913%2F&n=Grays+JB+10');
    expect(goUrl({ retailer: 'daka', placement: 'versus', pageUrl: 'https://www.daka.nl/p/grays-jb10', productName: 'x' })).not.toContain('n=');
  });

  it('refuses a page on any other host: the shop host is never taken from the link', () => {
    for (const bad of [
      'https://www.bol.com.evil.example/nl/nl/p/x/1/',
      'http://www.bol.com/nl/nl/p/x/1/',
      'https://evil.example/www.bol.com/nl/nl/p/x/1/',
      'https://www.bol.com@evil.example/nl/nl/p/x/1/',
      'https://bol.com/nl/nl/p/x/1/',
      'https://www.bol.com/nl nl',
      'https://www.bol.com/\\evil',
    ]) {
      expect(shopPath('bolcom', bad), bad).toBeNull();
    }
    expect(shopPath('bolcom', 'https://www.bol.com/nl/nl/p/x/1/')).toBe('/nl/nl/p/x/1/');
  });
});

describe('resolving a /go/ link', () => {
  const ok = { n: null, k: null } as const;

  it('answers null for an unknown shop or place, a missing or odd path and an unknown kind', () => {
    expect(resolveGo('nope', 'productpagina', { r: '/x', ...ok })).toBeNull();
    expect(resolveGo('daka', 'nope', { r: '/p/x', ...ok })).toBeNull();
    expect(resolveGo('daka', 'productpagina', { r: null, ...ok })).toBeNull();
    expect(resolveGo('daka', 'productpagina', { r: 'p/x', ...ok })).toBeNull();
    expect(resolveGo('daka', 'productpagina', { r: '/p/x y', ...ok })).toBeNull();
    expect(resolveGo('daka', 'productpagina', { r: '/\\@evil.example', ...ok })).toBeNull();
    expect(resolveGo('daka', 'productpagina', { r: `/p/${'a'.repeat(2000)}`, ...ok })).toBeNull();
    expect(resolveGo('daka', 'productpagina', { r: '/p/grays-jb10', n: null, k: 'iets' })).toBeNull();
  });

  it('cannot be steered to another host through the path', () => {
    for (const r of ['//evil.example/p/x', '/@evil.example/p/x', '/.evil.example', '/p/x#@evil.example']) {
      const target = resolveGo('daka', 'productpagina', { r, ...ok });
      // Either refused, or the shop's own host with that path: never the other host.
      if (target) expect(new URL(target).hostname).toBe('partner.daka.nl');
    }
  });

  it('refuses what the shop link formats refuse: a search page, a query on a product, a page that is not a product', () => {
    expect(resolveGo('plutosport', 'productpagina', { r: '/catalogsearch/result/?q=grays', ...ok })).toBeNull();
    expect(resolveGo('hockeycity', 'productpagina', { r: '/grays-jb10.html?x=1', ...ok })).toBeNull();
    expect(resolveGo('daka', 'productpagina', { r: '/zoeken?q=x', ...ok })).toBeNull();
    expect(resolveGo('passasports', 'productpagina', { r: '/product/grays-jb10', ...ok })).toContain('passasports.nl/tt/passa-nl/');
  });

  it('sends an action page through shopPageTrackingUrl, and only on the shop domain', () => {
    const page = 'https://www.hockeycity.nl/black-friday.html';
    expect(promoHref('hockeycity', page, 'blackfriday')).toBe('/go/hockeycity/blackfriday?r=%2Fblack-friday.html&k=actie');
    expect(follow(promoHref('hockeycity', page, 'blackfriday')!)).toBe(shopPageTrackingUrl('hockeycity', page, 'blackfriday'));
    expect(promoHref('hockeycity', 'https://evil.example/x', 'blackfriday')).toBeNull();
  });
});

describe('the switch NEXT_PUBLIC_GO_LINKS', () => {
  afterEach(() => vi.unstubAllEnvs());
  const product = { retailer: 'daka', brand: 'Grays', productName: 'Grays JB 10', placement: 'productpagina', productUrl: 'https://www.daka.nl/p/grays-jb10' } as const;
  const page = 'https://www.hockeycity.nl/black-friday.html';

  it('keeps the redirect on when it is not set, or set to anything but "off"', () => {
    expect(goLinksEnabled()).toBe(true);
    vi.stubEnv('NEXT_PUBLIC_GO_LINKS', 'on');
    expect(goLinksEnabled()).toBe(true);
    expect(retailerHref(product)?.startsWith('/go/daka/productpagina?')).toBe(true);
    expect(promoHref('hockeycity', page, 'blackfriday')?.startsWith('/go/hockeycity/blackfriday?')).toBe(true);
  });

  it('links straight to the partner again when it is "off", exactly as before the redirect', () => {
    vi.stubEnv('NEXT_PUBLIC_GO_LINKS', 'off');
    expect(goLinksEnabled()).toBe(false);
    expect(retailerHref(product)).toBe(RETAILERS.daka.getUrl(product));
    expect(retailerHref(product)).toContain('partner.daka.nl');
    expect(promoHref('hockeycity', page, 'blackfriday')).toBe(shopPageTrackingUrl('hockeycity', page, 'blackfriday'));
    // A shop without a verified link still has no button.
    expect(retailerHref({ ...product, retailer: 'passasports', productUrl: undefined })).toBeNull();
  });
});

describe('the partner link stays exactly the same', () => {
  it('is byte for byte the old link for every offer in the catalog, stick or shoe, at every place', () => {
    const checked = new Set<string>();
    const problems: string[] = [];
    const check = (retailer: RetailerId, productUrl: string, brand: string, productName: string) => {
      for (const placement of ['productpagina', 'stickwijzer', 'versus'] as const) {
        const key = `${retailer}|${placement}|${productUrl}|${productName}`;
        if (checked.has(key)) continue;
        checked.add(key);
        const direct = RETAILERS[retailer].getUrl({ productName, brand, placement, productUrl });
        const href = retailerHref({ retailer, brand, productName, placement, productUrl });
        if (direct === null) {
          if (href !== null) problems.push(`${key}: link where there was none`);
          continue;
        }
        if (!href?.startsWith(`/go/${retailer}/${placement}?`)) {
          problems.push(`${key}: not through /go/ (${href?.slice(0, 40)})`);
          continue;
        }
        if (follow(href) !== direct) problems.push(`${key}: partner link differs`);
      }
    };
    for (const product of getAllProducts(new Date(), { includeImported: true })) {
      for (const offer of getOffers(product)) check(offer.retailer, offer.productUrl, product.brand, product.name);
    }
    for (const shoe of getShoes({ includeImported: true })) {
      for (const offer of getShoeOffers(shoe)) check(offer.retailer, offer.productUrl, shoe.brand, `${shoe.brand} ${shoe.model}`);
    }
    expect(checked.size).toBeGreaterThan(1000);
    expect(problems.slice(0, 10)).toEqual([]);
  });

  it('keeps the bol.com search link direct when there is no product page, and a shop without a verified link without a button', () => {
    const search = retailerHref({ retailer: 'bolcom', brand: 'JDH', productName: 'JDH X93 Pro Bow', placement: 'productpagina' });
    expect(search).toMatch(/^https:\/\/partner\.bol\.com\/click\/click\?/);
    expect(retailerHref({ retailer: 'passasports', brand: 'x', productName: 'x', placement: 'productpagina' })).toBeNull();
    expect(retailerHref({ retailer: 'plutosport', brand: 'x', productName: 'x', placement: 'productpagina', productUrl: 'https://www.plutosport.nl/?q=1' })).toBeNull();
  });
});
