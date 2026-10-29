import { describe, expect, it } from 'vitest';
import { PRIVACY } from './privacy';

const all = JSON.stringify(PRIVACY);
const thirdParties = PRIVACY.sections.find((s) => s.heading === 'Afbeeldingen en links van derden');
const text = (thirdParties?.paragraphs ?? []).join(' ');

describe('privacy statement 1.4 (decision log 2026-10-29)', () => {
  it('names all three partner shops and the network behind each', () => {
    expect(text).toMatch(/bol\.com, PassaHockey of Plutosport/);
    expect(text).toMatch(/bol\.com Partnerprogramma/);
    expect(text).toMatch(/TradeTracker/);
    expect(text).toMatch(/affiliatenetwerk Awin/);
    expect(text).toMatch(/awin1\.com/);
  });

  it('says what our links contain and that cookies only come after a click, on their sites', () => {
    expect(text).toMatch(/alleen de plek op onze site waar je klikte/);
    expect(text).toMatch(/Op onze eigen site plaatsen we geen cookies, ook niet voor partnerlinks/);
    expect(text).toMatch(/zonder naam, adres of andere gegevens over wie je bent/);
  });

  it('lists the shops and their image servers as sources of product photos', () => {
    expect(text).toMatch(/bol\.com, PassaSports en Plutosport/);
    expect(text).toMatch(/beeldservers/);
  });

  it('has a new version and date, and keeps the earlier statements', () => {
    expect(PRIVACY.version).toBe('1.4');
    expect(PRIVACY.updatedAt).toBe('2026-10-29');
    expect(all).toMatch(/PostHog via ons eigen domein|via ons eigen domein naar PostHog/);
    expect(all).toMatch(/we plaatsen geen cookies/);
  });
});
