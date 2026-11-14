import { getFieldProducts } from '@/catalog';
import { BOW_LABELS, EXPERIENCE_LABELS } from '@/catalog/labels';
import { isJuniorStick } from '@/catalog/similar';
import type { Product } from '@/catalog/types';
import type { Article } from '../types';
import { formatEuro } from '../catalogLinks';
import { formatDutchDate } from '../schedule';

/**
 * "Wat kost een hockeystick?" (decision log 2026-11-13): the price question for
 * field sticks. Every price, count, carbon percentage and bow profile comes
 * from the catalog (indicative prices: the brand's list price or a shop price,
 * each with its own source and date); only the edges of the price classes and
 * the advice per class are fixed text. A missing value is never estimated.
 */

type Level = Product['experienceLevel']['value'];

/** Price classes for field sticks; the same edges as the indoor budget article, plus a top class. */
export const PRICE_CLASSES = [
  { id: 'tot-50', label: 'Tot €50', min: 0, max: 50, advice: 'De juiste lengte en een licht, soepel model. Voor een eerste seizoen of een kind dat snel groeit is dat genoeg.' },
  { id: '50-100', label: '€50 tot €100', min: 50, max: 100, advice: 'Een stap verder voor wie elke week traint en speelt. Let vooral op kromming en gewicht.' },
  { id: '100-200', label: '€100 tot €200', min: 100, max: 200, advice: 'Meer carbon en vaker een low bow. Dat past bij een stabiele techniek; test eerst of je de bal nog goed aanneemt.' },
  { id: 'vanaf-200', label: '€200 of meer', min: 200, max: undefined, advice: 'Stijf en direct, gemaakt voor ervaren spelers. Een slordige aanname kaatst sneller weg, en de meerprijs speel je alleen met een goede techniek terug.' },
] as const;

export type PriceClass = (typeof PRICE_CLASSES)[number];

const fieldSticks = (now: Date = new Date()) => getFieldProducts(now);
const price = (product: Product) => product.priceIndicativeEur.value;

export function inClass(product: Product, priceClass: PriceClass): boolean {
  const value = price(product);
  return value >= priceClass.min && (priceClass.max === undefined || value < priceClass.max);
}

/** The middle value of a list (the lower middle for an even count), or null for an empty list. */
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)]!;
}

/** Who the sticks of a class are for, as the brands label them, with the children's sticks. */
function forWhom(products: readonly Product[]): string {
  const counts = (['beginner', 'gevorderd', 'ervaren'] as Level[])
    .map((level) => [level, products.filter((p) => p.experienceLevel.value === level).length] as const)
    .filter(([, count]) => count > 0)
    .map(([level, count]) => `${EXPERIENCE_LABELS[level].toLowerCase()} ${count}`);
  const junior = products.filter(isJuniorStick).length;
  return `${counts.join(', ')}${junior > 0 ? `; waarvan ${junior} kinderstick${junior === 1 ? '' : 's'}` : ''}`;
}

function carbonCell(products: readonly Product[]): string {
  const known = products.flatMap((p) => (p.carbonPercentage ? [p.carbonPercentage.value] : []));
  if (known.length === 0) return 'niet vermeld';
  const middle = median(known)!;
  const low = Math.min(...known);
  const high = Math.max(...known);
  const range = low === high ? '' : ` (${low} tot ${high}%)`;
  return `rond ${middle}%${range}; bij ${known.length} van ${products.length} vermeld`;
}

function bowCell(products: readonly Product[]): string {
  const counts = new Map<string, number>();
  for (const p of products) {
    if (!p.bowProfile) continue;
    const label = BOW_LABELS[p.bowProfile.value].toLowerCase();
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const top = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 2).map(([label]) => label);
  if (top.length === 0) return 'niet vermeld';
  return top.length === 1 ? `vooral ${top[0]}` : `vooral ${top[0]}, ook ${top[1]}`;
}

/** One table row per price class, from the catalog. */
export function priceTableRows(now: Date = new Date()): string[][] {
  const sticks = fieldSticks(now);
  return PRICE_CLASSES.map((priceClass) => {
    const products = sticks.filter((p) => inClass(p, priceClass));
    if (products.length === 0) return [priceClass.label, 'geen sticks in onze catalogus', 'niet vermeld', 'niet vermeld', priceClass.advice];
    return [`${priceClass.label} (${products.length} sticks)`, forWhom(products), carbonCell(products), bowCell(products), priceClass.advice];
  });
}

