import { describe, expect, it } from 'vitest';
import { canStart, currentQuestion, pairProblem, testLabel, type TestPost } from './abtest';
import { blackFriday, momentsOn, pushOn, seasonYear } from './calendar';
import { indexOf, lessons, median, ripe, type Result } from './learning';
import { rankIdeas, scoreIdea, type IdeaFacts } from './research';

describe('calendar', () => {
  it('finds Black Friday as the day after the fourth Thursday of November', () => {
    expect(blackFriday(2026)).toBe('2026-11-27');
    expect(blackFriday(2027)).toBe('2027-11-26');
    expect(blackFriday(2025)).toBe('2025-11-28');
  });

  it('starts a season year in August', () => {
    expect(seasonYear('2026-08-01')).toBe(2026);
    expect(seasonYear('2027-02-10')).toBe(2026);
  });

  it('names indoor hockey per market and puts Sinterklaas on the right day', () => {
    expect(momentsOn('2026-11-20', 'NL').map((m) => m.naam)).toEqual(['Zaalseizoen', 'Black Friday', 'Sinterklaas (pakjesavond 5 december)']);
    expect(momentsOn('2026-11-20', 'BE').map((m) => m.naam)).toContain('Indoorseizoen');
    expect(momentsOn('2026-12-06', 'NL').map((m) => m.id)).not.toContain('sinterklaas');
    expect(momentsOn('2026-12-06', 'BE').map((m) => m.id)).toContain('sinterklaas');
  });

  it('runs the indoor season through the end of February, also in a leap year', () => {
    expect(momentsOn('2028-02-29', 'NL').map((m) => m.id)).toContain('zaalseizoen');
    expect(momentsOn('2027-03-01', 'NL').map((m) => m.id)).not.toContain('zaalseizoen');
  });

  it('knows the two Push blocks, and Pulse in between', () => {
    expect(pushOn('2026-11-20', 'NL')?.vervolgstap).toBe('Kies je zaalstick');
    expect(pushOn('2026-11-20', 'BE')?.vervolgstap).toBe('Kies je indoorstick');
    expect(pushOn('2027-08-20', 'NL')?.id).toBe('veld-push');
    expect(pushOn('2027-01-10', 'NL')).toBeNull();
  });
});

describe('scoreIdea', () => {
  const idea = (o: Partial<IdeaFacts> = {}): IdeaFacts => ({
    onderwerp: 'Welke lengte zaalstick',
    pagina: '/zaalsticks',
    vraag: { bron: 'Search Console', signaal: '"zaalhockeystick lengte" 120 vertoningen' },
    pijler: 'zaal',
    datum: '2026-11-20',
    markt: 'NL',
    vorm: { naam: 'carrousel', index: 1.3, posts: 6 },
    laatstePost: '2026-09-01',
    ...o,
  });

  it('gives five points with a reason each when everything is there', () => {
    const s = scoreIdea(idea());
    expect(s.punten).toBe(5);
    expect(s.redenen).toEqual([
      'Er is vraag: "zaalhockeystick lengte" 120 vertoningen (Search Console).',
      'Het past nu: Zaalseizoen.',
      'Er is een pagina: /zaalsticks.',
      'De vorm werkte eerder: carrousel haalde 1,3× de mediaan over 6 posts.',
      'De pagina had 11 weken geen post.',
    ]);
  });

  it('names what is missing, in plain language', () => {
    const s = scoreIdea(idea({ vraag: null, pagina: null, vorm: { naam: 'beeld', index: 1.4, posts: 3 }, laatstePost: '2026-12-20', pijler: 'spel', datum: '2027-01-10' }));
    expect(s.punten).toBe(0);
    expect(s.ontbreekt).toEqual([
      'Geen teken van vraag gevonden.',
      'Het past niet bij een moment in de seizoenskalender.',
      'Er is nog geen live pagina; dat is een idee voor een content-brief.',
      'Van beeld zijn nog te weinig posts (3 van 5).',
      'De pagina had in de laatste zes weken al een post.',
    ]);
  });

  it('ranks by points, then page and demand, and keeps ten', () => {
    const list = Array.from({ length: 12 }, (_, i) => idea({ onderwerp: `Idee ${String(i).padStart(2, '0')}`, vraag: i % 2 ? null : idea().vraag }));
    const ranked = rankIdeas(list);
    expect(ranked).toHaveLength(10);
    expect(ranked[0]!.score.punten).toBe(5);
    expect(ranked.at(-1)!.score.punten).toBe(4);
  });
});

