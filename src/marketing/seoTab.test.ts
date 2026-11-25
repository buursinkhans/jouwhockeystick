import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The tab "SEO" of the Marketingstudio (decision log 2026-11-25). The page is one HTML
 * file that is published by hand to claude.ai, so these checks keep its inline scripts
 * valid, the tab wired in, everything it draws escaped, and the owner's wording honest.
 */
const studio = readFileSync('social/studio/index.html', 'utf8');
const scripts = [...studio.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1] ?? '');
const tab = scripts.find((s) => s.includes("document.getElementById('seo-body')")) ?? '';

describe('Marketingstudio: tab SEO', () => {
  it('has inline scripts that all parse (one syntax error would blank every tab)', () => {
    scripts.forEach((script, i) => {
      expect(() => new Function(script), `script ${i}`).not.toThrow();
    });
    expect(tab.length).toBeGreaterThan(0);
  });

  it('has the tab, the view and the router entry', () => {
    expect(studio).toContain('<a href="#seo" data-view="seo">SEO</a>');
    expect(studio).toContain('id="view-seo"');
    expect(studio).toContain("'conversie', 'seo', 'social'");
    expect(studio).toContain("v === 'seo'");
  });

  it('draws the figures that the tab Vandaag opened, and does not open, store or fetch anything itself', () => {
    expect(tab).toContain('window.jhsCijfers');
    expect(tab).toContain("addEventListener('jhs-cijfers'");
    expect(tab).not.toMatch(/crypto\.subtle|localStorage|sessionStorage|\.set\(|\.update\(|fetch\(/);
  });

  it('escapes every text it draws from the report', () => {
    expect(tab).toContain('const esc =');
    for (const field of ['r.reden', 'r.pagina', 'x.zoekterm', 'w.zoekterm', 'v.seizoenNotitie', 'part.reden']) {
      expect(tab, field).toContain(`esc(${field}`);
    }
    // A search term is typed by strangers: never put one in a template without esc().
    expect(tab).not.toMatch(/\+ (r|x|w)\.zoekterm(en)? \+/);
  });

  it('shows states for a missing report, locked figures and a failed part', () => {
    for (const text of ['Nog geen SEO-rapport.', 'De cijfers zijn versleuteld', 'Het SEO-rapport is niet gelezen.', 'Alleen voor de eigenaar.']) {
      expect(tab + studio).toContain(text);
    }
  });

  it('says what it does not know: season, Search Console only, small numbers, no volumes', () => {
    expect(tab).toContain('Alleen Search Console, alleen Nederland');
    expect(tab).toContain('Kleine aantallen: lees dit als richting');
    expect(tab).toContain('Geen zoekvolumes');
    expect(tab).toContain('geen bewijs');
  });

  it('tells how to approve: with the label on the issue', () => {
    expect(tab).toContain('label seo-akkoord');
  });

  it('keeps the house style in the new text: no em dashes in running text, no exclamation marks', () => {
    expect(tab).not.toContain('—');
    expect(tab).not.toMatch(/[A-Za-z.]!(?=['" <])/);
  });
});

describe('Marketingstudio: seizoenskaart in het tabblad SEO (Fase 2)', () => {
  it('toont het seizoen, de volgende golf en de thema\'s, en zegt wat er nog ontbreekt', () => {
    for (const text of ['Seizoen (Google Trends)', 'Verwacht door alleen het seizoen', 'Zonder het seizoen', 'Volgende stijging', 'geen zoekaantallen', 'Nog geen Google Trends-gegevens']) {
      expect(tab, text).toContain(text);
    }
  });
  it('zegt dat het venster van 8 tot 4 weken een hypothese is en dat een oude export vervangen moet worden', () => {
    expect(tab).toContain('hypothese');
    expect(tab).toContain('ouder dan 100 dagen');
    expect(tab).toContain('nooit per maand');
  });
  it('escapet alles wat uit de gegevens komt', () => {
    for (const field of ['z.geexporteerd', 'z.volgendeGolf.wekenTot', 'z.verwachteVerandering', 't.thema', 't.betrouwbaarheid']) {
      const escaped = field.replace(/\./g, String.raw`\.`);
      expect(tab, field).toMatch(new RegExp(String.raw`esc\((change\(|dayName\()?` + escaped));
    }
  });
});
