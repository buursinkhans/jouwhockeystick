import { getFieldProducts } from '@/catalog';
import { isJuniorStick } from '@/catalog/similar';
import type { Article } from '../types';
import { formatEuro } from '../catalogLinks';
import { CHILD_HEIGHT_BY_AGE, CHILD_HEIGHT_SOURCE, ageIndication } from '../childHeight';
import { ZAAL_SOURCES } from '../zaal';

/**
 * A hockey stick as a present (decision log 2026-11-13), for parents and
 * grandparents who buy without the child and without playing themselves. It
 * covers the gift decision only and sends readers to
 * hockeystick-kinderen-en-beginners for the stick itself. The age indication
 * comes from childHeight.ts (the same source data as the length table), the
 * prices from the catalog; nothing is copied into fixed text.
 */

/** Ages a gift is usually bought for: the rows of the length table's age indication up to 12. */
export const GIFT_AGES = CHILD_HEIGHT_BY_AGE.filter((row) => row.age <= 12);

export const GIFT_AGE_ROWS: string[][] = GIFT_AGES.map((row) => {
  const indication = ageIndication(row);
  return [`${indication.age} jaar`, indication.meanHeight, indication.size, indication.range];
});

const middle = (values: readonly number[]) => [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) / 2)]!;

/** Children's sticks (only in junior sizes) in the catalog: count, price range and middle price. */
export function giftPriceFacts(now: Date = new Date()) {
  const prices = getFieldProducts(now)
    .filter(isJuniorStick)
    .map((p) => p.priceIndicativeEur.value);
  return {
    count: prices.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    median: middle(prices),
    under100: prices.filter((price) => price < 100).length,
  };
}

const facts = giftPriceFacts();
const eight = ageIndication(CHILD_HEIGHT_BY_AGE.find((row) => row.age === 8)!);

