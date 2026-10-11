import { getFieldProducts } from '@/catalog';
import { BOW_LABELS, EXPERIENCE_LABELS } from '@/catalog/labels';
import { isJuniorStick } from '@/catalog/similar';
import type { Product } from '@/catalog/types';
import type { Article } from '../types';
import { byPrice, formatEuro, stickListItem } from '../catalogLinks';

const INTERSPORT_GUIDE =
  'https://intersport.nl/blogs/hockey/waar-moet-je-op-letten-bij-de-aanschaf-van-een-hockeystick';

/** Examples must stay clearly below the budget limit named in the brief. */
const BUDGET_LIMIT_EUR = 100;

const adultFieldSticks = getFieldProducts()
  .filter((product) => !isJuniorStick(product))
  .sort(byPrice);
const price = (product: Product) => product.priceIndicativeEur.value;
const budgetSticks = adultFieldSticks.filter(
  (product) => price(product) < BUDGET_LIMIT_EUR,
);
const adultBeginnerSticks = adultFieldSticks.filter(
  (product) => product.experienceLevel.value === 'beginner',
);

function budgetListItem(product: Product): string {
  const details = [
    EXPERIENCE_LABELS[product.experienceLevel.value].toLowerCase() +
      ' volgens de bron',
    product.carbonPercentage
      ? `${product.carbonPercentage.value}% carbon`
      : 'carbonpercentage niet opgegeven',
    product.bowProfile
      ? BOW_LABELS[product.bowProfile.value].toLowerCase()
      : 'bow-profiel niet opgegeven',
  ];
  return `${stickListItem(product)} (${details.join(', ')})`;
}

function budgetSummary(): string {
  if (budgetSticks.length === 0) {
    return `In onze catalogus staat op dit moment geen veldstick voor volwassenen onder ${formatEuro(BUDGET_LIMIT_EUR)}.`;
  }
  const prices = budgetSticks.map(price);
  return `In onze catalogus staan ${budgetSticks.length} veldsticks voor volwassenen onder ${formatEuro(BUDGET_LIMIT_EUR)}, met richtprijzen van ${formatEuro(Math.min(...prices))} tot ${formatEuro(Math.max(...prices))}. Het zijn voorbeelden, geen rangorde en geen beste-lijst.`;
}

function beginnerPriceSentence(): string {
  if (adultBeginnerSticks.length === 0) {
    return 'In onze catalogus staat op dit moment geen volwassen veldstick die de bron aanmerkt als beginnersstick.';
  }
  const prices = adultBeginnerSticks.map(price);
  return `De volwassen veldsticks die de bron aanmerkt als beginnersstick, hebben in onze catalogus richtprijzen van ${formatEuro(Math.min(...prices))} tot ${formatEuro(Math.max(...prices))}.`;
}

