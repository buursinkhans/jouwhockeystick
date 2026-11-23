import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';
import { ShopPromoLink } from '@/components/campaign/ShopPromoLink';
import { RetailerLink } from '@/components/ui/RetailerLink';
import { RETAILERS, shopPageTrackingUrl } from '@/lib/retailers';
import { GET, HEAD } from './[retailer]/[placement]/route';

/** A button component with its label: the components type `children` as a prop, which the lint rule keeps out of createElement calls. */
const button = (component: unknown, props: Record<string, unknown>, label: string) =>
  createElement(component as ComponentType<Record<string, unknown>>, props, label);

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const GOOGLEBOT = 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const PRODUCT = 'https://www.daka.nl/p/grays-jb10-composite-hockeystick';

async function call(path: string, userAgent: string | null) {
  const url = new URL(path, 'https://jouwhockeystick.nl');
  const [, , retailer = '', placement = ''] = url.pathname.split('/');
  const headers: Record<string, string> = userAgent === null ? {} : { 'user-agent': userAgent };
  return GET(new Request(url, { headers }), { params: Promise.resolve({ retailer, placement }) });
}

describe('GET /go/<shop>/<place>', () => {
  it('sends a browser on with a 302 to exactly the partner link the button used to carry', async () => {
    const response = await call('/go/daka/productpagina?r=%2Fp%2Fgrays-jb10-composite-hockeystick', CHROME);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(RETAILERS.daka.getUrl({ productName: '', brand: '', placement: 'productpagina', productUrl: PRODUCT }));
    expect(response.headers.get('Location')).toContain('partner.daka.nl');
  });

  it('keeps the bol.com name and the place as sub-ID, and the PassaHockey reference', async () => {
    const bol = await call('/go/bolcom/stickwijzer?r=%2Fnl%2Fnl%2Fp%2Fx%2F9300000226850913%2F&n=Grays+JB+10', CHROME);
    const partner = new URL(bol.headers.get('Location') ?? '');
    expect(partner.searchParams.get('subid')).toBe('stickwijzer');
    expect(partner.searchParams.get('name')).toBe('Grays JB 10');
    expect(partner.searchParams.get('url')).toBe('https://www.bol.com/nl/nl/p/x/9300000226850913/');
    const passa = await call('/go/passasports/productpagina?r=%2Fproduct%2Fgrays-jb10', CHROME);
    expect(passa.headers.get('Location')).toContain('passasports.nl/tt/passa-nl/');
    expect(passa.headers.get('Location')).toContain('productpagina');
  });

  it('refuses bots with a 403 and no Location, Googlebot included', async () => {
    for (const ua of [GOOGLEBOT, 'Mozilla/5.0 (compatible; bingbot/2.0)', 'curl/8.5.0', 'python-requests/2.31.0', 'GPTBot/1.1', '', null]) {
      const response = await call('/go/daka/productpagina?r=%2Fp%2Fgrays-jb10-composite-hockeystick', ua);
      expect(response.status, String(ua)).toBe(403);
      expect(response.headers.get('Location'), String(ua)).toBeNull();
    }
  });

  it('answers 404 for an unknown shop or place, another host in the path, a search and an unknown kind', async () => {
    for (const path of [
      '/go/nope/productpagina?r=%2Fp%2Fx',
      '/go/daka/nope?r=%2Fp%2Fx',
      '/go/daka/productpagina',
      '/go/daka/productpagina?r=p%2Fx',
      '/go/daka/productpagina?r=%2Fzoeken%3Fq%3Dx',
      '/go/daka/productpagina?r=%2Fp%2Fx&k=iets',
      '/go/plutosport/productpagina?r=%2Fcatalogsearch%2Fresult%2F%3Fq%3Dx',
    ]) {
      const response = await call(path, CHROME);
      expect(response.status, path).toBe(404);
      expect(response.headers.get('Location'), path).toBeNull();
    }
  });

  it('sends an action page through its tracking link, and only for a page on the shop', async () => {
    const page = 'https://www.hockeycity.nl/black-friday.html';
    const response = await call('/go/hockeycity/blackfriday?r=%2Fblack-friday.html&k=actie', CHROME);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(shopPageTrackingUrl('hockeycity', page, 'blackfriday'));
  });

  it('is never cached and never indexed, on every answer', async () => {
    for (const response of [
      await call('/go/daka/productpagina?r=%2Fp%2Fgrays-jb10-composite-hockeystick', CHROME),
      await call('/go/daka/productpagina?r=%2Fp%2Fgrays-jb10-composite-hockeystick', GOOGLEBOT),
      await call('/go/nope/x', CHROME),
      HEAD(),
    ]) {
      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    }
  });

  it('answers a HEAD request with a 405 and never sends it on', () => {
    const response = HEAD();
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET');
    expect(response.headers.get('Location')).toBeNull();
  });

  it('sets no cookie and no body', async () => {
    const response = await call('/go/daka/productpagina?r=%2Fp%2Fgrays-jb10-composite-hockeystick', CHROME);
    expect(response.headers.get('Set-Cookie')).toBeNull();
    expect(await response.text()).toBe('');
  });
});