/** The facts the text uses, from the catalog. */
export function priceFacts(now: Date = new Date()) {
  const sticks = fieldSticks(now);
  const prices = sticks.map(price);
  const of = (list: readonly Product[]) => median(list.map(price));
  const verified = sticks.map((p) => p.priceIndicativeEur.lastVerifiedAt).sort();
  return {
    count: sticks.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    juniorMedian: of(sticks.filter(isJuniorStick)),
    juniorCount: sticks.filter(isJuniorStick).length,
    juniorMax: Math.max(...sticks.filter(isJuniorStick).map(price)),
    medianFor: (level: Level) => of(sticks.filter((p) => p.experienceLevel.value === level && !isJuniorStick(p))),
    beginnerUnder100: sticks.filter((p) => p.experienceLevel.value === 'beginner').filter((p) => price(p) < 100).length,
    beginnerCount: sticks.filter((p) => p.experienceLevel.value === 'beginner').length,
    notAtBol: sticks.filter((p) => p.bolNotSold).length,
    verifiedFrom: verified[0] ?? null,
    verifiedTo: verified.at(-1) ?? null,
  };
}

const facts = priceFacts();
const euro = (value: number | null) => (value === null ? 'onbekend' : formatEuro(value));
const peildatum =
  facts.verifiedFrom && facts.verifiedTo
    ? `gecontroleerd tussen ${formatDutchDate(facts.verifiedFrom)} en ${formatDutchDate(facts.verifiedTo)}`
    : 'met de datum per stick';

