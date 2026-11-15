/**
 * The Zod schema of the site configuration (marketing/sites/<site>.json). The
 * tests and CI check every configuration with it. The engine itself loads the
 * file without Zod (siteConfig.ts), because it also runs in a cloud session
 * where npm is not reachable.
 */
import { z } from 'zod';

const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
const monthDay = z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'MM-DD');
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const id = z.string().regex(/^[a-z0-9-]{1,40}$/);
const weekday = z.enum(['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']);

const momentSchema = z.object({ id, naam: z.string().min(2), van: monthDay, tot: monthDay, pijler: id });
const pushSchema = momentSchema.extend({ vervolgstap: z.string().min(2) });

const pagePath = z.string().regex(/^\/[a-z0-9/-]*$/);

/**
 * A recurring content line (docs/marketing/merkplatform.md, "Contentlijnen"):
 * a buyer question that returns all year with fixed sub-themes. A line sits
 * above the pillars; every sub-theme hangs from one pillar, so nothing is
 * classified twice. The line fills fixed slots of the existing rhythm and adds
 * none. `aandeel` per season is a starting share per setting (omgeving), not a
 * rule: the Onderzoeker may propose other shares through a lesson.
 */
export const contentLineSchema = z.object({
  id,
  naam: z.string().min(3),
  /** Short label on a studio card. */
  label: z.string().min(2).max(12),
  /** utm_campaign of every item in the line; utm_content stays the item id. */
  utmCampagne: z.string().regex(/^[a-z0-9-]{2,60}$/),
  /** The central page of the line. */
  hub: pagePath,
  /** Which day of the rhythm the line takes for its post and its video. */
  slots: z.object({ post: weekday, video: weekday }),
  /** Days a page, and a sub-theme, rest before the line uses them again. */
  rustDagen: z.object({ pagina: z.number().int().min(0), subthema: z.number().int().min(0) }),
  omgevingen: z.array(id).min(1),
  methode: z.array(z.object({ id, naam: z.string().min(2) })).min(1),
  subthemas: z
    .array(
      z.object({
        id,
        naam: z.string().min(2),
        /** The buyer question the sub-theme answers. */
        vraag: z.string().min(5),
        pijler: id,
        methode: id,
        paginas: z.array(z.object({ pad: pagePath, omgeving: id })).min(1),
      }),
    )
    .min(1),
  seizoenen: z
    .array(
      z.object({
        id,
        naam: z.string().min(2),
        van: monthDay,
        tot: monthDay,
        /** Starting share per setting; sums to 1. */
        aandeel: z.record(id, z.number().min(0).max(1)),
        /** Sub-themes that go first in this season, in order. */
        nadruk: z.array(id),
      }),
    )
    .min(1),
});

export const marketSchema = z.object({
  id: z.string().regex(/^[A-Z]{2}$/),
  actief: z.boolean(),
  actiefNotitie: z.string().optional(),
  /** Words of the home market and how this market says them; empty for the home market itself. */
  woordenlijst: z.record(z.string().min(1), z.string().min(1)),
  kalender: z.array(momentSchema),
  push: z.array(pushSchema),
});

