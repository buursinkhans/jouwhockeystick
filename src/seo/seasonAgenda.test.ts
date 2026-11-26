import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { agendaMarkdown, prepareWindow, runsOf } from './seasonAgenda';
import { readTrendExports } from './trendsFiles';

describe('runsOf', () => {
  it('maakt reeksen van opeenvolgende maanden, ook over de jaarwisseling', () => {
    expect(runsOf([8, 9, 10, 11])).toEqual([[8, 9, 10, 11]]);
    expect(runsOf([3, 8, 9, 11])).toEqual([[3], [8, 9], [11]]);
    expect(runsOf([11, 12, 1, 2])).toEqual([[11, 12, 1, 2]]);
    expect(runsOf([2, 1, 12, 5])).toEqual([[5], [12, 1, 2]]);
  });
  it('geeft niets voor niets en één reeks voor een heel jaar', () => {
    expect(runsOf([])).toEqual([]);
    expect(runsOf(Array.from({ length: 12 }, (_, i) => i + 1))).toHaveLength(1);
  });
});

describe('prepareWindow', () => {
  it('telt 8 tot 4 weken terug vanaf de eerste dag van de maand', () => {
    expect(prepareWindow(3)).toBe('4 jan t/m 1 feb');
    expect(prepareWindow(11)).toBe('6 sep t/m 4 okt');
    expect(prepareWindow(1)).toBe('6 nov t/m 4 dec');
  });
});

describe('seizoensagenda', () => {
  const { exports } = readTrendExports();
  const generated = agendaMarkdown(exports) as string;

  it('is gemaakt uit de geïmporteerde exports en klopt met het bestand in de repository', () => {
    expect(generated).toBeTruthy();
    const onDisk = readFileSync('docs/marketing/seizoensagenda.md', 'utf8').replace(/\r\n/g, '\n');
    expect(onDisk, 'draai npm run trends:agenda').toBe(generated);
  });
  it('geeft zonder referentie-export niets', () => {
    expect(agendaMarkdown(exports.filter((e) => e.rol !== 'referentie'))).toBeNull();
    expect(agendaMarkdown([])).toBeNull();
  });
  it('noemt de golven, de thema\'s per term en wat Trends niet kan zeggen', () => {
    for (const text of ['## Golven en voorbereiding', '### maat', '### zaal', 'Golf van', 'zaalhockeystick', 'Voorbereiden ongeveer', 'geen zoekaantallen', 'koopintentie']) {
      expect(generated, text).toContain(text);
    }
  });
  it('zegt dat het voorbereidingsvenster een hypothese is en dat een thema nooit wordt opgeteld', () => {
    expect(generated).toContain('hypothese');
    expect(generated).toContain('nooit opgeteld');
  });
  it('bevat geen cijfers van de site, alleen patronen van openbare Trends-indexen', () => {
    expect(generated).not.toMatch(/vertoningen|kliks|positie \d|commissie/i);
  });
  it('houdt de huisstijl: geen gedachtestreepjes en geen uitroeptekens', () => {
    expect(generated).not.toContain(' — ');
    expect(generated).not.toContain('!');
  });
});
