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
  const availability = product.bolNotSold
    ? ' — niet verkrijgbaar bij bol.com'
    : '';
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
      `Bij ${carbon.length} van de ${products.length} is het carbonpercentage bekend: ${range}.`,
    );
  } else {
    parts.push('Bij geen van deze sticks is het carbonpercentage bekend.');
  }

  const bows = [
    ...new Set(
      products.flatMap((p) =>
        p.bowProfile ? [BOW_LABELS[p.bowProfile.value].toLowerCase()] : [],
      ),
    ),
  ];
  if (bows.length > 0) {
    parts.push(`Bow-profielen: ${bows.join(', ')}.`);
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
      `${notSold} van deze sticks is niet bij bol.com te koop; dat zie je bij de stick.`,
    );
  }
  return parts.join(' ');
}

export const zaalstickBudget: Article = {
  slug: 'zaalstick-budget',
  title: 'Zaalstick: wat krijg je voor een klein of ruim budget?',
  intro:
    'Wat krijg je voor je geld bij een zaalstick? Het verschil zit vooral in het materiaal, het carbonpercentage, het bow-profiel en de maten waarin je hem kunt krijgen. Of een duurdere stick ook beter speelt, is persoonlijk: dat hangt af van je techniek en wat jij fijn vindt. Hieronder zie je per prijsniveau wat er in onze catalogus staat, met voorbeelden erbij.',
  sections: [
    {
      heading: 'Hoe lees je deze prijzen?',
      level: 2,
      body: [
        'Alle prijzen hier zijn richtprijzen uit onze catalogus, geen live prijzen. De actuele prijs en de leverbare maten zie je bij de winkel. Kortingen noemen we bewust niet.',
        'De tekst per prijsniveau komt rechtstreeks uit de catalogus. Is iets niet bekend, dan laten we het weg. We gaan niet gokken.',
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
        'Een paar dingen om op te letten:',
        {
          type: 'list',
          items: [
            '**Materiaal en carbon.** Meer carbon maakt een stick stijver. Maar in de zaal sla je niet, dus die extra stijfheid levert bij pushen en aannemen misschien weinig op. Een soepele stick vergeeft het juist als een aanname net niet lukt.',
            '**Bow-profiel.** Een low bow is gemaakt voor flicks en 3D-acties en vraagt meer techniek. Een mid bow is rustiger. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow). Het profiel is dus een keuze, geen kwaliteitslabel.',
            '**Maat.** Die kies je op lichaamslengte, niet op budget. Kijk in de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel).',
          ],
        },
        'Duurder is dus niet vanzelf beter voor jou. Geef pas meer uit als je weet wat je daarvoor terugkrijgt.',
      ],
    },
    {
      heading: 'Niet elke zaalstick is bij bol.com te koop',
      level: 2,
      body: [
        'Is een stick niet bij bol.com te koop, dan zie je dat meteen bij de stick. We sturen je dan niet door naar een ander model dat toevallig wel te koop is.',
      ],
    },
    {
      heading: 'Verder kiezen',
      level: 2,
      body: [
        'Over de spelregels en de lengte lees je meer bij de [zaalsticks](/zaalsticks), en daar maak je ook in drie vragen een selectie op budget. Zoek je voor je kind? Lees dan [zaalstick voor kinderen](/kennis/zaalstick-voor-kinderen). Of je veldstick in de zaal volstaat, lees je in [kun je met een veldstick zaalhockeyen?](/kennis/veldstick-zaalhockey). En speel je ook op het veld, dan geeft de [stickwijzer](/stickwijzer) je persoonlijk advies, met de redenen erbij.',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-11',
  updatedAt: '2026-10-12',
  sources: [
    {
      label: ZAAL_SOURCES.indoorRules.label,
      url: ZAAL_SOURCES.indoorRules.url,
    },
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
