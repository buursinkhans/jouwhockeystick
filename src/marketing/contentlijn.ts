/**
 * Recurring content lines (docs/marketing/merkplatform.md, "Contentlijnen";
 * config `contentlijnen` in marketing/sites/<site>.json). A line fills fixed
 * slots of the existing rhythm with a sub-theme and a live page, so it adds no
 * second calendar and no extra posts. Pure: the planner gathers the history and
 * the live pages and passes them in; no clock inside.
 *
 * Choice per slot, in this order:
 * 1. the setting (omgeving) that lags its seasonal share most over the last
 *    `WINDOW` items of the line;
 * 2. within it, a sub-theme the season stresses (`nadruk`, in order), then the
 *    one used longest ago;
 * 3. a page of that sub-theme in that setting that is live and rested.
 * A sub-theme rests `rustDagen.subthema` days and a page `rustDagen.pagina`
 * days, so the same message does not come back without a new angle.
 */
import type { SiteConfig } from './siteConfig';

export type ContentLine = NonNullable<SiteConfig['contentlijnen']>[number];
export type Season = ContentLine['seizoenen'][number];

/**
 * One earlier item: from the studio (fields contentlijn, subthema, omgeving,
 * pagina, datum). An item outside the line goes in with an empty subthema and
 * omgeving: it then only counts for the rest of its page.
 */
export type LineItem = { datum: string; subthema: string; pagina: string; omgeving: string; soort?: 'post' | 'video' };

export type Pick = {
  datum: string;
  soort: 'post' | 'video';
  subthema: string;
  vraag: string;
  pagina: string;
  omgeving: string;
  pijler: string;
  methode: string;
  seizoen: string;
  redenen: string[];
};

/** Items of the line the share is measured over. */
export const WINDOW = 8;

const DAY = 86_400_000;
const daysBetween = (a: string, b: string) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY;
const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'] as const;

/** The content line with this id. */
export function contentLine(config: SiteConfig, lineId: string): ContentLine {
  const line = (config.contentlijnen ?? []).find((l) => l.id === lineId);
  if (!line) throw new Error(`Onbekende contentlijn: ${lineId}`);
  return line;
}

/** True when MM-DD `md` lies in [van, tot]; a period may run over the new year (11-01 to 01-31). */
function inPeriod(md: string, van: string, tot: string): boolean {
  return van <= tot ? md >= van && md <= tot : md >= van || md <= tot;
}

/** The season of the line on a date. */
export function seasonOn(line: ContentLine, date: string): Season {
  const md = date.slice(5, 10);
  const season = line.seizoenen.find((s) => inPeriod(md, s.van, s.tot));
  if (!season) throw new Error(`Geen seizoen van ${line.id} op ${date}`);
  return season;
}

/** Share per setting over the last WINDOW items before `date`. */
export function sharesBefore(line: ContentLine, history: readonly LineItem[], date: string): Record<string, number> {
  const recent = [...history].filter((h) => h.datum < date && line.omgevingen.includes(h.omgeving)).sort((a, b) => a.datum.localeCompare(b.datum)).slice(-WINDOW);
  return Object.fromEntries(line.omgevingen.map((o) => [o, recent.length ? recent.filter((h) => h.omgeving === o).length / recent.length : 0]));
}

/**
 * The sub-theme and page for one slot, or null with the reason when nothing
 * fits (then the planner leaves the slot to its normal choice and says so).
 * `livePages` are the paths that are online today; a page not in it is never chosen.
 */
