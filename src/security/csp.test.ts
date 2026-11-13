import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { POSTHOG_PROXY_PATH } from '@/lib/analytics/posthog';
import { contentSecurityPolicy } from './csp';

const directive = (policy: string, name: string) =>
  policy
    .split(';')
    .map((d) => d.trim().split(/\s+/))
    .find(([n]) => n === name)
    ?.slice(1) ?? [];

const sourceFiles = readdirSync('src', { recursive: true, encoding: 'utf8' })
  .filter((f) => /\.tsx$/.test(f) && !/\.test\.tsx$/.test(f))
  .map((f) => readFileSync(join('src', f), 'utf8'));

describe('Content-Security-Policy-Report-Only (security review 2026-11-13)', () => {
  const policy = contentSecurityPolicy();

  it('allows every external script the site loads', () => {
    const scripts = sourceFiles.flatMap((code) =>
      [...code.matchAll(/<Script[^>]*\bsrc="(https:\/\/[^/"]+)/g)].map((m) => m[1]!),
    );
    expect(scripts.length).toBeGreaterThan(0);
    for (const origin of scripts) expect(directive(policy, 'script-src'), origin).toContain(origin);
  });

  it('sends analytics only to the own domain (PostHog proxy) and the Simple Analytics queue', () => {
    expect(POSTHOG_PROXY_PATH.startsWith('/')).toBe(true);
    expect(directive(policy, 'connect-src')).toEqual(["'self'", 'https://queue.simpleanalyticscdn.com']);
  });

  it('keeps the frame rule and the safe defaults, without a report address', () => {
    expect(directive(policy, 'frame-ancestors')).toEqual(["'self'"]);
    expect(directive(policy, 'object-src')).toEqual(["'none'"]);
    expect(directive(policy, 'form-action')).toEqual(["'self'"]);
    expect(policy).not.toMatch(/report-uri|report-to/);
    expect(directive(policy, 'script-src')).not.toContain("'unsafe-eval'");
    expect(directive(contentSecurityPolicy({ dev: true }), 'script-src')).toContain("'unsafe-eval'");
  });

  it('is set next to the enforced frame rule, which stays', () => {
    const config = readFileSync('next.config.ts', 'utf8');
    expect(config).toContain("key: 'Content-Security-Policy-Report-Only'");
    expect(config).toContain(`{ key: 'Content-Security-Policy', value: "frame-ancestors 'self'" }`);
  });
});
