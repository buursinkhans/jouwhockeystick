import { describe, expect, it } from 'vitest';
import { BLACK_FRIDAY, BLACK_FRIDAY_EDITION, BLACK_FRIDAY_PROMOS } from '@/content/blackFriday';
import { amsterdamDate, campaignHighlights, campaignPhase, promoState, showCampaignNote, sortShopPromos, type ShopPromo } from './campaign';
import { RETAILERS, shopPageTrackingUrl } from './retailers';

const promo = (over: Partial<ShopPromo> = {}): ShopPromo => ({
  retailer: 'bolcom',
  kind: 'black-friday',
  status: 'gecontroleerd',
  categories: [],
  startsAt: null,
  endsAt: null,
  verifiedAt: '2026-11-10',
  summary: 'x',
  conditions: null,
  sourceUrl: 'https://www.bol.com/nl/nl/sf/black-friday/',
  url: 'https://www.bol.com/nl/nl/sf/black-friday/',
  ...over,
});

describe('amsterdamDate', () => {
  it('uses Dutch time, not UTC', () => {
    // 23:30 UTC on 26 November is already 27 November in Amsterdam (UTC+1).
    expect(amsterdamDate(new Date('2026-11-26T23:30:00Z'))).toBe('2026-11-27');
    expect(amsterdamDate(new Date('2026-11-26T22:59:00Z'))).toBe('2026-11-26');
  });
});

describe('campaignPhase', () => {
  it('is before, during (Black Friday to Cyber Monday) and after', () => {
    expect(campaignPhase(BLACK_FRIDAY_EDITION, '2026-11-26')).toBe('voor');
    expect(campaignPhase(BLACK_FRIDAY_EDITION, '2026-11-27')).toBe('actief');
    expect(campaignPhase(BLACK_FRIDAY_EDITION, '2026-11-30')).toBe('actief');
    expect(campaignPhase(BLACK_FRIDAY_EDITION, '2026-12-01')).toBe('afgelopen');
  });

  it('links from the catalog pages only during the announcement window', () => {
    expect(showCampaignNote(BLACK_FRIDAY_EDITION, '2026-11-09')).toBe(false);
    expect(showCampaignNote(BLACK_FRIDAY_EDITION, '2026-11-10')).toBe(true);
    expect(showCampaignNote(BLACK_FRIDAY_EDITION, '2026-11-30')).toBe(true);
    expect(showCampaignNote(BLACK_FRIDAY_EDITION, '2026-12-01')).toBe(false);
  });
});

describe('promoState', () => {
  it('claims nothing for a shop we could not check', () => {
    expect(promoState(promo({ status: 'niet-gecontroleerd', verifiedAt: null }), '2026-11-10', 'voor')).toBe('onbekend');
  });

  it('is announced before its start and running after it', () => {
    const p = promo({ startsAt: '2026-11-20', endsAt: '2026-11-30' });
    expect(promoState(p, '2026-11-12', 'voor')).toBe('binnenkort');
    expect(promoState(p, '2026-11-20', 'voor')).toBe('actueel');
    expect(promoState({ ...p, verifiedAt: '2026-11-25' }, '2026-11-30', 'actief')).toBe('actueel');
  });

  it('never shows an ended action as running', () => {
    expect(promoState(promo({ endsAt: '2026-11-15' }), '2026-11-16', 'voor')).toBe('afgelopen');
    // No end date: after the campaign it counts as ended, never as current.
    expect(promoState(promo(), '2026-12-01', 'afgelopen')).toBe('afgelopen');
  });

  it('treats a check older than 14 days as not checked', () => {
    expect(promoState(promo({ verifiedAt: '2026-11-10' }), '2026-11-24', 'voor')).toBe('actueel');
    expect(promoState(promo({ verifiedAt: '2026-11-10' }), '2026-11-25', 'voor')).toBe('onbekend');
  });

  it('says so when a checked shop has no action', () => {
    expect(promoState(promo({ kind: 'geen' }), '2026-11-12', 'voor')).toBe('geen');
  });
});

describe('sortShopPromos', () => {
  it('puts running actions first, then by shop name, never by fee', () => {
    const rows = sortShopPromos(
      [
        promo({ retailer: 'plutosport', status: 'niet-gecontroleerd', verifiedAt: null }),
        promo({ retailer: 'hockeycity', kind: 'sale' }),
        promo({ retailer: 'bolcom' }),
        promo({ retailer: 'daka', endsAt: '2026-11-01' }),
      ],
      '2026-11-10',
      'voor',
      (r) => RETAILERS[r].label,
    );
    expect(rows.map((r) => [r.promo.retailer, r.state])).toEqual([
      ['bolcom', 'actueel'],
      ['hockeycity', 'actueel'],
      ['plutosport', 'onbekend'],
      ['daka', 'afgelopen'],
    ]);
  });
});

