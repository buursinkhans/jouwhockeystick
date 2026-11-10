import { describe, expect, it } from 'vitest';
import { campaignCard, campaignPhase, promoTiming, showCampaignNote } from '@/lib/campaign';
import { RETAILERS, type RetailerId } from '@/lib/retailers';
import { BLACK_FRIDAY_EDITION, BLACK_FRIDAY_PROMOS, cardText, pageTimingText } from './blackFriday';

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

describe('homepage Black Friday card, with the data as checked on 10 November', () => {
  it('10 November: running action first, with its end and condition', () => {
    expect(cardOn('2026-11-10')).toEqual({
      eyebrow: 'Black Friday · nu al bezig',
      heading: '3 hockeywinkels hebben een Black Friday-actie',
      lines: [
        'Plutosport Black Friday Early Access stopt over 5 dagen (t/m 15 nov), met een code via de nieuwsbrief',
        'PassaHockey begint 20 nov',
        'Nu bezig bij bol.com, Plutosport en PassaHockey.',
      ],
      checked: 'Nagekeken op 10 november bij de winkels zelf.',
    });
  });

  it('14 and 15 November: "stopt morgen", then "laatste dag"', () => {
    expect(cardOn('2026-11-14')?.lines[0]).toBe('Plutosport Black Friday Early Access stopt morgen, met een code via de nieuwsbrief');
    expect(cardOn('2026-11-15')?.lines[0]).toBe('Plutosport Black Friday Early Access: laatste dag, met een code via de nieuwsbrief');
  });

  it('16 November: the ended action is gone', () => {
    const card = cardOn('2026-11-16');
    expect(card?.heading).toBe('2 hockeywinkels hebben een Black Friday-actie');
    expect(card?.lines).toEqual(['PassaHockey begint 20 nov', 'Nu bezig bij bol.com en PassaHockey.']);
    expect(JSON.stringify(card)).not.toContain('Plutosport');
  });

  it('21 November: both running, no urgent date', () => {
    expect(cardOn('2026-11-21')).toEqual({
      eyebrow: 'Black Friday · nu al bezig',
      heading: '2 hockeywinkels hebben nu een Black Friday-actie',
      lines: ['Nu bezig bij bol.com en PassaHockey.'],
      checked: 'Nagekeken op 10 november bij de winkels zelf.',
    });
  });

  it('names no numbers once every check is older than 14 days', () => {
    const card = cardOn('2026-11-25');
    expect(card?.heading).toBe('Black Friday is op 27 november');
    expect(card?.eyebrow).toBe('Black Friday · 27 november');
    expect(card?.checked).toBeNull();
  });

  it('is hidden after Cyber Monday', () => {
    expect(cardOn('2026-12-01')).toBeNull();
  });

  it('never names a shop without a Black Friday action', () => {
    for (const day of ['2026-11-10', '2026-11-16', '2026-11-21']) {
      const all = JSON.stringify(cardOn(day));
      expect(all).not.toContain('HockeyCity');
      expect(all).not.toContain('Daka');
      expect(all).not.toContain('partnerwinkel');
    }
  });
});

describe('status per shop on /black-friday-hockey', () => {
  it('10 November', () => {
    expect(pageOn('2026-11-10')).toEqual({
      bolcom: 'Nu bezig',
      hockeycity: 'Nu bezig',
      passasports: 'Begint op 20 november',
      plutosport: 'Nu bezig, stopt over 5 dagen (t/m 15 november)',
      daka: 'Geen actie gevonden',
    });
  });

  it('16 and 21 November', () => {
    expect(pageOn('2026-11-16').plutosport).toBe('Afgelopen');
    expect(pageOn('2026-11-19').passasports).toBe('Begint morgen');
    expect(pageOn('2026-11-21').passasports).toBe('Nu bezig');
  });
});
