/**
 * The KPIs of the Weekrapport (docs/marketing/weekrapport.md, bouwplan 2.0
 * fase 4). One north star, a funnel, learning and health, per market, each
 * compared with the average of the 4 weeks before. No targets set in advance:
 * the report shows what happened. Orders are counts only, never amounts (the
 * repository is public). Pure: the Weekrapport gathers the numbers.
 */
export type WeekNumbers = {
  /** ISO week, e.g. "2026-W47". */
  week: string;
  markt: string;
  /** Sum over the channels in Metricool. */
  bereik: number;
  bewaard: number;
  gedeeld: number;
  /** PostHog, from the Conversie report: visits with utm_medium=social, and the north-star event from them (`noordster` in the site configuration). */
  sitebezoekSocial: number;
  noordsterSocial: number;
  /** Shop clicks and orders after a social visit; counts only. */
  winkelkliks: number;
  bestellingen: number;
  /** Viewers who stay (share of the video watched), per hook type. */
  blijvenPerHook: Record<string, { posts: number; blijven: number }>;
  /** Health. */
  gepland: number;
  ritme: number;
  tegoedGebruikt: number;
  tegoedGrens: number;
  fouten: number;
  /** Median hours from created to approved, or null without approvals. */
  uurTotGoedkeuring: number | null;
};

export type Kpis = {
  week: string;
  markt: string;
  noordster: number;
  trechter: { bereik: number; bewaardPer1000: number | null; gedeeldPer1000: number | null; sitebezoek: number; winkelkliks: number; bestellingen: number };
  leren: { hook: string; posts: number; blijven: number }[];
  gezondheid: { gepland: number; ritme: number; tegoed: string; fouten: number; uurTotGoedkeuring: number | null };
};

const per1000 = (n: number, reach: number) => (reach > 0 ? Math.round((n / reach) * 1000 * 10) / 10 : null);

export function kpis(w: WeekNumbers): Kpis {
  return {
    week: w.week,
    markt: w.markt,
    noordster: w.noordsterSocial,
    trechter: {
      bereik: w.bereik,
      bewaardPer1000: per1000(w.bewaard, w.bereik),
      gedeeldPer1000: per1000(w.gedeeld, w.bereik),
      sitebezoek: w.sitebezoekSocial,
      winkelkliks: w.winkelkliks,
      bestellingen: w.bestellingen,
    },
    leren: Object.entries(w.blijvenPerHook)
      .map(([hook, v]) => ({ hook, posts: v.posts, blijven: v.blijven }))
      .sort((a, b) => b.blijven - a.blijven),
    gezondheid: { gepland: w.gepland, ritme: w.ritme, tegoed: `${w.tegoedGebruikt} van ${w.tegoedGrens}`, fouten: w.fouten, uurTotGoedkeuring: w.uurTotGoedkeuring },
  };
}

export type Comparison = { waarde: number | null; gemiddelde4: number | null; verschilPct: number | null };

/** A number against the average of the weeks before (at most 4, nulls left out). */
export function compareToAverage(value: number | null, previous: readonly (number | null)[]): Comparison {
  const prev = previous.slice(-4).filter((x): x is number => typeof x === 'number');
  const avg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : null;
  const pct = value !== null && avg !== null && avg !== 0 ? Math.round(((value - avg) / avg) * 100) : null;
  return { waarde: value, gemiddelde4: avg === null ? null : Math.round(avg * 10) / 10, verschilPct: pct };
}

/** The numbers the report compares, by name, for one market's weeks (oldest first, this week last). */
/** `noordsterNaam`: the name of the north star in the site configuration (`noordster.naam`). */
export function weekComparison(weeks: readonly Kpis[], noordsterNaam: string): Record<string, Comparison> {
  const now = weeks.at(-1);
  if (!now) return {};
  const before = weeks.slice(0, -1);
  const pick: Record<string, (k: Kpis) => number | null> = {
    [noordsterNaam]: (k) => k.noordster,
    Bereik: (k) => k.trechter.bereik,
    'Bewaard per 1.000 bereik': (k) => k.trechter.bewaardPer1000,
    'Gedeeld per 1.000 bereik': (k) => k.trechter.gedeeldPer1000,
    'Sitebezoek via social': (k) => k.trechter.sitebezoek,
    Winkelkliks: (k) => k.trechter.winkelkliks,
    Bestellingen: (k) => k.trechter.bestellingen,
  };
  return Object.fromEntries(Object.entries(pick).map(([name, f]) => [name, compareToAverage(f(now), before.map(f))]));
}
