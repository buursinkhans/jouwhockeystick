import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The tab "Conversie" of the Marketingstudio (decision log 2026-11-24). The page
 * is one HTML file that is published by hand to claude.ai, so these checks keep
 * its inline scripts valid, the tab wired in, and the figures sealed.
 */
const studio = readFileSync('social/studio/index.html', 'utf8');
const scripts = [...studio.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1] ?? '');

describe('Marketingstudio: tab Conversie', () => {
  it('has inline scripts that all parse (one syntax error would blank every tab)', () => {
    expect(scripts.length).toBeGreaterThan(3);
    scripts.forEach((script, i) => {
      expect(() => new Function(script), `script ${i}`).not.toThrow();
    });
  });

  it('has the tab, the view and the router entry, and the number keys cover the first nine of the eleven views', () => {
    expect(studio).toContain('<a href="#conversie" data-view="conversie">Conversie</a>');
    expect(studio).toContain('id="view-conversie"');
    expect(studio).toContain("const VIEWS = ['vandaag', 'kpi', 'verkoop', 'conversie', 'seo', 'weekrapport', 'social', 'stack', 'post', 'week', 'ritme'];");
    expect(studio).toContain('/^[1-9]$/.test(ev.key)');
    expect(studio).toContain('<kbd>1</kbd>–<kbd>9</kbd>');
    for (const view of ['vandaag', 'kpi', 'verkoop', 'conversie', 'seo', 'weekrapport', 'social', 'stack', 'post', 'week', 'ritme']) {
      expect(studio, view).toContain(`id="view-${view}"`);
      expect(studio, view).toContain(`data-view="${view}"`);
    }
  });

  it('draws the figures that the tab Vandaag opened, and does not open or store anything itself', () => {
    const tab = scripts.find((s) => s.includes('document.getElementById(\'cv-body\')')) ?? '';
    expect(tab).toContain('window.jhsCijfers');
    expect(tab).toContain("addEventListener('jhs-cijfers'");
    expect(tab).not.toMatch(/crypto\.subtle|localStorage|sessionStorage|\.set\(|\.update\(|fetch\(/);
    const vandaag = scripts.find((s) => s.includes('openFiguresRaw')) ?? '';
    expect(vandaag).toContain("window.dispatchEvent(new Event('jhs-cijfers'))");
  });

  it('escapes everything it draws from the figures', () => {
    const tab = scripts.find((s) => s.includes('document.getElementById(\'cv-body\')')) ?? '';
    expect(tab).toContain('const esc =');
    // Every label that comes from a figure goes through esc(); no raw key in a template.
    expect(tab).not.toMatch(/'<td class="q">' \+ (?!esc)/);
  });

  it('shows states for old files, locked figures and a failed part', () => {
    for (const text of ['Nog geen conversiecijfers.', 'De cijfers zijn versleuteld', 'De conversiecijfers zijn niet gelezen.', 'Alleen voor de eigenaar.']) {
      expect(studio).toContain(text);
    }
  });

  it('says what it does not know: counts only, no typed text, no orders', () => {
    expect(studio).toContain('Alleen aantallen. Wat bezoekers typen wordt niet vastgelegd');
    expect(studio).toContain('Winkelklikken zeggen niets over bestellingen');
  });

  it('keeps the house style in the new text: no em dashes in running text, no exclamation marks', () => {
    const tab = scripts.find((s) => s.includes('document.getElementById(\'cv-body\')')) ?? '';
    expect(tab).not.toContain('—');
    // An exclamation mark right after a word in a text (not the logical operator in code).
    expect(tab).not.toMatch(/[A-Za-z.]!(?=['" <])/);
  });
});
