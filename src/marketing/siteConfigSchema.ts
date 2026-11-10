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

