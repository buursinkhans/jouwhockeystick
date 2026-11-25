import { describe, expect, it } from 'vitest';
import { applyOutcomes, dueForEvaluation, idFromBody, markerOf, outcomeOf, statusesFromIssues, type Due } from './evaluate';
import { issueFor } from './issues';
import { SeoReport, type HistoryMonth, type Recommendation } from './opportunities';

// DEMO — GEEN WERKELIJKE DATA: every figure below is synthetic.
const rec = (id: string, over: Partial<HistoryMonth['aanbevelingen'][number]> = {}): HistoryMonth['aanbevelingen'][number] => ({
  id,
  code: 'A',
  pagina: '/sticks/demo',
  zoekterm: 'demo hockeystick',
  basislijn: { positie: 9.4, vertoningen: 4321, klikken: 17 },
  ...over,
});
const history: HistoryMonth[] = [{ maand: '2026-12', aanbevelingen: [rec('aaaaaaa1'), rec('bbbbbbb2', { code: 'D' })] }];

describe('statusesFromIssues', () => {
  const body = (id: string) => `tekst\n\n${markerOf(id)}`;
  it('leest de status uit de labels en het id uit het merkteken', () => {
    const statuses = statusesFromIssues([
      { body: body('aaaaaaa1'), labels: ['seo-aanbeveling'] },
      { body: body('bbbbbbb2'), labels: ['seo-aanbeveling', 'seo-akkoord'] },
      { body: body('ccccccc3'), labels: ['seo-aanbeveling', 'seo-akkoord', 'seo-uitgevoerd'], uitgevoerdOp: '2027-01-05' },
      { body: 'geen merkteken', labels: ['seo-aanbeveling'] },
      { body: null, labels: [] },
    ]);
    expect(statuses).toEqual([
      { id: 'aaaaaaa1', status: 'voorgesteld' },
      { id: 'bbbbbbb2', status: 'goedgekeurd' },
      { id: 'ccccccc3', status: 'uitgevoerd', uitgevoerdOp: '2027-01-05' },
    ]);
  });
  it('een uitgevoerd-label zonder datum telt als goedgekeurd, nooit als gemeten', () => {
    expect(statusesFromIssues([{ body: body('aaaaaaa1'), labels: ['seo-uitgevoerd'] }])).toEqual([{ id: 'aaaaaaa1', status: 'goedgekeurd' }]);
  });
  it('vindt het id terug in de tekst', () => {
    expect(idFromBody(`x ${markerOf('0123abcd')} y`)).toBe('0123abcd');
    expect(idFromBody('<!-- seo-id:XYZ -->')).toBeNull();
  });
});

describe('dueForEvaluation', () => {
  const done = { id: 'aaaaaaa1', status: 'uitgevoerd' as const, uitgevoerdOp: '2026-12-10' };
  it('is aan de beurt als de 28 dagen na "uitgevoerd" voorbij zijn en verwerkt', () => {
    const due = dueForEvaluation(history, [done], '2027-01-07');
    expect(due).toHaveLength(1);
    expect(due[0]?.window).toEqual({ start: '2026-12-11', end: '2027-01-07' });
  });
  it('wacht tot de laatste dag van het venster door Search Console is verwerkt', () => {
    expect(dueForEvaluation(history, [done], '2027-01-06')).toEqual([]);
  });
  it('slaat voorgesteld, goedgekeurd en al gemeten aanbevelingen over', () => {
    const measured: HistoryMonth[] = [
      { maand: '2026-12', aanbevelingen: [rec('aaaaaaa1', { resultaat: { uitgevoerdOp: '2026-12-10', gemeten: '2027-01-07', oordeel: 'gelijk', na: null, toelichting: 'x' } })] },
    ];
    expect(dueForEvaluation(history, [{ id: 'aaaaaaa1', status: 'goedgekeurd' }, { id: 'bbbbbbb2', status: 'voorgesteld' }], '2030-01-01')).toEqual([]);
    expect(dueForEvaluation(measured, [done], '2030-01-01')).toEqual([]);
  });
  it('koppelt een terugkerende aanbeveling aan de nieuwste maand van vóór "uitgevoerd"', () => {
    const twice: HistoryMonth[] = [
      { maand: '2026-12', aanbevelingen: [rec('aaaaaaa1')] },
      { maand: '2027-01', aanbevelingen: [rec('aaaaaaa1', { basislijn: { positie: 6, vertoningen: 50, klikken: 1 } })] },
      { maand: '2027-02', aanbevelingen: [rec('aaaaaaa1')] },
    ];
    const due = dueForEvaluation(twice, [{ id: 'aaaaaaa1', status: 'uitgevoerd', uitgevoerdOp: '2027-01-20' }], '2027-03-01');
    expect(due[0]?.month).toBe('2027-01');
  });
});

