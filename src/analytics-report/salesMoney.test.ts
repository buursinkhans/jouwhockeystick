import { webcrypto } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { seal, unseal } from '../marketing/seal';
import { awinMoney, bolMoney, conversion, daisyconMoney, tradeTrackerMoney } from './salesMoney';

describe('bolMoney', () => {
  it('adds clicks, orders and commission; order value stays null when bol does not send it', () => {
    const m = bolMoney({ items: [{ clicks: 7, orders: 1, commission: 5.5 }, { clicks: 2, orders: 0 }] });
    expect(m).toEqual({ kliks: 9, orders: 1, omzet: null, commissie: 5.5 });
    expect(conversion(m)).toBe(11.1);
  });
});

describe('tradeTrackerMoney', () => {
  it('reads the reference report', () => {
    const xml = `<item xsi:type="ns1:ReportReferenceElement"><reportData><overallClickCount>12</overallClickCount><saleCount>2</saleCount><totalCommission>9.99</totalCommission></reportData></item>
<item xsi:type="ns1:ReportReferenceElement"><reportData><overallClickCount>5</overallClickCount><saleCount>0</saleCount></reportData></item>`;
    expect(tradeTrackerMoney(xml)).toEqual({ kliks: 17, orders: 2, omzet: null, commissie: 9.99 });
  });
});

describe('awinMoney', () => {
  it('skips declined and deleted orders and adds the amounts', () => {
    const m = awinMoney(
      [
        { commissionStatus: 'approved', saleAmount: { amount: 99.95, currency: 'EUR' }, commissionAmount: { amount: 6.5, currency: 'EUR' } },
        { commissionStatus: 'pending', saleAmount: { amount: 50, currency: 'EUR' }, commissionAmount: { amount: 3, currency: 'EUR' } },
        { commissionStatus: 'declined', saleAmount: { amount: 500 } },
      ],
      40,
    );
    expect(m).toEqual({ kliks: 40, orders: 2, omzet: 149.95, commissie: 9.5 });
  });
});

describe('daisyconMoney', () => {
  it('reads flat transactions and parts, without clicks', () => {
    const m = daisyconMoney(
      [
        { program_id: 7290, status: 'approved', revenue: 120.5, commission: 6 },
        { program_id: 7290, parts: [{ status: 'open', revenue: 80, commission: 4 }, { status: 'disapproved', revenue: 20, commission: 1 }] },
        { program_id: 7290, parts: [{ status: 'disapproved', revenue: 30 }] },
        { program_id: 1, status: 'approved', revenue: 999 },
      ],
      '7290',
    );
    expect(m).toEqual({ kliks: null, orders: 2, omzet: 200.5, commissie: 10 });
    expect(conversion(m)).toBeNull();
  });
});

describe('seal', () => {
  const pass = 'paard batterij nietje correct 2026';

  it('round-trips and refuses a wrong passphrase', () => {
    const sealed = seal({ omzet: 12.5 }, pass);
    expect(JSON.stringify(sealed)).not.toContain('12.5');
    expect(unseal(sealed, pass)).toEqual({ omzet: 12.5 });
    expect(() => unseal(sealed, 'een andere lange sleutel')).toThrow();
  });

  it('opens with WebCrypto, as the studio does', async () => {
    const sealed = seal({ ok: true }, pass);
    const b = (s: string) => Buffer.from(s, 'base64');
    const base = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    const key = await webcrypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: b(sealed.salt), iterations: sealed.iter },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );
    const plain = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: b(sealed.iv) }, key, b(sealed.data));
    expect(JSON.parse(new TextDecoder().decode(plain))).toEqual({ ok: true });
  });

  it('refuses a short passphrase', () => {
    expect(() => seal({}, 'kort')).toThrow(/te kort/);
  });
});
