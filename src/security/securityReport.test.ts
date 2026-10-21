import { describe, expect, it } from 'vitest';
import {
  checkLive,
  formatSecurityReport,
  safeFixes,
  updateKind,
  type SecurityData,
} from './securityReport';

const GOOD_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "frame-ancestors 'self'",
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=()',
};

const base: SecurityData = {
  date: '2026-10-26',
  site: 'https://jouwhockeystick.nl',
  live: {
    ok: true,
    headers: GOOD_HEADERS,
    httpRedirectsToHttps: true,
    wwwRedirects: true,
    certificateDaysLeft: 60,
  },
  vulnerabilities: [],
  outdated: [],
  secrets: [],
};

describe('checkLive', () => {
  it('passes when every header is there and the site redirects', () => {
    expect(checkLive(base.live).every((c) => c.ok)).toBe(true);
  });

  it('flags a missing frame rule, the framework header and an expiring certificate', () => {
    const failing = checkLive({
      ok: true,
      headers: {
        ...GOOD_HEADERS,
        'Content-Security-Policy': '',
        'X-Powered-By': 'Next.js',
      },
      httpRedirectsToHttps: true,
      wwwRedirects: true,
      certificateDaysLeft: 5,
    })
      .filter((c) => !c.ok)
      .map((c) => c.label);
    expect(failing).toContain('Niet in een frame van een andere site');
    expect(failing).toContain('Geen X-Powered-By (verraadt de techniek niet)');
    expect(failing).toContain('Certificaat nog minstens 14 dagen geldig');
  });
});

describe('updateKind', () => {
  it('tells patch, minor and major apart', () => {
    expect(updateKind('16.3.6', '16.3.8')).toBe('patch');
    expect(updateKind('16.3.6', '16.4.2')).toBe('minor');
    expect(updateKind('5.9.3', '7.0.2')).toBe('major');
    expect(updateKind('1.2.3', '1.2.3')).toBeNull();
  });
});

describe('formatSecurityReport', () => {
  it('says nothing needs action when all is well', () => {
    expect(formatSecurityReport(base)).toContain('Niets dat nu actie vraagt.');
  });

  it('puts serious live problems and leaked keys first, without the key itself', () => {
    const data: SecurityData = {
      ...base,
      vulnerabilities: [
        {
          name: 'next',
          severity: 'high',
          production: true,
          fix: 'safe',
          title: 'cache poisoning',
        },
        {
          name: 'braces',
          severity: 'high',
          production: false,
          fix: 'major',
          title: 'ReDoS',
        },
      ],
      secrets: [{ file: 'src/x.ts', kind: 'GitHub-token' }],
    };
    const report = formatSecurityReport(data);
    expect(report).toContain('**Mogelijke sleutel in de code (1)**');
    expect(report).toContain(
      '**Ernstige kwetsbaarheid in wat er live draait**: next.',
    );
    expect(report).toContain(
      'Alleen in ontwikkeltools (komt niet op de site): braces.',
    );
    expect(safeFixes(data.vulnerabilities).map((v) => v.name)).toEqual([
      'next',
    ]);
  });
});
