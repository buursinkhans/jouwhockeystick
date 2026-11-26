import { describe, expect, it } from 'vitest';
import { applyOutcomes, dueForEvaluation, idFromBody, markerOf, outcomeOf, statusesFromIssues, type Due } from './evaluate';
import { issueFor, outcomeComment, socialIdOf, socialIssueFor, withIssueNumbers } from './issues';
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

describe('terugkoppeling in woorden (Fase 3)', () => {
  const outcome = {
    uitgevoerdOp: '2026-12-10',
    gemeten: '2027-01-07',
    oordeel: 'verbeterd' as const,
    na: { positie: 6.2, vertoningen: 4321, klikken: 17 },
    toelichting: 'Een richting, geen bewijs: ook het seizoen, andere wijzigingen en kleine aantallen verschuiven een positie.',
  };
  it('de reactie bevat het oordeel in woorden en geen enkel cijfer uit de meting', () => {
    const text = outcomeComment(outcome);
    expect(text).toContain('**Effect na 28 dagen:** Verbeterd.');
    expect(text).toContain('geen bewijs');
    for (const secret of ['6.2', '6,2', '4321', '17 ']) expect(text).not.toContain(secret);
    expect(text).not.toMatch(/vertoningen|klikken/i);
    expect(text).not.toContain('!');
  });
  it('geeft voor elk oordeel een eigen woord', () => {
    const words = (['verbeterd', 'gelijk', 'verslechterd', 'onvoldoende data', 'niet gemeten'] as const).map((o) => outcomeComment({ ...outcome, oordeel: o }).split('\n')[0]);
    expect(new Set(words).size).toBe(5);
  });
  it('het issuenummer reist mee van de labels naar de meting', () => {
    const statuses = statusesFromIssues([{ body: `x\n${markerOf('aaaaaaa1')}`, labels: ['seo-aanbeveling', 'seo-uitgevoerd'], uitgevoerdOp: '2026-12-10', number: 42 }]);
    expect(statuses[0]?.issue).toBe(42);
    expect(dueForEvaluation(history, statuses, '2027-02-01')[0]?.issue).toBe(42);
    expect(dueForEvaluation(history, statusesFromIssues([{ body: `x\n${markerOf('aaaaaaa1')}`, labels: ['seo-uitgevoerd'], uitgevoerdOp: '2026-12-10' }]), '2027-02-01')[0]?.issue).toBeUndefined();
  });
});

describe('idee voor social (actie E)', () => {
  const idea = { zoekterm: 'hockeystick sinterklaas', code: 'E' as const, reden: 'Een zoekopdracht buiten ons aanbod. Hooguit iets voor social, niet voor de site.' };
  const issue = socialIssueFor(idea);
  it('noemt de zoekterm en de reden, zonder cijfers, met het label seo-social en een merkteken', () => {
    expect(issue.title).toBe('SEO-social-idee: "hockeystick sinterklaas"');
    expect(issue.labels).toEqual(['seo-social']);
    expect(issue.body).toContain('"hockeystick sinterklaas"');
    expect(issue.body).toContain('Dit is geen websiteactie');
    expect(idFromBody(issue.body)).toBe(socialIdOf('hockeystick sinterklaas'));
    expect(issue.body.replace(markerOf(issue.id), '')).not.toMatch(/\d/);
  });
  it('geeft per zoekterm een eigen, vast id', () => {
    expect(socialIdOf('a')).toBe(socialIdOf('a'));
    expect(socialIdOf('a')).not.toBe(socialIdOf('b'));
    expect(socialIdOf('a')).toMatch(/^[0-9a-f]{8}$/);
  });
  it('houdt de huisstijl', () => {
    const text = issue.body.replace(markerOf(issue.id), '');
    expect(text).not.toContain('!');
    expect(text).not.toContain('—');
  });
});

describe('issuenummers in het rapport (optie 1)', () => {
  const rec: Recommendation = {
    id: '0123abcd',
    code: 'A',
    pagina: '/sticks/demo',
    paginaType: 'product',
    zoektermen: ['demo hockeystick'],
    reden: 'De pagina staat net buiten de eerste resultaten. Verbeter titel, kopjes en inleiding op deze zoekopdracht.',
    prioriteit: 'hoog',
    zekerheid: 'middel',
    basislijn: { positie: 9.4, vertoningen: 4321, klikken: 17 },
  };
  const idea = { zoekterm: 'hockeystick knutselen', code: 'E' as const, reden: 'Een zoekopdracht buiten ons aanbod. Hooguit iets voor social, niet voor de site.' };
  const base = {
    versie: 1 as const,
    regelset: 'seo-kansen-v3',
    gemaakt: '2026-12-07T06:00:00.000Z',
    maand: '2026-12',
    land: 'nld',
    periode: { start: '2026-11-01', end: '2026-11-28' },
    vorige: { start: '2026-10-04', end: '2026-10-31' },
    samenvatting: { eigen: { klikken: 0, vertoningen: 0, zoektermen: 0 }, merkwoorden: { klikken: 0, vertoningen: 0, zoektermen: 0 }, nietMerk: { klikken: 0, vertoningen: 0, zoektermen: 0 }, onvoldoende: 0 },
    aanbevelingen: [rec],
    bewustNiet: [idea],
    merkwoorden: [],
    seizoenNotitie: 'x',
    historie: [],
  };

  it('zet het nummer bij de aanbeveling en bij het social-idee, op hun marker-id', () => {
    const linked = withIssueNumbers(base, new Map([['0123abcd', 42], [socialIdOf('hockeystick knutselen'), 43]]));
    expect(linked.aanbevelingen[0]?.issue).toBe(42);
    expect(linked.bewustNiet[0]?.issue).toBe(43);
  });
  it('laat een aanbeveling zonder issue ongemoeid en verandert de rest van het rapport niet', () => {
    const linked = withIssueNumbers(base, new Map([['ander-id', 7]]));
    expect(linked.aanbevelingen[0]?.issue).toBeUndefined();
    expect(linked).toEqual(base);
  });
  it('geeft een F-regel nooit een nummer, ook niet bij een gelijk id', () => {
    const f = { zoekterm: 'x', code: 'F' as const, reden: 'Geen passend product in de catalogus. Of we dit gaan aanbieden is een besluit van de eigenaar.' };
    const linked = withIssueNumbers({ ...base, bewustNiet: [f] }, new Map([[socialIdOf('x'), 9]]));
    expect(linked.bewustNiet[0]?.issue).toBeUndefined();
  });
  it('het issuenummer is geen cijfer uit de meting: het staat niet in de tekst van het issue', () => {
    expect(issueFor({ ...rec, issue: 42 }).body).not.toContain('42');
  });
});
