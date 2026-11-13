import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { type Dagcijfers, DagcijfersDetail, DagcijfersPubliek, splitDagcijfers } from './dailyMetrics';
import { SEAL_ITERATIONS, seal, unseal } from './seal';

const PASS = 'een-testsleutel-van-genoeg-tekens';

const day = (date: string) => ({ date, bezoekers: 4, paginaweergaven: 9, wijzerStart: 1, wijzerKlaar: 1, winkelklikken: 0 });
const FULL: Dagcijfers = {
  versie: 1,
  gemaakt: '2026-11-13T04:31:00Z',
  site: 'jouwhockeystick.nl',
  posthog: {
    ok: true,
    value: {
      dagen: [day('2026-11-12')],
      vergelijking: [],
      bronnen: [{ key: 'Google', bezoekers: 3 }],
      landen: [{ key: 'BE', bezoekers: 1 }],
    },
  },
  google: {
    ok: true,
    value: {
      dagen: [{ date: '2026-11-10', klikken: 2, vertoningen: 40 }],
      vergelijking: [],
      periode: { start: '2026-11-04', end: '2026-11-10' },
      topZoektermen: [{ zoekterm: 'hockeystick lengte tabel', klikken: 2, vertoningen: 30, positie: 7.1 }],
      stijgers: [{ zoekterm: 'zaalstick kind', nu: 12, ervoor: 0, nieuw: true }],
    },
  },
  bing: { ok: true, value: { dagen: [], vergelijking: [] } },
};

describe('dagcijfers: readable totals, sealed details (security review 2026-11-13, option A)', () => {
  it('keeps no search query, source or country in the public file', () => {
    const { publiek } = splitDagcijfers(FULL);
    expect(DagcijfersPubliek.safeParse(publiek).success).toBe(true);
    const text = JSON.stringify(publiek);
    for (const secret of ['hockeystick lengte tabel', 'zaalstick kind', 'Google', '"BE"', 'bronnen', 'landen', 'topZoektermen', 'stijgers']) {
      expect(text).not.toContain(secret);
    }
    // The totals and comparisons the routine Dagbericht needs stay readable.
    expect(publiek.posthog.ok && publiek.posthog.value.dagen[0]?.bezoekers).toBe(4);
    expect(publiek.google.ok && publiek.google.value.periode.end).toBe('2026-11-10');
    expect(publiek.detail).toBe('dagcijfers-detail.json');
  });

  it('puts the details in the sealed part, and the reason when a source failed', () => {
    const { detail } = splitDagcijfers(FULL);
    expect(DagcijfersDetail.safeParse(detail).success).toBe(true);
    expect(detail.posthog).toEqual({ bronnen: [{ key: 'Google', bezoekers: 3 }], landen: [{ key: 'BE', bezoekers: 1 }] });
    const failed = splitDagcijfers({ ...FULL, google: { ok: false, reden: 'Search Console: HTTP 403' } });
    expect(failed.detail.google).toEqual({ fout: 'Search Console: HTTP 403' });
    expect(failed.publiek.google).toEqual({ ok: false, reden: 'Search Console: HTTP 403' });
  });

  it('seals the details unreadably, with 600,000 rounds, and opens them in the browser way (WebCrypto)', async () => {
    const { detail } = splitDagcijfers(FULL);
    const sealed = seal(detail, PASS);
    expect(SEAL_ITERATIONS).toBe(600_000);
    expect(sealed.iter).toBe(600_000);
    expect(JSON.stringify(sealed)).not.toContain('zaalstick');
    expect(unseal(sealed, PASS)).toEqual(detail);

    const b = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
    const base = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(PASS), 'PBKDF2', false, ['deriveKey']);
    const key = await webcrypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: b(sealed.salt), iterations: sealed.iter },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );
    const plain = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: b(sealed.iv) }, key, b(sealed.data));
    expect(JSON.parse(new TextDecoder().decode(plain))).toEqual(detail);
  });

  it('still opens files sealed with the old 310,000 rounds (the rounds are in the file)', () => {
    const old = seal({ omzet: 12.5 }, PASS, new Date(), 310_000);
    expect(old.iter).toBe(310_000);
    expect(unseal(old, PASS)).toEqual({ omzet: 12.5 });
    expect(() => unseal(old, 'een andere lange sleutel!')).toThrow();
  });

  it('wires the workflow, the studio and the routine to the sealed file', () => {
    const workflow = readFileSync('.github/workflows/dagcijfers.yml', 'utf8');
    const fetch = workflow.slice(workflow.indexOf('- name: Cijfers ophalen'), workflow.indexOf('- name: Verkoop ophalen'));
    expect(fetch).toContain('VERKOOP_SLEUTEL: ${{ secrets.VERKOOP_SLEUTEL }}');
    expect(fetch).toContain('dagcijfers-detail.json');
    expect(workflow).toContain('video/studio/state/dagcijfers-detail.json');

    const studio = readFileSync('social/studio/index.html', 'utf8');
    expect(studio).toContain('d.detail');
    expect(studio).toContain("'jhs-sleutel'");

    const routine = readFileSync('docs/marketing/dagbericht.md', 'utf8');
    expect(routine).toContain('dagcijfers-detail.json');
    expect(routine).toMatch(/ongewijzigd/);
  });
});
