import { getIndoorProducts } from '@/catalog';
import { BOW_LABELS } from '@/catalog/labels';
import type { Product } from '@/catalog/types';
import type { Article } from '../types';
import { ZAAL_SOURCES } from '../zaal';
import { byPrice, formatEuro, stickListItem } from '../catalogLinks';

type Tier = {
  heading: string;
  label: string;
  products: Product[];
};

const indoorSticks = getIndoorProducts().sort(byPrice);
const price = (product: Product) => product.priceIndicativeEur.value;

const tiers: Tier[] = [
  {
    heading: 'Onder €50',
    label: 'onder €50',
    products: indoorSticks.filter((p) => price(p) < 50),
  },
  {
    heading: 'Van €50 tot €100',
    label: 'tussen €50 en €100',
    products: indoorSticks.filter((p) => price(p) >= 50 && price(p) < 100),
  },
  {
    heading: 'Vanaf €100',
    label: 'vanaf €100',
    products: indoorSticks.filter((p) => price(p) >= 100),
  },
];

const inch = (value: number) => String(value).replace('.', ',');

function listItem(product: Product): string {
  const details = [
    product.carbonPercentage
      ? `${product.carbonPercentage.value}% carbon`
      : 'carbonpercentage niet opgegeven',
    product.bowProfile
      ? BOW_LABELS[product.bowProfile.value].toLowerCase()
      : 'bow-profiel niet opgegeven',
  ];
  const availability = product.bolNotSold ? ' — niet verkrijgbaar bij bol.com' : '';
  return `${stickListItem(product)} (${details.join(', ')})${availability}`;
}

/** Describes what the catalog states for a tier; never fills gaps with guesses. */
function tierSummary(tier: Tier): string {
  const { products } = tier;
  if (products.length === 0) {
    return `In onze catalogus staat op dit moment geen zaalstick ${tier.label}.`;
  }
  const parts: string[] = [
    `In onze catalogus staan ${products.length} zaalsticks ${tier.label}, met richtprijzen van ${formatEuro(Math.min(...products.map(price)))} tot ${formatEuro(Math.max(...products.map(price)))}.`,
  ];

  const carbon = products.flatMap((p) =>
    p.carbonPercentage ? [p.carbonPercentage.value] : [],
  );
  if (carbon.length > 0) {
    const low = Math.min(...carbon);
    const high = Math.max(...carbon);
    const range = low === high ? `${low}%` : `${low}% tot ${high}%`;
    parts.push(
      `Bij ${carbon.length} van de ${products.length} staat een carbonpercentage in de bron: ${range}.`,
    );
  } else {
    parts.push('Bij geen van deze sticks staat een carbonpercentage in de bron.');
  }

  const bows = [
    ...new Set(
      products.flatMap((p) =>
        p.bowProfile ? [BOW_LABELS[p.bowProfile.value].toLowerCase()] : [],
      ),
    ),
  ];
  if (bows.length > 0) {
    parts.push(`Genoemde bow-profielen: ${bows.join(', ')}.`);
  }

  const lengths = products.flatMap((p) => p.lengthsInches.value);
  if (lengths.length > 0) {
    parts.push(
      `De maten lopen van ${inch(Math.min(...lengths))} tot ${inch(Math.max(...lengths))} inch.`,
    );
  }

  const notSold = products.filter((p) => p.bolNotSold).length;
  if (notSold > 0) {
    parts.push(
      `${notSold} van deze sticks is volgens onze controle niet verkrijgbaar bij bol.com; dat staat erbij.`,
    );
  }
  return parts.join(' ');
}

export const zaalstickBudget: Article = {
  slug: 'zaalstick-budget',
  title: 'Zaalstick: wat krijg je voor een klein of ruim budget?',
  intro:
    'Wat je voor een zaalstick betaalt, zie je vooral terug in materiaal, het carbonpercentage, het bow-profiel en de beschikbare maten. Of een duurdere stick ook beter speelt, kunnen we niet zeggen: dat hangt af van je techniek en wat je prettig vindt. Hieronder zie je per prijsniveau wat onze catalogus noemt, met voorbeelden. De prijzen zijn adviesprijzen, geen live bol.com-prijzen.',
  sections: [
    {
      heading: 'Hoe lees je deze prijzen?',
      level: 2,
      body: [
        'Alle prijzen op deze pagina zijn richtprijzen uit onze catalogus, met bron en datum op de productpagina. Het zijn geen actuele bol.com-prijzen: controleer de prijs en de leverbare maat bij bol.com, de verkoper. Kortingen noemen we niet.',
        'De tekst per niveau wordt uit de catalogus opgebouwd. Staat een gegeven niet in de bron, dan laten we het weg in plaats van het te raden.',
      ],
    },
    ...tiers.flatMap((tier): Article['sections'] => [
      {
        heading: tier.heading,
        level: 2,
        body: [
          tierSummary(tier),
          ...(tier.products.length > 0
            ? [{ type: 'list' as const, items: tier.products.map(listItem) }]
            : []),
        ],
      },
    ]),
    {
      heading: 'Waar merk je het verschil?',
      level: 2,
      body: [
        'Onze redactionele inschatting, geen meting en geen testresultaat:',
        {
          type: 'list',
          items: [
            `**Materiaal en carbon.**Meer carbon maakt een stick doorgaans stijver. In de zaal mag je de bal niet slaan, dus extra stijfheid levert mogelijk weinig op bij pushen en aannemen. [Bron: FIH Rules of Indoor Hockey](${ZAAL_SOURCES.indoorRules.url}) Een soepele stick kan vergevingsgezinder zijn.`,
            '**Bow-profiel.** Een low bow is gericht op flicks en 3D-acties en vraagt meer techniek; een mid bow is rustiger. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow). Het profiel is dus een keuze, geen kwaliteitsniveau.',
            '**Maat.** Die kies je op lichaamslengte, niet op budget. Zie de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel).',
          ],
        },
        'Een duurdere stick is dus niet automatisch beter voor jou. Geef pas meer uit als je kunt uitleggen welke eigenschap je daarmee koopt.',
      ],
    },
    {
      heading: 'Niet elke zaalstick is bij bol.com te koop',
      level: 2,
      body: [
        'Wij verwijzen alleen door naar bol.com. Is een model daar volgens onze controle niet te koop, dan staat dat bij de stick en geven we geen verwijzing naar een ander model.',
      ],
    },
    {
      heading: 'Verder kiezen',
      level: 2,
      body: [
        `Over de spelregels en de lengte lees je meer op de pagina [zaalsticks](/zaalsticks); daar maak je ook in drie vragen een selectie op budget. Voor kinderen is er [zaalstick voor kinderen](/kennis/zaalstick-voor-kinderen), en of je veldstick in de zaal volstaat staat in [kun je met een veldstick zaalhockeyen?](/kennis/veldstick-zaalhockey). Speel je ook op het veld, dan geeft de [stickwijzer](/stickwijzer) persoonlijk advies met de redenen erbij.`,
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-11',
  updatedAt: '2026-10-11',
  sources: [
    { label: ZAAL_SOURCES.indoorRules.label, url: ZAAL_SOURCES.indoorRules.url },
    {
      label:
        'Productgegevens en richtprijzen: de productpagina’s op deze site, met bron per gegeven',
    },
    {
      label:
        'Redactionele uitgangspunten jouwhockeystick.nl — geen eigen testresultaten of prestatiegaranties',
    },
  ],
  metaDescription:
    'Wat krijg je voor een klein of ruim budget aan zaalstick? Per prijsniveau zie je materiaal, carbon, bow-profiel en maten, met voorbeelden uit de catalogus.',
};
