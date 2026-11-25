import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The season rules of the agents follow the data (owner decisions 2026-11-25, Phase 3): the
 * Orchestrator reads the generated season agenda instead of a loose sentence, and the NL
 * calendar's autumn field start follows Google Trends (August to October).
 */
const orchestrator = readFileSync('docs/orchestrator.md', 'utf8');
const site = JSON.parse(readFileSync('marketing/sites/jouwhockeystick.json', 'utf8')) as {
  markten: { id: string; kalender: { id: string; van: string; tot: string }[] }[];
};

describe('seizoensregels van de agents', () => {
  it('de Orchestrator leest de seizoensagenda en noemt het koopseizoen voor zaal vanaf oktober', () => {
    expect(orchestrator).toContain('docs/marketing/seizoensagenda.md');
    expect(orchestrator).toContain('begin oktober live');
    expect(orchestrator).toContain('Verzin geen seizoen dat er niet staat');
  });
  it('de oude zin over zaalcontent "vóór december" staat er niet meer in', () => {
    expect(orchestrator).not.toContain('content daarvoor moet vóór december live staan');
    expect(orchestrator).not.toContain('Het zaalseizoen loopt van december tot en met februari');
  });
  it('de Orchestrator leest de ideeën voor social en zet de labels van de eigenaar nooit zelf', () => {
    expect(orchestrator).toContain('`seo-social`');
    expect(orchestrator).toContain('Zet zelf nooit de labels `seo-akkoord` of `seo-uitgevoerd`');
    expect(orchestrator).toContain('de Social-planner verandert hierdoor niet');
  });
  it('de kalender voor Nederland laat het veldseizoen in het najaar lopen van 1 augustus tot 31 oktober', () => {
    const nl = site.markten.find((m) => m.id === 'NL');
    const start = nl?.kalender.find((k) => k.id === 'veld-start-najaar');
    expect(start).toMatchObject({ van: '08-01', tot: '10-31' });
  });
});
