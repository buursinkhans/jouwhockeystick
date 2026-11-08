/**
 * Trust copy (redesign fase 4, 2026-11-03): what we promise and how the site
 * differs from buying at one webshop. Every line is a rule the code already
 * keeps (CLAUDE.md, Commerce and Adviesengine), with the page that shows it.
 * No competitor is named: a comparison with a named shop must be objective
 * and verifiable per shop, and a shop may become a partner.
 */

export type TrustPromise = { title: string; body: string; proof: { label: string; href: string } };

export const PROMISES: readonly TrustPromise[] = [
  {
    title: 'De vergoeding telt nooit mee',
    body: 'Winkels betalen ons per aankoop. Die vergoeding zit niet in de adviesscore en bepaalt niet de volgorde van de winkels: die volgt de prijs incl. verzending.',
    proof: { label: 'Zo werkt ons advies', href: '/methodiek' },
  },
  {
    title: 'Bron en datum bij elk gegeven',
    body: 'Bij elke specificatie staat waar die vandaan komt (merk, winkel of onze inschatting) en wanneer we hem controleerden. Wat we niet weten, noemen we onbekend.',
    proof: { label: 'Bekijk een stickpagina', href: '/sticks/jdh-junior-mid-bow' },
  },
  {
    title: 'Actuele prijzen, geen kortingstrucs',
    body: 'We tonen de prijs uit de feed van de winkel met de datum erbij, nooit ouder dan 14 dagen. Geen doorgestreepte van-prijzen en geen labels die een winkel als koopje aanprijzen.',
    proof: { label: 'Waar koop je een stick?', href: '/kennis/waar-koop-je-een-hockeystick' },
  },
  {
    title: 'Eerlijk over de afweging',
    body: 'Elk advies zegt ook waar je op inlevert, en voor wie de stick minder past. Past er niets, dan zeggen we dat, in plaats van een eis los te laten.',
    proof: { label: 'Doe de stickwijzer', href: '/stickwijzer' },
  },
] as const;

/**
 * The order of the advice, said positively (redesign fase 6): fit first,
 * shops after. True by construction: the stickwijzer ranks sticks without
 * shop or fee input, and "Waar te koop" sorts on price incl. shipping.
 */
export const ORDER_PROMISE =
  'Eerst kiezen we de stick die bij de speler past. Pas daarna zie je waar hij te koop is, met per winkel de prijs, de verzendkosten en of jouw maat op voorraad is.';

/** One row of the comparison with buying at a single webshop; neutral about the shop. */
export type ComparisonRow = { topic: string; webshop: string; us: string };

export const COMPARISON_HEADING = 'Waarom niet meteen bij één webshop?';
export const COMPARISON_INTRO =
  'Een goede hockeywinkel helpt je prima. Het verschil zit in wat je naast elkaar ziet.';

export const comparisonRows = (facts: { brands: number; shops: number }): ComparisonRow[] => [
  {
    topic: 'Aanbod',
    webshop: 'Het assortiment van die ene winkel.',
    us: `Sticks van ${facts.brands} merken, bij ${facts.shops} partnerwinkels samen.`,
  },
  {
    topic: 'Prijs',
    webshop: 'Eén prijs, die van de winkel zelf.',
    us: `De prijzen van de partnerwinkels die hem verkopen (er zijn er ${facts.shops}) naast elkaar, inclusief verzending.`,
  },
  {
    topic: 'Keuze',
    webshop: 'Je filtert zelf, of vraagt een verkoper.',
    us: 'De maat en maximaal drie sticks bij jouw antwoorden, elk met de redenen.',
  },
  {
    topic: 'Gegevens',
    webshop: 'De productomschrijving van de winkel.',
    us: 'Bron en controledatum bij elk gegeven; merkgegevens waar we ze hebben.',
  },
  {
    topic: 'Belang',
    webshop: 'Verkoopt de stick zelf.',
    us: 'Verkoopt niets. De vergoeding van de winkel telt niet mee in het advies.',
  },
];
