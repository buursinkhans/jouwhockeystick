import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { formatSecurityReport, type SecurityData } from './securityReport';
import { formatZapBlock, parseZapReport } from './zapReport';

// Shape of zap-baseline.py's report_json.json (trimmed).
const ZAP_JSON = {
  '@version': '2.16.1',
  site: [
    {
      '@name': 'https://jouwhockeystick.nl',
      alerts: [
        { pluginid: '10020', name: 'Missing Anti-clickjacking Header', riskcode: '2', count: '3' },
        { pluginid: '10096', name: 'Timestamp Disclosure - Unix', riskcode: '1', count: '2' },
        { pluginid: '10027', alert: 'Information Disclosure - Suspicious Comments', riskcode: '0', count: '5' },
        { pluginid: '40012', name: 'Cross Site Scripting (Reflected)', riskcode: '3', instances: [{}, {}] },
      ],
    },
  ],
};

const base: SecurityData = {
  date: '2026-11-16',
  site: 'https://jouwhockeystick.nl',
  live: {
    ok: true,
    headers: {
      'Strict-Transport-Security': 'max-age=31536000',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "frame-ancestors 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=()',
    },
    httpRedirectsToHttps: true,
    wwwRedirects: true,
    certificateDaysLeft: 60,
  },
  vulnerabilities: [],
  outdated: [],
  secrets: [],
};

describe('ZAP baseline scan in the security report (security review 2026-11-13)', () => {
  it('reads the alerts, highest risk first, with counts', () => {
    const zap = parseZapReport(ZAP_JSON);
    expect(zap).toEqual({
      ok: true,
      alerts: [
        { id: '40012', name: 'Cross Site Scripting (Reflected)', risk: 3, count: 2 },
        { id: '10020', name: 'Missing Anti-clickjacking Header', risk: 2, count: 3 },
        { id: '10096', name: 'Timestamp Disclosure - Unix', risk: 1, count: 2 },
        { id: '10027', name: 'Information Disclosure - Suspicious Comments', risk: 0, count: 5 },
      ],
    });
  });

  it('gives "not readable" for anything else, never an exception', () => {
    expect(parseZapReport(null).ok).toBe(false);
    expect(parseZapReport({ site: 'x' }).ok).toBe(false);
    expect(parseZapReport({ site: [{ alerts: [{ riskcode: '9', pluginid: '1' }] }] })).toEqual({ ok: true, alerts: [] });
  });

  it('lists only real risks, counts the informational ones, and says it only looks', () => {
    const block = formatZapBlock(parseZapReport(ZAP_JSON)).join('\n');
    expect(block).toContain('### Passieve scan (ZAP)');
    expect(block).toContain('- Meldingen: hoog 1, middel 1, laag 1, informatief 1.');
    expect(block).toContain('- Middel: Missing Anti-clickjacking Header (regel 10020, 3×)');
    expect(block).not.toContain('Suspicious Comments');
    expect(block).toContain('Alleen bekijken, niet aanvallen');
    expect(formatZapBlock({ ok: false, reden: 'geen rapport' }).join('\n')).toContain('Scan niet gelukt: geen rapport.');
  });

  it('puts the block right under Samenvatting, a high risk in the summary, and nothing without a scan', () => {
    const report = formatSecurityReport({ ...base, zap: parseZapReport(ZAP_JSON) });
    const summary = report.indexOf('## Samenvatting');
    const block = report.indexOf('### Passieve scan (ZAP)');
    expect(summary).toBeGreaterThan(-1);
    expect(block).toBeGreaterThan(summary);
    expect(block).toBeLessThan(report.indexOf('## Live site'));
    expect(report).toContain('**Passieve scan**: één melding met hoog risico (Cross Site Scripting (Reflected)).');
    expect(formatSecurityReport(base)).not.toContain('Passieve scan');
  });

  it('keeps the accepted alerts in the rules file, each with a reason', () => {
    const rules = readFileSync('.zap/rules.tsv', 'utf8').trim().split('\n');
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      const [id, action, reason] = rule.split('\t');
      expect(id).toMatch(/^\d+$/);
      expect(action).toBe('IGNORE');
      expect(reason?.length ?? 0).toBeGreaterThan(10);
    }
    expect(rules.map((r) => r.split('\t')[0])).toContain('10038');
  });
});