describe('learning', () => {
  const r = (id: string, datum: string, waarde: number, labels = {}, kanaal = 'instagram'): Result => ({ id, kanaal, datum, waarde, labels });
  const base = [r('b1', '2026-09-01', 100), r('b2', '2026-09-08', 100), r('b3', '2026-09-15', 100), r('b4', '2026-09-22', 100)];

  it('takes the median', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it('counts a result only after 7 days', () => {
    expect(ripe([r('x', '2026-10-01', 1)], '2026-10-07')).toHaveLength(0);
    expect(ripe([r('x', '2026-10-01', 1)], '2026-10-08')).toHaveLength(1);
  });

  it('compares with the median of the same channel over the 8 weeks before', () => {
    expect(indexOf(r('n', '2026-10-01', 150), base)).toBe(1.5);
    // Another channel is no baseline, and fewer than 3 earlier posts gives none.
    expect(indexOf(r('n', '2026-10-01', 150, {}, 'youtube'), base)).toBeNull();
  });

  it('makes a lesson only from 5 posts of a variant, and only for a clear difference', () => {
    const posts = [
      ...base,
      ...['10-01', '10-03', '10-05', '10-07', '10-09'].map((d, i) => r(`v${i}`, `2026-${d}`, 140, { hook: 'vraag' })),
      ...['10-02', '10-04', '10-06', '10-08'].map((d, i) => r(`g${i}`, `2026-${d}`, 60, { hook: 'getal' })),
    ];
    const ls = lessons(posts, '2026-10-30');
    expect(ls.map((l) => l.id)).toEqual(['hook=vraag']);
    expect(ls[0]!.tekst).toMatch(/^Hooktype "vraag" doet het \d+% beter dan gewoonlijk, over 5 posts\.$/);
  });
});

describe('paired tests', () => {
  const p = (id: string, datum: string, hook: string, o: Partial<TestPost> = {}): TestPost => ({ id, onderwerp: 'Lengte zaalstick', datum, tijd: '19:30', labels: { hook, vorm: 'carrousel' }, ...o });

  it('accepts the same subject, weekday and time, 1 to 2 weeks apart, one variable different', () => {
    expect(pairProblem('hook', p('a', '2026-11-17', 'vraag'), p('b', '2026-11-24', 'getal'))).toBeNull();
  });

  it('refuses a pair that is not a fair test', () => {
    expect(pairProblem('hook', p('a', '2026-11-17', 'vraag'), p('b', '2026-11-25', 'getal'))).toMatch(/weekdag/);
    expect(pairProblem('hook', p('a', '2026-11-17', 'vraag'), p('b', '2026-12-08', 'getal'))).toMatch(/1 tot 2 weken/);
    expect(pairProblem('hook', p('a', '2026-11-17', 'vraag'), p('b', '2026-11-24', 'vraag'))).toMatch(/ontbreekt/);
    expect(pairProblem('hook', p('a', '2026-11-17', 'vraag'), p('b', '2026-11-24', 'getal', { labels: { hook: 'getal', vorm: 'beeld' } }))).toMatch(/meer dan één ding/);
    expect(pairProblem('hook', p('a', '2026-11-17', 'vraag'), p('b', '2026-11-24', 'getal', { onderwerp: 'Carbon' }))).toMatch(/onderwerp/);
  });

  it('asks one question at a time, the hook type first', () => {
    expect(currentQuestion([])).toBe('hook');
    expect(currentQuestion(['hook'])).toBe('vorm');
    const pair = { vraag: 'hook' as const, a: p('a', '2026-11-17', 'vraag'), b: p('b', '2026-11-24', 'getal') };
    expect(canStart([pair])).toBe(false);
    expect(testLabel(pair, 'b')).toBe('Test B');
  });
});
