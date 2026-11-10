import { describe, expect, it } from 'vitest';
import { addLessons, buildIssueBody, parseTicks, type Voorstel } from './voorstellenIssue';

const v = (id: string, o: Partial<Voorstel> = {}): Voorstel => ({ id, onderwerp: 'Welke lengte zaalstick', pagina: '/zaalsticks', vorm: 'carrousel', serie: 'maatje', punten: 4, redenen: ['Er is vraag.', 'Het past nu: Zaalseizoen.'], ...o });

describe('proposals issue', () => {
  it('builds checkboxes with hidden markers and the reasons below', () => {
    const body = buildIssueBody('47', [v('lengte-zaal')], [{ id: 'hook=vraag', tekst: 'Hooktype "vraag" doet het 30% beter dan gewoonlijk, over 6 posts.' }]);
    expect(body).toContain('- [ ] **Welke lengte zaalstick** (carrousel, maatje, /zaalsticks), 4 van 5 <!-- voorstel:lengte-zaal -->');
    expect(body).toContain('  - Het past nu: Zaalseizoen.');
    expect(body).toContain('- [ ] Hooktype "vraag" doet het 30% beter dan gewoonlijk, over 6 posts. <!-- les:hook=vraag -->');
    expect(body.replace(/<!--.*?-->/g, '')).not.toMatch(/[—–!]/);
  });

  it('keeps markup out of the text, so a subject cannot add a marker or close a comment', () => {
    const body = buildIssueBody('47', [v('x', { onderwerp: 'Lengte <!-- les:evil --> stick' })], []);
    expect(body).not.toContain('<!-- les:evil -->');
    expect(() => buildIssueBody('47', [v('kapot id')], [])).toThrow(/Ongeldige id/);
  });

  it('reads only the ticked lines', () => {
    const body = buildIssueBody('47', [v('a'), v('b')], [{ id: 'hook=vraag', tekst: 'Les een.' }, { id: 'vorm=beeld', tekst: 'Les twee.' }])
      .replace('- [ ] **Welke lengte zaalstick** (carrousel, maatje, /zaalsticks), 4 van 5 <!-- voorstel:b -->', '- [x] **Welke lengte zaalstick** (carrousel, maatje, /zaalsticks), 4 van 5 <!-- voorstel:b -->')
      .replace('- [ ] Les een. <!-- les:hook=vraag -->', '- [X] Les een. <!-- les:hook=vraag -->');
    expect(parseTicks(body)).toEqual({ voorstellen: ['b'], lessen: [{ id: 'hook=vraag', tekst: 'Les een.' }] });
  });
});

describe('addLessons', () => {
  const md = '# Merkplatform\n\n## Nooit\n\n- Kortingsclaims.\n';

  it('adds a section with the lesson once', () => {
    const once = addLessons(md, [{ id: 'hook=vraag', tekst: 'Les een.' }], '2026-11-20');
    expect(once).toContain('## Lessen uit de resultaten');
    expect(once).toContain('- Les een. (goedgekeurd 2026-11-20) <!-- les:hook=vraag -->');
    expect(addLessons(once, [{ id: 'hook=vraag', tekst: 'Les een.' }], '2026-11-27')).toBe(once);
  });

  it('adds to an existing section, before the next heading', () => {
    const withSection = '# M\n\n## Lessen uit de resultaten\n\n- Oud. <!-- les:a=b -->\n\n## Nooit\n\n- X.\n';
    const out = addLessons(withSection, [{ id: 'vorm=beeld', tekst: 'Nieuw.' }], '2026-11-20');
    expect(out).toBe('# M\n\n## Lessen uit de resultaten\n\n- Oud. <!-- les:a=b -->\n- Nieuw. (goedgekeurd 2026-11-20) <!-- les:vorm=beeld -->\n\n## Nooit\n\n- X.\n');
  });
});
