import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { analyse } from '../seo/opportunities';
import { Dagcijfers, dagcijfersMeta, type Dagcijfers as DagcijfersType } from './dailyMetrics';
import { seal, unseal } from './seal';

/**
 * The SEO part of the daily figures (decision log 2026-11-25, Phase 1 part 2). The monthly
 * report is sealed in its own file; the daily run opens it and seals it again inside
 * dagcijfers.json, so the routine Dagbericht still copies one unchanged file.
 */
const PASS = 'een-testsleutel-van-genoeg-tekens';

// DEMO — GEEN WERKELIJKE DATA: synthetic report.
const report = analyse({
  month: '2026-12',
  now: new Date('2026-12-07T06:00:00Z'),
  period: { start: '2026-11-01', end: '2026-11-28' },
  previousPeriod: { start: '2026-10-04', end: '2026-10-31' },
  current: [{ query: 'demo hockeystick maat', page: 'https://jouwhockeystick.nl/sticks', clicks: 0, impressions: 4321, position: 9.4 }],
  previous: [],
  long: [],
  offerOf: () => ({ kind: 'artikel', path: '/kennis/hockeystick-lengte-tabel' }),
});

const base = (): DagcijfersType => ({
  versie: 1,
  gemaakt: '2026-12-08T04:31:00Z',
  site: 'jouwhockeystick.nl',
  posthog: { ok: false, reden: 'x' },
  google: { ok: false, reden: 'x' },
  bing: { ok: false, reden: 'x' },
});

describe('dagcijfers met een SEO-deel', () => {
  it('accepteert het rapport, een mislukt deel en een bestand zonder SEO-deel', () => {
    expect(Dagcijfers.safeParse({ ...base(), seo: { ok: true, value: report } }).success).toBe(true);
    expect(Dagcijfers.safeParse({ ...base(), seo: { ok: false, reden: 'x' } }).success).toBe(true);
    expect(Dagcijfers.safeParse(base()).success).toBe(true);
  });

  it('de metadata op de openbare branch bevat niets uit het SEO-rapport', () => {
    const meta = JSON.stringify(dagcijfersMeta({ ...base(), seo: { ok: true, value: report } }, '2026-12-07'));
    expect(meta).not.toContain('seo');
    expect(meta).not.toContain('4321');
    expect(meta).not.toContain('demo hockeystick');
  });

  it('het rapport komt na versleutelen en ontsleutelen ongewijzigd terug, en staat niet leesbaar in het bestand', () => {
    const full = { ...base(), seo: { ok: true as const, value: report } };
    const file = { ...dagcijfersMeta(full, '2026-12-07'), versleuteld: seal(full, PASS) };
    expect(JSON.stringify(file)).not.toContain('demo hockeystick');
    expect(Dagcijfers.parse(unseal(file.versleuteld, PASS)).seo).toEqual({ ok: true, value: report });
  });

  it('het dagelijkse script laat een probleem met het SEO-deel nooit de run mislukken', () => {
    const script = readFileSync('scripts/daily-metrics.ts', 'utf8');
    expect(script).toContain('SEO_BESTAND');
    expect(script).toMatch(/const failed = \(\['posthog', 'google', 'bing', 'conversie'\] as const\)/);
  });

  it('de workflow haalt het versleutelde bestand op en zet het alleen op de bestaande plek', () => {
    const workflow = readFileSync('.github/workflows/dagcijfers.yml', 'utf8');
    expect(workflow).toContain('video/studio/state/seo.json');
    expect(workflow).toContain('SEO_BESTAND=');
    // The sealed check before the public branch is unchanged: no readable part.
    expect(workflow).toContain('["posthog", "google", "bing", "detail", "conversie", "seo", "kpi"]');
  });
});
