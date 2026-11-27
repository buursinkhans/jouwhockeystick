import { describe, expect, it } from 'vitest';
import { LIVE_VISITORS } from './hogql';
import { IN_EUROPE, TECHNICAL_BOT, VISITOR, VISITOR_SEGMENT } from './visitorFilter';

describe('visitor filter', () => {
  it('herkent de drie kenmerken van een automatische browser', () => {
    expect(TECHNICAL_BOT).toContain("IN ('', 'UTC', 'Etc/UTC', 'Etc/Unknown')");
    expect(TECHNICAL_BOT).toContain('= 800 AND');
    expect(TECHNICAL_BOT).toContain('> 1.5 *');
  });
  it('laat ontbrekende schermmaten niet als null door de voorwaarde vallen', () => {
    expect(TECHNICAL_BOT).toContain('coalesce(toFloat(properties.$screen_width), 0)');
    expect(TECHNICAL_BOT).toContain('coalesce(toFloat(properties.$viewport_width), 0)');
  });
  it('telt Europese tijdzones, ook die zonder "Europe/" in de naam', () => {
    expect(IN_EUROPE).toContain("LIKE 'Europe/%'");
    expect(IN_EUROPE).toContain("'Atlantic/Canary'");
  });
  it('geeft elk event precies één groep: technisch gaat voor buiten Europa', () => {
    expect(VISITOR_SEGMENT.startsWith(`multiIf(${TECHNICAL_BOT}, 'technical'`)).toBe(true);
    expect(VISITOR).toBe(`NOT (${TECHNICAL_BOT}) AND ${IN_EUROPE}`);
  });
  it('zit samen met de live site in het filter van alle rapporten', () => {
    expect(LIVE_VISITORS).toContain("properties.$host IN ('jouwhockeystick.nl', 'www.jouwhockeystick.nl')");
    expect(LIVE_VISITORS).toContain(VISITOR);
  });
});
