import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { type Dagcijfers, DagcijfersMeta, dagcijfersMeta } from './dailyMetrics';
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
      vergelijking: [
        { metriek: 'bezoekers', dag: '2026-11-12', waarde: 38, gem7: 21, gem28: 20, verschil7Pct: 81, opvallend: 'hoger' },
        { metriek: 'winkelklikken', dag: '2026-11-12', waarde: 0, gem7: 1, gem28: 1, verschil7Pct: -100, opvallend: null },
      ],
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

describe('dagcijfers: one file, every figure sealed (security review 2026-11-13, PR A)', () => {
  const file = (full: Dagcijfers = FULL) => ({ ...dagcijfersMeta(full, '2026-11-12'), versleuteld: seal(full, PASS) });

  it('leaves only metadata readable: no count, query, source or country', () => {
    const f = file();
    const { versleuteld, ...meta } = f;
    expect(DagcijfersMeta.safeParse(meta).success).toBe(true);
    expect(versleuteld.alg).toBe('PBKDF2-SHA256/AES-256-GCM');
    const text = JSON.stringify(f);
    for (const secret of ['hockeystick lengte tabel', 'zaalstick kind', '"Google"', '"BE"', 'topZoektermen', 'bronnen":[', 'vergelijking']) {
      expect(text, secret).not.toContain(secret);
    }
    // No counts in the readable part (the sealed base64 may hold any digits).
    expect(JSON.stringify({ ...meta, versie: 'v' })).not.toMatch(/":\s*-?\d/);
    expect(Object.keys(f).sort()).toEqual(['bronnen', 'dag', 'gemaakt', 'opvallend', 'versie', 'versleuteld']);
  });

  it('keeps per headline metric only the direction of an outlier, and which sources worked', () => {
    expect(dagcijfersMeta(FULL, '2026-11-12')).toEqual({
      versie: 3,
      gemaakt: '2026-11-13T04:31:00Z',
      dag: '2026-11-12',
      bronnen: { posthog: true, google: true, bing: true },
      opvallend: { bezoekers: 'hoger', wijzerKlaar: null, winkelklikken: null, googleKlikken: null },
    });
    const failed = dagcijfersMeta({ ...FULL, posthog: { ok: false, reden: 'PostHog: HTTP 500' } }, '2026-11-12');
    expect(failed.bronnen.posthog).toBe(false);
    expect(failed.opvallend.bezoekers).toBeNull();
    expect(JSON.stringify(failed)).not.toContain('HTTP 500');
  });

  it('opens the sealed part to the full figures, also the browser way (WebCrypto), with 600,000 rounds', async () => {
    const { versleuteld } = file();
    expect(SEAL_ITERATIONS).toBe(600_000);
    expect(versleuteld.iter).toBe(600_000);
    expect(unseal(versleuteld, PASS)).toEqual(FULL);

    const b = (v: string) => Uint8Array.from(Buffer.from(v, 'base64'));
    const base = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(PASS), 'PBKDF2', false, ['deriveKey']);
    const key = await webcrypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: b(versleuteld.salt), iterations: versleuteld.iter },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );
    const plain = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: b(versleuteld.iv) }, key, b(versleuteld.data));
    expect(JSON.parse(new TextDecoder().decode(plain))).toEqual(FULL);
  });

  it('still opens files sealed with the old 310,000 rounds (the rounds are in the file)', () => {
    const old = seal({ omzet: 12.5 }, PASS, new Date(), 310_000);
    expect(old.iter).toBe(310_000);
    expect(unseal(old, PASS)).toEqual({ omzet: 12.5 });
    expect(() => unseal(old, 'een andere lange sleutel!')).toThrow();
  });

  it('wires the script, the workflow, the studio and the routine to the one sealed file', () => {
    const script = readFileSync('scripts/daily-metrics.ts', 'utf8');
    expect(script).toContain('versleuteld: seal(out, passphrase)');
    expect(script).not.toMatch(/JSON\.stringify\(out/);

    const workflow = readFileSync('.github/workflows/dagcijfers.yml', 'utf8');
    const fetch = workflow.slice(workflow.indexOf('- name: Cijfers ophalen'), workflow.indexOf('- name: Verkoop ophalen'));
    expect(fetch).toContain('VERKOOP_SLEUTEL: ${{ secrets.VERKOOP_SLEUTEL }}');
    expect(fetch).toContain('- name: Alleen versleuteld?');
    expect(workflow).toContain('git rm -q video/studio/state/dagcijfers-detail.json');

    const studio = readFileSync('social/studio/index.html', 'utf8');
    expect(studio).toContain('cijfers.versleuteld');
    expect(studio).toContain("'jhs-sleutel'");

    const routine = readFileSync('docs/marketing/dagbericht.md', 'utf8');
    expect(routine).toMatch(/ongewijzigd/);
    expect(routine).not.toContain('dagcijfers-detail.json');
  });
});