export const hockeystickVolwassenBeginner: Article = {
  slug: 'hockeystick-volwassen-beginner',
  title: 'Hockeystick voor volwassen beginners: wat past bij jou en wat kost het?',
  intro:
    'Als volwassen beginner is een stick in de juiste lengte met een rustig bow-profiel en weinig of geen carbon een logische keuze. Dat geeft controle bij aannemen en passen, en je hoeft er geen groot bedrag voor uit te geven. Na een seizoen weet je beter wat je mist. Hieronder lees je waar je op let, met voorbeelden onder €100 uit onze catalogus.',
  sections: [
    {
      heading: 'Welke lengte heb je als volwassene nodig?',
      level: 2,
      body: [
        'Die kies je op je lichaamslengte, niet op je budget of je ambitie. In de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel) zie je welke maat een logisch startpunt is. Twijfel je tussen twee maten, kies dan de maat waarmee je ontspannen en met de stick dicht bij je lichaam kunt dribbelen.',
        'Zit je al jaren niet meer op het veld? Kijk dan naar je huidige lengte en niet naar de stick van vroeger. Over het kiezen van een stick voor kinderen lees je meer in [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
      ],
    },
    {
      heading: 'Hout of composiet bij een eerste stick?',
      level: 2,
      body: [
        'Een stick van hout of met weinig carbon is doorgaans soepeler dan een stick met veel carbon. Een soepele stick kan vergevingsgezinder zijn als je de bal nog niet altijd zuiver raakt. [Bron: Intersport — hockeystick kopen](' +
          INTERSPORT_GUIDE +
          ')',
        'Het materiaal staat in onze catalogus niet als vast gegeven per stick. Kijk daarom op de productpagina en in de listing bij bol.com, de verkoper, wat er over het materiaal staat. Is het niet vermeld, dan raden we het niet.',
      ],
    },
    {
      heading: 'Hoeveel carbon heb je nodig?',
      level: 2,
      body: [
        'Het carbonpercentage zegt iets over de stijfheid van een stick, niet over de kwaliteit. Meer carbon maakt een stick doorgaans stijver, en dat past vaker bij spelers die hun techniek al beheersen. [Bron: Intersport — hockeystick kopen](' +
          INTERSPORT_GUIDE +
          ')',
        'Als beginner is dat zelden de eerste prioriteit. Onze redactionele inschatting: begin met weinig of geen carbon en kijk na een seizoen of je meer stijfheid wilt. Niet elk merk geeft een percentage op; ontbreekt het, dan staat dat zo op de productpagina.',
      ],
    },
    {
      heading: 'Welk bow-profiel past bij een beginner?',
      level: 2,
      body: [
        'Een mid bow (of een standaard-/ultrabow) is rustiger en voorspelbaarder bij aannemen en vlak passen. Een low bow is gericht op liften en 3D-acties en vraagt meer techniek. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow). Het profiel is een keuze voor een spelstijl, geen kwaliteitsniveau.',
      ],
    },
    {
      heading: `Voorbeelden onder ${formatEuro(BUDGET_LIMIT_EUR)} uit de catalogus`,
      level: 2,
      body: [
        budgetSummary(),
        'Gesorteerd op richtprijs. Het niveau (beginner of gevorderd) is dat van de bron, niet van ons. Alle prijzen zijn de richtprijzen van de fabrikant of de partnerlisting, met bron en datum op de productpagina. Het zijn geen actuele bol.com-prijzen: controleer de prijs en de leverbare maat bij bol.com, de verkoper.',
        ...(budgetSticks.length > 0
          ? [{ type: 'list' as const, items: budgetSticks.map(budgetListItem) }]
          : []),
      ],
    },
    {
      heading: 'Hoeveel hoef je uit te geven?',
      level: 2,
      body: [
        `${beginnerPriceSentence()} Een duurdere stick is niet automatisch beter voor jou. Geef pas meer uit als je kunt uitleggen welke eigenschap je daarmee koopt.`,
      ],
    },
    {
      heading: 'Wanneer is upgraden logisch?',
      level: 2,
      body: [
        'Onze redactionele inschatting, geen meting en geen garantie:',
        {
          type: 'list',
          items: [
            'Je hebt een seizoen gespeeld en weet waar je stick je beperkt, bijvoorbeeld bij liften of bij hard passen.',
            'Je speelt vaker of op een hoger niveau en wilt bewust een andere stijfheid of een lagere kromming proberen.',
            'Je stick is beschadigd of de lengte past niet meer bij je.',
          ],
        },
        'Merk je geen beperking, dan is er weinig reden om te wisselen.',
      ],
    },
    {
      heading: 'Persoonlijk advies in een paar minuten',
      level: 2,
      body: [
        'De [stickwijzer](/stickwijzer) vraagt naar je lengte en ervaring en laat sticks zien met de redenen erbij. Meer over de hele keuze lees je in [hoe kies je de juiste hockeystick?](/kennis/hoe-kies-je-de-juiste-hockeystick) en in [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-11',
  updatedAt: '2026-10-11',
  sources: [
    {
      label:
        'Intersport — Waar moet je op letten bij de aanschaf van een hockeystick',
      url: INTERSPORT_GUIDE,
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
    'Welke hockeystick past bij een volwassen beginner? Lengte, hout of composiet, carbon, bow-profiel en wanneer upgraden, met voorbeelden onder €100.',
};
