import { describe, expect, it } from 'vitest';
import { PRIVACY } from './privacy';

const all = JSON.stringify(PRIVACY);
const thirdParties = PRIVACY.sections.find((s) => s.heading === 'Afbeeldingen en links van derden');
const text = (thirdParties?.paragraphs ?? []).join(' ');

describe('privacy statement 1.4 (decision log 2026-10-29)', () => {
  it('names all four partner shops and the network behind each', () => {
    // HockeyCity since 1.6 (decision log 2026-11-03).
    expect(text).toMatch(/bol\.com, PassaHockey, Plutosport, HockeyCity of Daka/);
    expect(text).toMatch(/bol\.com Partnerprogramma/);
    expect(text).toMatch(/TradeTracker/);
    expect(text).toMatch(/affiliatenetwerk Awin/);
    expect(text).toMatch(/awin1\.com/);
    expect(text).toMatch(/De links naar HockeyCity lopen, net als die naar PassaHockey, via het affiliatenetwerk TradeTracker/);
    // Daka since 1.7 (decision log 2026-11-04).
    expect(text).toMatch(/De links naar Daka lopen via het affiliatenetwerk Daisycon/);
    expect(text).toMatch(/partner\.daka\.nl/);
  });

  it('says what our links contain and that cookies only come after a click, on their sites', () => {
    expect(text).toMatch(/alleen de plek op onze site waar je klikte/);
    expect(text).toMatch(/Op onze eigen site plaatsen we geen cookies, ook niet voor partnerlinks/);
    expect(text).toMatch(/zonder naam, adres of andere gegevens over wie je bent/);
  });

  it('lists the shops and their image servers as sources of product photos', () => {
    expect(text).toMatch(/bol\.com, PassaSports, Plutosport, HockeyCity en Daka/);
    expect(text).toMatch(/beeldservers/);
  });

  it('has a new version and date, and keeps the earlier statements', () => {
    // 1.5 since 2026-11-01 (schoenenwijzer), 1.6 since 2026-11-03 (HockeyCity); the 1.4 statements stay.
    expect(['1.4', '1.5', '1.6', '1.7']).toContain(PRIVACY.version);
    expect(PRIVACY.updatedAt >= '2026-10-29').toBe(true);
    expect(all).toMatch(/PostHog via ons eigen domein|via ons eigen domein naar PostHog/);
    expect(all).toMatch(/we plaatsen geen cookies/);
  });
});