export const hockeystickCadeau: Article = {
  slug: 'hockeystick-cadeau',
  title: 'Hockeystick als cadeau: zo kies je de juiste voor een kind',
  intro: `Een hockeystick als cadeau kies je op drie dingen: de lichaamslengte van het kind, of het op het veld of in de zaal speelt, en hoe lang het al hockeyt. De lengte bepaalt de maat; is het kind er niet bij, dan geeft de leeftijd een eerste indicatie. Voor een kind dat net begint, is een eenvoudige stick genoeg: de meeste kindersticks in onze catalogus kosten minder dan €100, de middelste prijs is ${formatEuro(facts.median)}.`,
  sections: [
    {
      heading: 'De maat, als het kind er niet bij is',
      level: 2,
      body: [
        'De maat van een hockeystick hangt af van de lichaamslengte, gemeten zonder schoenen. Weet je die, zoek de maat dan op in de [lengtetabel](/kennis/hockeystick-lengte-tabel). Je kunt ook de ouders vragen welke maat de huidige stick heeft.',
        'Weet je alleen de leeftijd, dan geeft de tabel hieronder een eerste indicatie.',
        {
          type: 'callout',
          text: 'Gebruik leeftijd alleen als eerste indicatie. Twee kinderen van dezelfde leeftijd kunnen een andere stickmaat nodig hebben. Gebruik altijd de lichaamslengte als uitgangspunt, of doe de [stickwijzer](/stickwijzer).',
        },
        {
          type: 'table',
          columns: [
            'Op de verjaardag van',
            'Gemiddelde lengte in cm (meisjes / jongens)',
            'Maat bij die lengte (meisjes / jongens)',
            'Bandbreedte: gemiddelde ± 1 SD',
          ],
          rows: GIFT_AGE_ROWS,
        },
        'De gemiddelde lengtes komen uit de JGZ-richtlijn Lengtegroei (Vijfde landelijke groeistudie); de maten uit onze eigen lengtetabel. De uitleg en de leeftijden tot 15 jaar staan in de [leeftijdsindicatie van de lengtetabel](/kennis/hockeystick-lengte-tabel#leeftijd).',
        'Koop de stick liever niet een maat groter om in te groeien. Een te lange stick maakt dribbelen en aannemen lastiger, en je kind moet er nu mee kunnen spelen. Twijfel je tussen twee maten, kies dan de kortere.',
      ],
    },
    {
      heading: 'Veld of zaal?',
      level: 2,
      body: [
        'Hockeyt het kind in de winter in de zaal, vraag dan na of het een zaalstick nodig heeft. In de zaal mag je de bal niet slaan en blijft hij laag; zaalsticks zijn daarvoor gemaakt. Een aparte zaalstick is volgens de spelregels niet verplicht: met een veldstick mag een kind ook in de zaal spelen.',
        'Waar je bij een zaalstick op let, lees je in [zaalstick voor kinderen](/kennis/zaalstick-voor-kinderen).',
      ],
    },
    {
      heading: 'Hoe lang hockeyt het kind al?',
      level: 2,
      body: [
        'Voor een kind dat net begint of een paar seizoenen speelt, werkt een eenvoudige stick het best: weinig of geen carbon en een rustige kromming. Een duurdere stick met veel carbon is stijver en vergeeft minder, en daar heeft een kind dat nog leert weinig aan.',
        `In onze catalogus staan ${facts.count} kindersticks (sticks die alleen in juniormaten bestaan), met richtprijzen van ${formatEuro(facts.min)} tot ${formatEuro(facts.max)}; ${facts.under100} daarvan kosten minder dan €100. Welke sticks dat zijn en waar je verder op let, staat in [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).`,
      ],
    },
    {
      heading: 'Bestaat er een linkshandige hockeystick?',
      level: 2,
      body: [
        'Nee. Volgens de spelregels heeft elke hockeystick zijn vlakke kant links, en je mag de bal alleen met de vlakke kant spelen. Een linkshandig kind speelt dus met dezelfde stick als een rechtshandig kind. Je hoeft daar bij het kiezen niet op te letten.',
      ],
    },
    {
      heading: 'Geef dit mee met het cadeau',
      level: 2,
      body: [
        {
          type: 'list',
          items: [
            'Het bonnetje, zodat de stick geruild kan worden als de maat niet past.',
            'De ruiltermijn: vraag bij het kopen hoe lang ruilen kan. Dat verschilt per winkel.',
            'De maat van de stick, zodat de ouders kunnen nakijken of die past bij de lichaamslengte.',
            'Bij twijfel over de maat: vraag het vooraf na bij de club of de trainer.',
          ],
        },
        "Koop je via een knop op deze site, dan zijn dat partnerlinks: wij krijgen dan een kleine vergoeding van de winkel, en de winkel is de verkoper. Waar de winkels verschillen in verzending, retour en bezorging, staat in [waar koop je een hockeystick?](/kennis/waar-koop-je-een-hockeystick).",
      ],
    },
    {
      heading: 'Veelgestelde vragen',
      level: 2,
      body: [],
    },
    {
      heading: 'Welke maat hockeystick heeft een kind van 8 nodig?',
      level: 3,
      body: [
        `Op hun achtste verjaardag zijn meisjes gemiddeld ${eight.meanHeight.split(' / ')[0]} cm lang en jongens ${eight.meanHeight.split(' / ')[1]} cm. Daarbij past volgens onze lengtetabel maat ${eight.size} (meisjes / jongens). Bij ongeveer twee op de drie kinderen van die leeftijd ligt de maat tussen ${eight.range.replace(' t/m ', ' en ')}, dus meet de lichaamslengte als het kan.`,
      ],
    },
    {
      heading: 'Kan ik een hockeystick ruilen als hij niet past?',
      level: 3,
      body: [
        'Dat hangt af van de winkel. Vraag bij het kopen naar de ruil- en retourvoorwaarden, en geef het bonnetje mee met het cadeau.',
      ],
    },
    {
      heading: 'Is een duurdere stick een beter cadeau?',
      level: 3,
      body: [
        'Voor een kind dat nog leert meestal niet. Een eenvoudige, soepele stick in de juiste lengte speelt voor een kind makkelijker dan een stijve stick met veel carbon. De lengte is belangrijker dan de prijs.',
      ],
    },
    {
      heading: 'Snel een voorstel voor het kind',
      level: 2,
      body: [
        'In het [snelle advies voor een kind](/stickwijzer?snel&voor=kind) vul je leeftijd, lengte, ervaring en budget in, en zie je sticks in de juiste maat. De volledige [stickwijzer](/stickwijzer) vraagt ook naar speelwensen, als je die weet.',
        {
          type: 'note',
          text: 'Wij testen sticks niet zelf. De maten komen uit onze lengtetabel, de gemiddelde lengtes uit de JGZ-richtlijn, en de prijzen en specificaties van merken en winkels, met de bron per stick.',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-11-13',
  updatedAt: '2026-11-13',
  sources: [
    { label: CHILD_HEIGHT_SOURCE.guidelineLabel, url: CHILD_HEIGHT_SOURCE.guidelineUrl },
    { label: CHILD_HEIGHT_SOURCE.studyLabel, url: CHILD_HEIGHT_SOURCE.studyUrl },
    {
      label: `${ZAAL_SOURCES.fieldRules.label}: regel 4.6 (de stick heeft een kop die links vlak is) en regel 9.5 (niet met de achterkant spelen)`,
      url: ZAAL_SOURCES.fieldRules.url,
    },
    { label: ZAAL_SOURCES.indoorRules.label, url: ZAAL_SOURCES.indoorRules.url },
    {
      label: "Richtprijzen en juniormaten: de productpagina's op deze site, met bron en datum per gegeven",
    },
    {
      label: 'Lengtetabel en advies: redactionele uitgangspunten jouwhockeystick.nl (geen eigen testresultaten)',
    },
  ],
  metaDescription:
    'Een hockeystick cadeau geven aan een kind? Zo kies je de maat zonder dat het kind erbij is, veld of zaal, het budget, en wat je meegeeft met het cadeau.',
};