export const watKostEenHockeystick: Article = {
  slug: 'wat-kost-een-hockeystick',
  title: 'Wat kost een hockeystick?',
  seoTitle: 'Wat kost een hockeystick? Prijzen per niveau',
  intro: `Een veldhockeystick kost in onze catalogus ${euro(facts.min)} tot ${euro(facts.max)}. Voor een kind of beginner ben je meestal onder de €100 klaar: de middelste prijs van een kinderstick is ${euro(facts.juniorMedian)}. Bij sticks voor gevorderde volwassenen ligt die rond ${euro(facts.medianFor('gevorderd'))}, bij sticks voor ervaren spelers rond ${euro(facts.medianFor('ervaren'))}. Duurder is niet vanzelf beter: de juiste lengte en een stick die bij je niveau past, tellen zwaarder dan de prijs.`,
  sections: [
    {
      heading: 'Wat kost een hockeystick per prijsklasse?',
      level: 2,
      body: [
        `In de tabel staan alle ${facts.count} veldhockeysticks uit onze catalogus, verdeeld over vier prijsklassen. "Voor wie" is het niveau dat het merk of de winkel noemt; een kinderstick is een stick die alleen in juniormaten bestaat.`,
        {
          type: 'table',
          columns: ['Prijsklasse', 'Voor wie (aantal sticks)', 'Carbon (middelste waarde)', 'Bow', 'Waar je op let'],
          rows: priceTableRows(),
        },
        `Dit zijn richtprijzen: de adviesprijs van het merk of een winkelprijs, ${peildatum}. Op de pagina van elke stick staan de bron en de datum, en de actuele prijzen bij onze partnerwinkels. Staat er geen carbonpercentage of bow bij een stick, dan telt hij daar niet mee; we gokken niet.`,
      ],
    },
    {
      heading: 'Is een duurdere hockeystick beter?',
      level: 2,
      body: [
        'Niet vanzelf. Een duurdere stick heeft meestal meer carbon en is daardoor stijver en directer. Dat helpt een speler die de bal al zuiver aanneemt en slaat. Wie de basis nog leert, merkt vooral dat een stijve stick minder vergeeft: de bal springt sneller weg.',
        'De prijs hangt ook af van merk, constructie en afwerking. Hoeveel carbon bij jou past, lees je in [hoeveel carbon heeft je hockeystick nodig?](/kennis/meer-carbon-hockeystick-beter).',
      ],
    },
    {
      heading: 'Wanneer is een goedkope stick prima?',
      level: 2,
      body: [
        `Voor een kind of iemand die net begint, is een eenvoudige stick een goede keuze. Een rustige kromming en weinig of geen carbon maken aannemen en vlak passen makkelijker. Van de ${facts.beginnerCount} sticks die merken voor beginners maken, kosten er ${facts.beginnerUnder100} minder dan €100.`,
        'Na een seizoen weet je veel beter wat je fijn vindt, en dan is een volgende stick een logische stap. Waar een eerste stick aan moet voldoen, staat in [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
      ],
    },
    {
      heading: 'Waarom de maat belangrijker is dan de prijs',
      level: 2,
      body: [
        'Een dure stick in de verkeerde lengte speelt slechter dan een goedkope in de juiste. Met een te lange stick worden dribbelen en aannemen lastiger. Koop een kinderstick daarom niet extra lang om in te groeien.',
        'Laat een lage prijs dus nooit voor de maat gaan: is een stick er niet in de juiste lengte, dan valt hij af. Per lichaamslengte zie je de maat in de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel).',
      ],
    },
    {
      heading: 'Waar zie je de actuele prijs?',
      level: 2,
      body: [
        `Op de pagina van elke stick staat bij "Waar te koop" welke van onze partnerwinkels hem verkopen, met de prijs inclusief verzending als de winkel die kent. Dat zijn partnerlinks: koop je via zo'n link, dan krijgen wij een kleine vergoeding van de winkel, en de winkel is de verkoper. De vergoeding telt niet mee in ons advies. Niet elke stick is bij bol.com te koop (${facts.notAtBol} van de ${facts.count} niet); die staan gewoon in de tabel en in de stickwijzer.`,
        'De verschillen tussen de winkels in verzending, retour en bezorging vind je in [waar koop je een hockeystick?](/kennis/waar-koop-je-een-hockeystick).',
      ],
    },
    {
      heading: 'Veelgestelde vragen',
      level: 2,
      body: [],
    },
    {
      heading: 'Is een goedkope hockeystick slecht?',
      level: 3,
      body: [
        'Nee. Een goedkope stick is vaak soepeler en heeft minder carbon, en dat is voor een kind of beginner juist een voordeel. Let wel op de lengte: die is belangrijker dan de prijs.',
      ],
    },
    {
      heading: 'Wat kost een kinderstick?',
      level: 3,
      body: [
        `In onze catalogus staan ${facts.juniorCount} kindersticks (sticks die alleen in juniormaten bestaan). De middelste richtprijs is ${euro(facts.juniorMedian)} en de duurste kost ${euro(facts.juniorMax)}. Voor een kind dat nog leert, is een eenvoudige, soepele stick in de juiste lengte meestal genoeg.`,
      ],
    },
    {
      heading: 'Wanneer is een dure stick het waard?',
      level: 3,
      body: [
        'Als je vaak speelt, je aanname en slag goed zijn en je weet welke kromming en welk stickgevoel je fijn vindt. Dan kan een stijve stick met veel carbon bij harde passes en slagen directer aanvoelen. Probeer hem bij voorkeur eerst, of vergelijk hem met een goedkoper model met dezelfde kromming.',
      ],
    },
    {
      heading: 'Wat kost een zaalhockeystick?',
      level: 3,
      body: [
        'Een zaalstick is een aparte keuze, met eigen prijzen. Wat je per budget krijgt, lees je in [zaalstick: wat krijg je voor een klein of ruim budget?](/kennis/zaalstick-budget).',
      ],
    },
    {
      heading: 'Welke stick past bij jouw budget?',
      level: 2,
      body: [
        'In het [snelle advies](/stickwijzer?snel) vul je leeftijd, lengte, ervaring en budget in, en zie je sticks in de juiste maat die binnen je budget vallen, met de redenen erbij. Wil je ook je speelwensen meegeven, doe dan de volledige [stickwijzer](/stickwijzer).',
        {
          type: 'note',
          text: 'Wij testen sticks niet zelf. De prijzen en specificaties komen van merken en winkels, met de bron per stick; het advies per prijsklasse is onze eigen vertaling daarvan, geen garantie voor hoe een stick bij jou voelt.',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-11-13',
  updatedAt: '2026-11-14',
  sources: [
    {
      label: `Richtprijzen, carbonpercentage, bow-profiel en niveau: de productpagina's op deze site (${facts.count} veldhockeysticks), met bron en datum per gegeven; ${peildatum}`,
    },
    {
      label: 'Prijsklassen en het advies per prijsklasse: redactionele uitgangspunten jouwhockeystick.nl (geen eigen testresultaten of prestatiegaranties)',
    },
  ],
  metaDescription:
    'Wat kost een hockeystick? Prijzen per prijsklasse met niveau, carbon en bow, uit onze catalogus, en waarom de juiste maat zwaarder weegt dan de prijs.',
};