export const siteConfigSchema = z
  .object({
    merk: z.object({ naam: z.string(), domein: z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/), payoff: z.string(), kernzin: z.string(), belofte: z.string(), doelgroep: z.string() }),
    huisstijl: z.object({
      kleuren: z.object({ primair: hex, inkt: hex, accent: hex, licht: hex, secundair: hex, lichtOpPrimair: hex, rand: hex }),
      lettertypes: z.object({ kop: z.string(), tekst: z.string() }),
      accentRegel: z.string(),
    }),
    /** The one number the machine steers on: its name and the analytics event, counted for visits from social. */
    noordster: z.object({ naam: z.string().min(3), event: z.string().regex(/^[a-z_]{2,40}$/) }),
    kanalen: z.array(z.enum(['instagram', 'facebook', 'youtube', 'tiktok'])).min(1),
    ritme: z.object({ posts: z.number().int().min(0), videos: z.number().int().min(0), postdagen: z.array(weekday), videodagen: z.array(weekday) }),
    tijden: z.record(z.string(), time),
    metricool: z.object({ merk: z.string().regex(/^\d+$/), tijdzone: z.string(), maandlimiet: z.number().int().positive() }),
    pijlers: z.array(z.object({ id, naam: z.string() })).min(1),
    series: z.array(z.object({ id, naam: z.string(), label: z.string().optional() })),
    partnerlinkZin: z.string().min(10),
    /** Regular expressions (case-insensitive) for claims the site never makes. */
    verbodenClaims: z.array(z.string().min(2)),
    /** Month (1-12) a season year starts. */
    seizoenStart: z.number().int().min(1).max(12),
    /** Recurring content lines; none is fine. */
    contentlijnen: z.array(contentLineSchema).default([]),
    markten: z.array(marketSchema).min(1),
  })
  .superRefine((c, ctx) => {
    const pillars = new Set(c.pijlers.map((p) => p.id));
    c.markten.forEach((m, i) =>
      [...m.kalender, ...m.push].forEach((x) => {
        if (!pillars.has(x.pijler)) ctx.addIssue({ code: 'custom', path: ['markten', i], message: `Onbekende pijler ${x.pijler} bij ${x.id}` });
      }),
    );
    c.verbodenClaims.forEach((r, i) => {
      try { new RegExp(r, 'i'); } catch { ctx.addIssue({ code: 'custom', path: ['verbodenClaims', i], message: `Geen geldige expressie: ${r}` }); }
    });
    if (c.ritme.postdagen.length !== c.ritme.posts || c.ritme.videodagen.length !== c.ritme.videos) {
      ctx.addIssue({ code: 'custom', path: ['ritme'], message: 'Het aantal dagen past niet bij het ritme.' });
    }
    c.contentlijnen.forEach((l, i) => {
      const at = ['contentlijnen', i];
      const issue = (message: string) => ctx.addIssue({ code: 'custom', path: at, message: `${l.id}: ${message}` });
      if (!c.ritme.postdagen.includes(l.slots.post)) issue(`postdag ${l.slots.post} hoort niet bij het ritme.`);
      if (!c.ritme.videodagen.includes(l.slots.video)) issue(`videodag ${l.slots.video} hoort niet bij het ritme.`);
      const settings = new Set(l.omgevingen);
      const steps = new Set(l.methode.map((m) => m.id));
      const subjects = new Set<string>();
      for (const s of l.subthemas) {
        if (subjects.has(s.id)) issue(`subthema ${s.id} staat er twee keer in.`);
        subjects.add(s.id);
        if (!pillars.has(s.pijler)) issue(`Onbekende pijler ${s.pijler} bij ${s.id}.`);
        if (!steps.has(s.methode)) issue(`Onbekende methodestap ${s.methode} bij ${s.id}.`);
        for (const p of s.paginas) if (!settings.has(p.omgeving)) issue(`Onbekende omgeving ${p.omgeving} bij ${s.id}.`);
      }
      for (const s of l.seizoenen) {
        const shares = Object.entries(s.aandeel);
        for (const [k] of shares) if (!settings.has(k)) issue(`Onbekende omgeving ${k} in seizoen ${s.id}.`);
        const sum = shares.reduce((a, [, v]) => a + v, 0);
        if (Math.abs(sum - 1) > 0.001) issue(`het aandeel in seizoen ${s.id} telt op tot ${sum}, niet tot 1.`);
        for (const n of s.nadruk) if (!subjects.has(n)) issue(`Onbekend subthema ${n} in seizoen ${s.id}.`);
      }
    });
  });

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type MarketConfig = z.infer<typeof marketSchema>;

/** Checks a configuration; throws with the first problem in Dutch. */
export function parseSiteConfig(raw: unknown): SiteConfig {
  const r = siteConfigSchema.safeParse(raw);
  if (!r.success) {
    const first = r.error.issues[0];
    throw new Error(`De configuratie klopt niet: ${first ? `${first.path.join('.')}: ${first.message}` : 'onbekende fout'}`);
  }
  return r.data;
}