export function pickForSlot(
  line: ContentLine,
  slot: { datum: string; soort: 'post' | 'video' },
  history: readonly LineItem[],
  livePages: readonly string[],
): Pick | { geen: string } {
  const season = seasonOn(line, slot.datum);
  const live = new Set(livePages);
  const before = history.filter((h) => h.datum < slot.datum);
  const lastUse = (pred: (h: LineItem) => boolean) =>
    before.filter(pred).reduce<string | null>((a, h) => (a === null || h.datum > a ? h.datum : a), null);
  const rested = (last: string | null, days: number) => last === null || daysBetween(last, slot.datum) >= days;

  const shares = sharesBefore(line, history, slot.datum);
  const settings = [...line.omgevingen]
    .filter((o) => (season.aandeel[o] ?? 0) > 0)
    .sort((a, b) => (season.aandeel[b] ?? 0) - (shares[b] ?? 0) - ((season.aandeel[a] ?? 0) - (shares[a] ?? 0)) || line.omgevingen.indexOf(a) - line.omgevingen.indexOf(b));

  const stress = (id: string) => {
    const i = season.nadruk.indexOf(id);
    return i === -1 ? season.nadruk.length : i;
  };

  for (const omgeving of settings) {
    const subjects = line.subthemas
      .filter((s) => rested(lastUse((h) => h.subthema === s.id), line.rustDagen.subthema))
      .map((s) => ({ s, last: lastUse((h) => h.subthema === s.id) }))
      .sort((a, b) => stress(a.s.id) - stress(b.s.id) || (a.last ?? '').localeCompare(b.last ?? '') || line.subthemas.indexOf(a.s) - line.subthemas.indexOf(b.s));
    for (const { s, last } of subjects) {
      const page = s.paginas.find(
        (p) => p.omgeving === omgeving && live.has(p.pad) && rested(lastUse((h) => h.pagina === p.pad), line.rustDagen.pagina),
      );
      if (!page) continue;
      const doel = Math.round((season.aandeel[omgeving] ?? 0) * 100);
      const nu = Math.round((shares[omgeving] ?? 0) * 100);
      return {
        datum: slot.datum,
        soort: slot.soort,
        subthema: s.id,
        vraag: s.vraag,
        pagina: page.pad,
        omgeving,
        pijler: s.pijler,
        methode: s.methode,
        seizoen: season.id,
        redenen: [
          `${season.naam}: ${omgeving} krijgt ongeveer ${doel}%, de laatste items ${nu}%.`,
          season.nadruk.includes(s.id) ? `${s.naam} heeft in dit seizoen voorrang.` : `${s.naam} ${last ? `was het langst geleden (${last}).` : 'had nog geen item.'}`,
          `${page.pad} staat live en had de laatste ${line.rustDagen.pagina / 7} weken geen item van deze lijn.`,
        ],
      };
    }
  }
  return { geen: 'Geen subthema met een live, uitgeruste pagina; vul dit slot op de gewone manier.' };
}

/** The slot days of the line from the week of `from` (its Monday) for `weeks` weeks. */
export function slotsFrom(line: ContentLine, from: string, weeks: number): { datum: string; soort: 'post' | 'video' }[] {
  const d = new Date(`${from}T00:00:00Z`);
  const monday = addDays(from, -((d.getUTCDay() + 6) % 7));
  const out: { datum: string; soort: 'post' | 'video' }[] = [];
  for (let w = 0; w < weeks; w++) {
    const start = addDays(monday, w * 7);
    out.push({ datum: addDays(start, WEEKDAYS.indexOf(line.slots.post)), soort: 'post' });
    out.push({ datum: addDays(start, WEEKDAYS.indexOf(line.slots.video)), soort: 'video' });
  }
  return out.sort((a, b) => a.datum.localeCompare(b.datum) || a.soort.localeCompare(b.soort));
}

/**
 * A plan for the coming weeks: one pick per slot. A slot that already has a
 * line item in `history` is kept as it is (it counts, it is not planned twice).
 */
export function planLine(
  line: ContentLine,
  from: string,
  weeks: number,
  history: readonly LineItem[],
  livePages: readonly string[],
): (Pick | (LineItem & { soort: 'post' | 'video'; bestaand: true }) | { datum: string; soort: 'post' | 'video'; geen: string })[] {
  const done = [...history];
  return slotsFrom(line, from, weeks).map((slot) => {
    const existing = history.find((h) => h.datum === slot.datum && h.soort === slot.soort);
    if (existing) return { ...existing, soort: slot.soort, bestaand: true as const };
    const pick = pickForSlot(line, slot, done, livePages);
    if ('geen' in pick) return { ...slot, geen: pick.geen };
    done.push({ datum: pick.datum, subthema: pick.subthema, pagina: pick.pagina, omgeving: pick.omgeving, soort: pick.soort });
    return pick;
  });
}

/** The UTM fields of an item in the line; utm_medium and utm_source follow the existing standard (utm.ts). */
export const lineUtm = (line: ContentLine, itemId: string) => {
  if (!/^[a-z0-9-]+$/.test(itemId)) throw new Error(`Ongeldige id: ${itemId}`);
  return { utm_campaign: line.utmCampagne, utm_content: itemId };
};

/** Pages of the line that are not live: each should be fixed in the configuration before it is used. */
export const missingPages = (line: ContentLine, livePages: readonly string[]) => {
  const live = new Set(livePages);
  return [...new Set(line.subthemas.flatMap((s) => s.paginas.map((p) => p.pad)).concat(line.hub))].filter((p) => !live.has(p));
};
