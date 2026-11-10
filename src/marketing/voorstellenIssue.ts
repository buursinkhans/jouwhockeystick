/**
 * The weekly proposals issue (docs/marketing/onderzoeker.md, owner decision
 * 2026-11-10): the Onderzoeker writes ten proposals and the lesson
 * candidates as checkboxes in one GitHub issue; the owner ticks them in the
 * GitHub app; the Social-planner reads the ticked proposals, and the workflow
 * lessen.yml turns ticked lessons into a small PR to merkplatform.md. Pure:
 * build the body, read the ticks, add lessons to the brand platform.
 */
export const ISSUE_LABEL = 'social-voorstellen';

export type Voorstel = {
  id: string;
  onderwerp: string;
  pagina: string | null;
  vorm: 'carrousel' | 'beeld' | 'video';
  serie: string | null;
  punten: number;
  redenen: string[];
};

export type LesVoorstel = { id: string; tekst: string };

const ID = /^[a-z0-9=._-]{1,80}$/i;
const clean = (t: string) => t.replace(/[\r\n<>]+/g, ' ').replace(/\s+/g, ' ').trim();

/** The issue body: one checkbox per proposal and per lesson, each with a hidden marker the readers use. */
export function buildIssueBody(week: string, voorstellen: readonly Voorstel[], lessen: readonly LesVoorstel[]): string {
  const lines = [
    `Voorstellen van de Onderzoeker voor week ${week}. Vink aan wat de Social-planner vrijdag moet maken. Niets aanvinken mag: dan kiest de planner zelf.`,
    '',
    '## Voorstellen',
    '',
  ];
  for (const v of voorstellen) {
    if (!ID.test(v.id)) throw new Error(`Ongeldige id: ${v.id}`);
    const meta = [v.vorm, v.serie, v.pagina ?? 'nog geen pagina'].filter(Boolean).join(', ');
    lines.push(`- [ ] **${clean(v.onderwerp)}** (${clean(meta)}), ${v.punten} van 5 <!-- voorstel:${v.id} -->`);
    for (const r of v.redenen) lines.push(`  - ${clean(r)}`);
  }
  lines.push('', '## Lessen uit de resultaten', '');
  if (!lessen.length) lines.push('Nog geen lessen: daarvoor zijn per variant minstens 5 posts met een resultaat nodig.');
  for (const l of lessen) {
    if (!ID.test(l.id)) throw new Error(`Ongeldige id: ${l.id}`);
    lines.push(`- [ ] ${clean(l.tekst)} <!-- les:${l.id} -->`);
  }
  lines.push('', 'Een aangevinkte les wordt een kleine pull request naar docs/marketing/merkplatform.md. Mergen is goedkeuren.');
  return lines.join('\n') + '\n';
}

/** The ticked proposals and lessons: ids from the markers on checked lines. */
export function parseTicks(body: string): { voorstellen: string[]; lessen: { id: string; tekst: string }[] } {
  const voorstellen: string[] = [];
  const lessen: { id: string; tekst: string }[] = [];
  for (const line of body.split('\n')) {
    const m = /^- \[[xX]\] (.*?)\s*<!-- (voorstel|les):([a-z0-9=._-]{1,80}) -->\s*$/i.exec(line.trim());
    if (!m) continue;
    if (m[2]!.toLowerCase() === 'voorstel') voorstellen.push(m[3]!);
    else lessen.push({ id: m[3]!, tekst: clean(m[1]!) });
  }
  return { voorstellen, lessen };
}

export const LESSONS_HEADING = '## Lessen uit de resultaten';

/**
 * merkplatform.md with the lessons added under their own heading, each once
 * (by id), with the date. Returns the text unchanged when every lesson is in.
 */
export function addLessons(markdown: string, lessen: readonly { id: string; tekst: string }[], date: string): string {
  const fresh = lessen.filter((l) => ID.test(l.id) && !markdown.includes(`<!-- les:${l.id} -->`));
  if (!fresh.length) return markdown;
  const lines = fresh.map((l) => `- ${clean(l.tekst)} (goedgekeurd ${date}) <!-- les:${l.id} -->`);
  if (markdown.includes(LESSONS_HEADING)) {
    const at = markdown.indexOf(LESSONS_HEADING) + LESSONS_HEADING.length;
    const next = markdown.indexOf('\n## ', at);
    const end = next === -1 ? markdown.length : next;
    const section = markdown.slice(at, end).replace(/\s+$/, '');
    return markdown.slice(0, at) + section + '\n' + lines.join('\n') + '\n' + markdown.slice(end);
  }
  return markdown.replace(/\s*$/, '\n') + `\n${LESSONS_HEADING}\n\nWat de resultaten lieten zien, aangevinkt door de eigenaar. De planner houdt er rekening mee.\n\n${lines.join('\n')}\n`;
}