describe('robots.txt', () => {
  it('closes /go/ next to /aanbod/ and nothing else, and keeps the rest open for Google', () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;
    expect(rule?.userAgent).toBe('*');
    expect(rule?.allow).toBe('/');
    expect(rule?.disallow).toEqual(['/aanbod/', '/go/']);
  });
});

describe('the buttons', () => {
  it('link to /go/, not straight to the partner, with the same rel and target', () => {
    const html = renderToStaticMarkup(
      button(RetailerLink, { retailer: 'daka', brand: 'Grays', productName: 'Grays JB 10', placement: 'productpagina', productUrl: PRODUCT }, 'Bekijk prijs bij Daka'),
    );
    expect(html).toContain('href="/go/daka/productpagina?r=%2Fp%2Fgrays-jb10-composite-hockeystick"');
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(html).toContain('target="_blank"');
    expect(html).not.toMatch(/partner\.daka\.nl/);
  });

  it('keeps a shop without a verified link out of the page', () => {
    expect(renderToStaticMarkup(button(RetailerLink, { retailer: 'passasports', brand: 'x', productName: 'x', placement: 'productpagina' }, 'x'))).toBe('');
  });

  it('send an action page through /go/ too', () => {
    const html = renderToStaticMarkup(
      button(ShopPromoLink, { retailer: 'hockeycity', url: 'https://www.hockeycity.nl/black-friday.html', placement: 'blackfriday' }, 'Naar de actie'),
    );
    expect(html).toContain('href="/go/hockeycity/blackfriday?r=%2Fblack-friday.html&amp;k=actie"');
    expect(html).toContain('rel="noopener noreferrer sponsored"');
    expect(html).not.toMatch(/tradetracker/i);
  });
});

describe('no direct partner link in the pages (guard)', () => {
  function sources(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) return sources(path);
      return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
    });
  }
  const files = sources('src').map((path) => path.replace(/\\/g, '/'));

  it('builds a shop link only in src/lib (retailers.ts and goLink.ts): components and pages use retailerHref and promoHref', () => {
    const allowed = new Set(['src/lib/retailers.ts', 'src/lib/goLink.ts']);
    const offenders = files.filter((file) => {
      if (allowed.has(file)) return false;
      const text = readFileSync(file, 'utf8');
      return /\.getUrl\(|shopPageTrackingUrl\(|passaSportsTrackingUrl\(|plutosportTrackingUrl\(|hockeyCityTrackingUrl\(|dakaTrackingUrl\(|bolPartnerUrl\(/.test(text);
    });
    expect(offenders).toEqual([]);
  });

  it('has no component or page that writes a partner host into the HTML', () => {
    const tsx = files.filter((file) => file.endsWith('.tsx'));
    const offenders = tsx.filter((file) => /partner\.bol\.com|awin1\.com|tradetracker\/redirect|partner\.daka\.nl|passasports\.nl\/tt\//i.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
