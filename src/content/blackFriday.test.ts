import { describe, expect, it } from 'vitest';
import { campaignCard, campaignPhase, promoTiming, showCampaignNote } from '@/lib/campaign';
import { RETAILERS, type RetailerId } from '@/lib/retailers';
import { BLACK_FRIDAY, BLACK_FRIDAY_EDITION, BLACK_FRIDAY_PROMOS, cardText, checkedPhrase, pageTimingText } from './blackFriday';

const label = (r: RetailerId) => RETAILERS[r].label;
/** The homepage card as it reads on a given (Amsterdam) day, with the real campaign data. */
const cardOn = (today: string) => {
  if (!showCampaignNote(BLACK_FRIDAY_EDITION, today)) return null;
  const phase = campaignPhase(BLACK_FRIDAY_EDITION, today);
  return cardText(campaignCard(BLACK_FRIDAY_PROMOS, today, phase, label), label);
};
const pageOn = (today: string) => {
  const phase = campaignPhase(BLACK_FRIDAY_EDITION, today);
  return Object.fromEntries(BLACK_FRIDAY_PROMOS.map((p) => [p.retailer, pageTimingText(promoTiming(p, today, phase))]));
};

describe('homepage Black Friday card, with the data as checked (10 November, Plutosport 17 November)', () => {
  it('17 November: the Black Week and bol.com run, PassaHockey starts; the check date is a range', () => {
    expect(cardOn('2026-11-17')).toEqual({
      eyebrow: 'Black Friday · nu al bezig',
      heading: '3 hockeywinkels hebben een Black Friday-actie',
      lines: ['PassaHockey begint 20 nov', 'Nu bezig bij bol.com, Plutosport en PassaHockey.'],
      checked: 'Nagekeken tussen 10 en 17 november bij de winkels zelf.',
    });
  });

  it('21 November: all three run, no urgent date', () => {
    expect(cardOn('2026-11-21')).toEqual({
      eyebrow: 'Black Friday · nu al bezig',
      heading: '3 hockeywinkels hebben nu een Black Friday-actie',
      lines: ['Nu bezig bij bol.com, PassaHockey en Plutosport.'],
      checked: 'Nagekeken tussen 10 en 17 november bij de winkels zelf.',
    });
  });

  it('25 November: shops last read more than 14 days ago drop out, the newer check stays', () => {
    const card = cardOn('2026-11-25');
    expect(card?.heading).toBe('1 hockeywinkel heeft nu een Black Friday-actie');
    expect(card?.lines).toEqual(['Nu bezig bij Plutosport.']);
    expect(card?.checked).toBe('Nagekeken op 17 november bij de winkels zelf.');
    expect(JSON.stringify(card)).not.toMatch(/bol\.com|PassaHockey/);
  });

  it('is hidden after Cyber Monday', () => {
    expect(cardOn('2026-12-01')).toBeNull();
  });

  it('never names a shop without a Black Friday action', () => {
    for (const day of ['2026-11-17', '2026-11-21', '2026-11-25']) {
      const all = JSON.stringify(cardOn(day));
      expect(all).not.toContain('HockeyCity');
      expect(all).not.toContain('Daka');
      expect(all).not.toContain('Decathlon');
      expect(all).not.toContain('partnerwinkel');
    }
  });
});

describe('Plutosport Black Week (2026-11-17)', () => {
  const promo = BLACK_FRIDAY_PROMOS.find((p) => p.retailer === 'plutosport')!;

  it('only says that the shop’s own action runs: no code, percentage, price or product group (owner, 2026-11-17)', () => {
    expect(promo.name).toBe('Black Week');
    expect(promo.kind).toBe('black-friday');
    expect(promo.audience).toBeNull();
    expect(promo.categories).toEqual([]);
    expect(promo.verifiedAt).toBe('2026-11-17');
    const text = JSON.stringify(promo);
    expect(text).not.toMatch(/BF10|code|\d+\s*%|procent|korting/i);
    expect(text).not.toMatch(/goedkoopst|beste prijs|van-prijs|voorheen/i);
  });

  it('is not Early Access any more, and the FAQ no longer mentions an ended action', () => {
    expect(JSON.stringify(BLACK_FRIDAY_PROMOS)).not.toContain('Early Access');
    expect(JSON.stringify(BLACK_FRIDAY.faq)).not.toContain('Early Access');
    expect(JSON.stringify(BLACK_FRIDAY.faq)).toContain('Plutosport heeft sinds kort een Black Week-actie');
  });
});

describe('checkedPhrase', () => {
  it('says "op" for one day and "tussen" for a range, with the year only at the end', () => {
    expect(checkedPhrase('2026-11-10', '2026-11-10')).toEqual({ lead: 'op', text: '10 november 2026' });
    expect(checkedPhrase('2026-11-10', '2026-11-17')).toEqual({ lead: 'tussen', text: '10 en 17 november 2026' });
    expect(checkedPhrase('2026-10-30', '2026-11-03')).toEqual({ lead: 'tussen', text: '30 oktober en 3 november 2026' });
  });
});

describe('status per shop on /black-friday-hockey', () => {
  it('17 November', () => {
    expect(pageOn('2026-11-17')).toEqual({
      bolcom: 'Nu bezig',
      hockeycity: 'Nu bezig',
      passasports: 'Begint op 20 november',
      plutosport: 'Nu bezig',
      daka: 'Geen actie gevonden',
      decathlon: 'Nog niet nagekeken',
    });
  });

  it('19 and 21 November, and after the campaign', () => {
    expect(pageOn('2026-11-19').passasports).toBe('Begint morgen');
    expect(pageOn('2026-11-21').passasports).toBe('Nu bezig');
    expect(pageOn('2026-11-21').plutosport).toBe('Nu bezig');
    expect(pageOn('2026-12-01').plutosport).toBe('Afgelopen');
  });
});