describe('the Black Friday config', () => {
  it('lists every partner shop once', () => {
    expect(BLACK_FRIDAY_PROMOS.map((p) => p.retailer).sort()).toEqual(Object.keys(RETAILERS).sort());
  });

  it('gives every shop a tracked link on its own domain', () => {
    for (const p of BLACK_FRIDAY_PROMOS) expect(shopPageTrackingUrl(p.retailer, p.url, 'blackfriday'), p.retailer).not.toBeNull();
  });

  it('a checked action has a check date, an unchecked one none', () => {
    for (const p of BLACK_FRIDAY_PROMOS) expect(p.status === 'gecontroleerd', p.retailer).toBe(p.verifiedAt !== null);
  });

  it('makes no discount, price or superlative claims (CLAUDE.md, Commerce)', () => {
    const all = JSON.stringify({ BLACK_FRIDAY, BLACK_FRIDAY_PROMOS });
    expect(all).not.toMatch(/\d\s?%|procent|€\s?\d|goedkoopst|beste prijs|scherpste prijs|laagste prijs|beste deal|meest populair|nog \d+ beschikbaar/i);
    expect(all).not.toMatch(/[—–!]/);
  });

  it('answers the main question in the first 80 words', () => {
    for (const intro of Object.values(BLACK_FRIDAY.intro)) expect(intro.split(/\s+/).length).toBeLessThanOrEqual(80);
    expect(BLACK_FRIDAY.intro.voor).toContain('27 november 2026');
  });

  it('keeps the meta description within the shown length', () => {
    expect(BLACK_FRIDAY.metaDescription.length).toBeLessThanOrEqual(158);
    expect(BLACK_FRIDAY.seoTitle.length).toBeLessThanOrEqual(60);
  });
});

describe('shopPageTrackingUrl', () => {
  it('wraps a shop page in the same network link as the product buttons', () => {
    expect(shopPageTrackingUrl('bolcom', 'https://www.bol.com/nl/nl/sf/black-friday/', 'blackfriday')).toMatch(/^https:\/\/partner\.bol\.com\/click\/click\?.*subid=blackfriday/);
    expect(shopPageTrackingUrl('passasports', 'https://www.passasports.nl/hockey/Blackfriday', 'blackfriday')).toMatch(/^https:\/\/www\.passasports\.nl\/tt\/passa-nl\/\?tt=39608_12_517408_blackfriday&r=%2Fhockey%2FBlackfriday$/);
    expect(shopPageTrackingUrl('plutosport', 'https://www.plutosport.nl/actievoorwaarden', 'blackfriday')).toMatch(/^https:\/\/www\.awin1\.com\/cread\.php\?awinmid=8342&awinaffid=3132918&clickref=blackfriday&ued=/);
    expect(shopPageTrackingUrl('hockeycity', 'https://www.hockeycity.nl/sale/', 'blackfriday')).toMatch(/^https:\/\/www\.hockeycity\.nl\/tracking\/tradetracker\/redirect\/\?tt=27931_/);
    expect(shopPageTrackingUrl('daka', 'https://www.daka.nl/sale/hockey', 'blackfriday')).toMatch(/^https:\/\/partner\.daka\.nl\/c\/\?si=7290&.*ws=blackfriday&dl=sale%2Fhockey$/);
  });

  it('refuses another domain or http', () => {
    expect(shopPageTrackingUrl('daka', 'https://www.example.com/sale', 'blackfriday')).toBeNull();
    expect(shopPageTrackingUrl('bolcom', 'http://www.bol.com/nl/', 'blackfriday')).toBeNull();
    expect(shopPageTrackingUrl('hockeycity', 'https://hockeycity.evil.nl/', 'blackfriday')).toBeNull();
  });
});

describe('campaignHighlights', () => {
  const label = (r: keyof typeof RETAILERS) => RETAILERS[r].label;
  const promos = [
    promo({ retailer: 'plutosport', kind: 'nieuwsbrief', startsAt: '2026-11-06', endsAt: '2026-11-15' }),
    promo({ retailer: 'passasports', startsAt: '2026-11-20' }),
    promo({ retailer: 'bolcom' }),
    promo({ retailer: 'daka', kind: 'geen' }),
    promo({ retailer: 'hockeycity', status: 'niet-gecontroleerd', verifiedAt: null }),
  ];

  it('counts running and announced actions and gives the confirmed dates, soonest first', () => {
    expect(campaignHighlights(promos, '2026-11-10', 'voor', label)).toEqual({
      withAction: 3,
      total: 5,
      facts: ['Plutosport tot en met 15 november', 'PassaHockey vanaf 20 november'],
      lastCheck: '2026-11-10',
    });
  });

  it('drops an action once it has ended', () => {
    const h = campaignHighlights(promos.map((p) => ({ ...p, verifiedAt: p.verifiedAt && '2026-11-16' })), '2026-11-16', 'voor', label);
    expect(h.facts).toEqual(['PassaHockey vanaf 20 november']);
    expect(h.withAction).toBe(2);
  });

  it('names no numbers when every check is older than 14 days', () => {
    const h = campaignHighlights(promos, '2026-11-25', 'voor', label);
    expect(h.lastCheck).toBeNull();
    expect(h.withAction).toBe(0);
  });
});