describe('outcomeOf', () => {
  const due = (code: string, vertoningen = 4321): Due => ({
    id: 'aaaaaaa1',
    month: '2026-12',
    code,
    zoekterm: 'demo hockeystick',
    pagina: '/sticks/demo',
    basislijn: { positie: 9.4, vertoningen, klikken: 17 },
    uitgevoerdOp: '2026-12-10',
    window: { start: '2026-12-11', end: '2027-01-07' },
  });
  const after = (positie: number, vertoningen = 80) => ({ positie, vertoningen, klikken: 3 });

  it('verbeterd, gelijk en verslechterd volgen de positie (lager is beter)', () => {
    expect(outcomeOf(due('A'), after(7.9)).oordeel).toBe('verbeterd');
    expect(outcomeOf(due('A'), after(9.9)).oordeel).toBe('gelijk');
    expect(outcomeOf(due('A'), after(11)).oordeel).toBe('verslechterd');
  });
  it('zonder genoeg vertoningen voor of na is er geen richting', () => {
    expect(outcomeOf(due('A'), after(5, 4)).oordeel).toBe('onvoldoende data');
    expect(outcomeOf(due('A'), null).oordeel).toBe('onvoldoende data');
    expect(outcomeOf(due('A', 3), after(5)).oordeel).toBe('onvoldoende data');
  });
  it('de doorklik naar de winkel (D) wordt nog niet gemeten', () => {
    expect(outcomeOf(due('D'), after(5)).oordeel).toBe('niet gemeten');
  });
  it('zegt dat het een richting is en geen bewijs', () => {
    expect(outcomeOf(due('A'), after(5)).toelichting).toContain('geen bewijs');
  });
});

describe('applyOutcomes', () => {
  it('zet het resultaat op de juiste aanbeveling en laat de rest ongemoeid', () => {
    const d = dueForEvaluation(history, [{ id: 'aaaaaaa1', status: 'uitgevoerd', uitgevoerdOp: '2026-12-10' }], '2027-02-01')[0] as Due;
    const outcome = outcomeOf(d, { positie: 5, vertoningen: 50, klikken: 2 });
    const next = applyOutcomes(history, [{ due: d, outcome }]);
    expect(next[0]?.aanbevelingen[0]?.resultaat?.oordeel).toBe('verbeterd');
    expect(next[0]?.aanbevelingen[1]?.resultaat).toBeUndefined();
    expect(history[0]?.aanbevelingen[0]?.resultaat).toBeUndefined();
  });
});

describe('issueFor', () => {
  const recommendation: Recommendation = {
    id: '0123abcd',
    code: 'A',
    pagina: '/sticks/demo',
    paginaType: 'product',
    zoektermen: ['demo hockeystick', 'demo stick maat'],
    reden: 'De pagina staat net buiten de eerste resultaten. Verbeter titel, kopjes en inleiding op deze zoekopdracht.',
    prioriteit: 'hoog',
    zekerheid: 'middel',
    basislijn: { positie: 9.4, vertoningen: 4321, klikken: 17 },
  };
  const issue = issueFor(recommendation);

  it('noemt pagina, actie, zoektermen en reden, en het merkteken om het issue terug te vinden', () => {
    expect(issue.title).toBe('SEO-kans A: /sticks/demo');
    expect(issue.body).toContain('Bestaande pagina verbeteren');
    expect(issue.body).toContain('"demo hockeystick", "demo stick maat"');
    expect(issue.body).toContain(markerOf('0123abcd'));
    expect(idFromBody(issue.body)).toBe('0123abcd');
    expect(issue.labels).toEqual(['seo-aanbeveling']);
  });
  it('bevat geen enkel cijfer uit het rapport (de repository is openbaar)', () => {
    for (const secret of ['4321', '9.4', '9,4', '17']) expect(issue.body).not.toContain(secret);
    expect(issue.body).not.toMatch(/vertoningen|klikken|positie \d/i);
  });
  it('legt uit hoe je goedkeurt en dat zonder label niets gebeurt', () => {
    expect(issue.body).toContain('`seo-akkoord`');
    expect(issue.body).toContain('`seo-uitgevoerd`');
    expect(issue.body).toContain('Zonder dat label gebeurt er niets');
  });
  it('houdt de huisstijl: geen uitroeptekens, geen gedachtestreepjes in lopende tekst', () => {
    const text = issue.body.replace(markerOf('0123abcd'), ''); // the marker is an HTML comment and has an exclamation mark
    expect(text).not.toContain('!');
    expect(text).not.toContain('—');
  });
});

describe('SeoReport', () => {
  it('een oud rapport zonder resultaten in de historie blijft geldig', () => {
    const parsed = SeoReport.shape.historie.safeParse(history);
    expect(parsed.success).toBe(true);
  });
});
