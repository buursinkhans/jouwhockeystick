import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** The tab "KPI" of the Marketingstudio (decision log 2026-11-27): wired in, and it only stores targets. */
const studio = readFileSync('social/studio/index.html', 'utf8');
const tab = readFileSync('social/studio/kpi-tab.js', 'utf8');

describe('Marketingstudio: tab KPI', () => {
  it('has the tab, the view, the router entry and both scripts', () => {
    expect(studio).toContain('<a href="#kpi" data-view="kpi">KPI</a>');
    expect(studio).toContain('id="view-kpi"');
    expect(studio).toContain("const VIEWS = ['vandaag', 'kpi',");
    for (const id of ['kp-status', 'kp-bar', 'kp-body', 'kp-targets']) expect(studio).toContain(`id="${id}"`);
    expect(studio.indexOf('src="kpi.js"')).toBeGreaterThan(0);
    expect(studio.indexOf('src="kpi-tab.js"')).toBeGreaterThan(studio.indexOf('src="kpi.js"'));
    expect(() => new Function(tab)).not.toThrow();
  });

  it('gets the figures from the tabs that open them', () => {
    expect(studio).toContain("window.dispatchEvent(new Event('jhs-verkoop'))");
    expect(tab).toContain('window.jhsCijfers');
    expect(tab).toContain('window.jhsVerkoop');
    expect(tab).not.toMatch(/crypto\.subtle|localStorage|sessionStorage|fetch\(/);
  });

  it('writes nothing but a new target version, and only for the owner', () => {
    expect(tab.match(/\.set\(/g)).toHaveLength(1);
    expect(tab).toContain("db.collection('targets').doc('t' + Date.now()).set(next)");
    expect(tab).not.toMatch(/\.update\(|\.delete\(|collection\([^)]*\)\.add\(/);
    expect(tab).toContain('!isOwner');
  });

  it('keeps the house style: no em dashes, no exclamation marks, no best claims', () => {
    const texts = [...tab.matchAll(/'([^'\n]*[a-z] [a-z][^'\n]*)'/g)].map((m) => m[1] ?? '');
    for (const text of texts) expect(text).not.toMatch(/—|[a-z]!(\s|$)|\bbeste\b/i);
  });
});
