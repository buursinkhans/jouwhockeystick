import { LENGTH_GUIDE, alsoFitsInch, getSizeAdvice } from '@/advice-engine/sizeAdvice';
import type { Article } from '../types';
import { ZAAL_SOURCES } from '../zaal';
import { AGE_TABLE_ROWS, CHILD_HEIGHT_SOURCE } from '../childHeight';
import { formatDutchDate } from '../schedule';
import {
  COMPARISON_COLUMNS,
  COMPARISON_HEIGHTS,
  COMPARISON_ROWS,
  SIZE_CHARTS,
  chartRow,
  ourAdvice,
} from '../sizeCharts';

const INTERSPORT_STICKS = 'https://intersport.nl/collections/hockeysticks';
const INTERSPORT_GUIDE =
  'https://intersport.nl/blogs/hockey/waar-moet-je-op-letten-bij-de-aanschaf-van-een-hockeystick';

const CM_PER_INCH = 2.54;

/** "36,5": the unit is in the column heading, which keeps the table narrow on a phone. */
function formatInch(inch: number): string {
  return String(inch).replace('.', ',');
}

function formatCm(inch: number): string {
  return `${Math.round(inch * CM_PER_INCH)}`;
}

/**
 * Generated from the same LENGTH_GUIDE the stickwijzer uses, so the table and
 * the advice can never disagree. Three columns for phones (decision log
 * 2026-10-29); the advised length also shows in cm, in smaller text.
 */
export const LENGTH_ROWS = LENGTH_GUIDE.map((band, index) => {
  const isLast = index === LENGTH_GUIDE.length - 1;
  const height = isLast
    ? `${band.minCm} cm en langer`
    : `${band.minCm}–${band.maxCm} cm`;
  const also = alsoFitsInch(band);
  return [
    height,
    {
      text: band.sizes.map(formatInch).join(' of '),
      note: `ca. ${band.sizes.map(formatCm).join(' / ')} cm`,
    },
    also.length > 0 ? also.map(formatInch).join(' of ') : '–',
  ];
});

/** The comparison heights where the charts name different sizes, and where they all agree with our first size. */
const chartSizes = (height: number) => SIZE_CHARTS.map((chart) => chartRow(chart, height)?.sizes.join('/') ?? '');
const ourFirst = (height: number) => ourAdvice(height).split(' ')[0]!.replace(',', '.');
const AGREE = COMPARISON_HEIGHTS.filter((h) => chartSizes(h).every((sizes) => sizes === ourFirst(h)));
const DIFFER = COMPARISON_HEIGHTS.filter((h) => new Set([...chartSizes(h), ourFirst(h)]).size > 1);
const list = (values: readonly (number | string)[]) =>
  values.length > 1 ? `${values.slice(0, -1).join(', ')} en ${values.at(-1)}` : values.join('');
const CHARTS_READ_ON = formatDutchDate(SIZE_CHARTS.map((chart) => chart.readOn).sort().at(-1)!);

/** The adult band around 175 cm and what the stickwijzer names there (from LENGTH_GUIDE and getSizeAdvice). */
const BAND_175 = LENGTH_GUIDE.find((band) => 175 >= band.minCm && 175 <= band.maxCm)!;
const ADVICE_175 = getSizeAdvice(175);

export const hockeystickLengteTabel: Article = {
  slug: 'hockeystick-lengte-tabel',
  title: 'Hockeystick lengte tabel: welke maat stick past bij jouw lengte?',
  intro:
    'Welke lengte stick heb je nodig? Een handig richtsnoer: kinderen tot ongeveer 1,10 meter spelen meestal met 22 tot 24 inch, kinderen rond 1,40 meter met 32 inch, en vanaf zo’n 1,63 meter is 36,5 inch de gangbare maat. Ben je 1,85 meter of langer, dan past 37,5 of 38,5 inch vaak beter. In de tabel hieronder vind je jouw maat in een paar seconden. Twijfel je bij een kind? Kies dan niet de langere om in te groeien.',
  sections: [
    {
      heading: 'De lengtetabel',
      level: 2,
      body: [
        {
          type: 'table',
          columns: ['Lichaamslengte', 'Stick (inch)', 'Kan ook (inch)'],
          rows: LENGTH_ROWS,
        },
        '1 inch = 2,54 cm.',
        'Deze tabel is onze eigen richtlijn, geen officiële norm. En eerlijk is eerlijk: de maattabellen van merken lopen flink uiteen. Bij kinderen scheelt het al snel 2 inch, en de ene tabel adviseert een maat langer dan de andere. Daarom staat er per rij ook een maat die kan passen. Bij kinderen is dat altijd de kortere maat, bij volwassenen de maat erboven of eronder.',
        'Kijk bij een specifiek model ook even naar de maattabel van het merk. De [stickwijzer](/stickwijzer) werkt met precies deze tabel en kijkt daarnaast naar je huidige stick.',
      ],
    },
    {
      heading: 'Zo gebruik je de tabel',
      level: 2,
      body: [
        'Meet de lichaamslengte zonder schoenen en zoek de rij die erbij hoort. Doe daarna de houdingscheck: kan de speler ontspannen bewegen, dribbelen en de stick dicht bij het lichaam houden? Dan zit je goed. Een te lange stick maakt balcontrole en het leren van de techniek een stuk lastiger.',
      ],
    },
    {
      heading: 'Lichaamslengte, niet leeftijd',
      level: 3,
      body: [
        'De juiste sticklengte bepaal je op basis van lichaamslengte, niet op leeftijd. Twee kinderen van dezelfde leeftijd kunnen behoorlijk in lengte verschillen. Meet daarom de lichaamslengte zonder schoenen en gebruik de tabel om de passende stickmaat te vinden.',
      ],
    },
    {
      heading: 'Twijfel tussen twee maten',
      level: 3,
      body: [
        'Zit de lichaamslengte precies op een grens, of staan er twee maten in de tabel? Dan kunnen ze allebei passen, en de stickwijzer noemt ze dan ook allebei. Laat de houdingscheck beslissen. Blijf je twijfelen, kies dan de kortere: een iets kortere stick is goed te hanteren, een te lange werkt juist tegen bij aannemen en dribbelen.',
      ],
    },
    {
      heading: 'Koop een kinderstick niet op de groei',
      level: 3,
      body: [
        'Een maat groter, zodat de stick langer meegaat? Begrijpelijk, maar je kind moet er nú mee kunnen oefenen. Is de juiste maat niet te krijgen, dan is één maatje korter prima. Een maat langer raden we af. Meer tips vind je bij [hockeysticks voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners). Koop je de stick als cadeau, zonder dat het kind erbij is? Lees dan [hockeystick als cadeau](/kennis/hockeystick-cadeau).',
      ],
    },
    {
      id: 'leeftijd',
      heading: 'En op leeftijd? Een indicatie',
      level: 2,
      body: [
        {
          type: 'callout',
          text: 'Gebruik leeftijd alleen als eerste indicatie. Twee kinderen van dezelfde leeftijd kunnen een andere stickmaat nodig hebben. Gebruik altijd de lichaamslengte als uitgangspunt, of doe de [stickwijzer](/stickwijzer).',
        },
        'Veel ouders zoeken een maat op leeftijd. Hieronder staat de gemiddelde lengte van Nederlandse kinderen per leeftijd, met de maat die de lengtetabel hierboven bij die lengte geeft. De bandbreedte laat zien hoe ver kinderen van dezelfde leeftijd uit elkaar liggen.',
        {
          type: 'table',
          columns: [
            'Op de verjaardag van',
            'Gemiddelde lengte in cm (meisjes / jongens)',
            'Maat bij die lengte (meisjes / jongens)',
            'Bandbreedte: gemiddelde ± 1 SD',
          ],
          rows: AGE_TABLE_ROWS,
        },
        'De cijfers gelden op de verjaardag zelf, dus op exact 8,0 jaar en niet voor elk kind van "8 jaar". De bandbreedte loopt van de kortste maat bij de gemiddelde lengte min één standaarddeviatie tot de langste maat bij de gemiddelde lengte plus één standaarddeviatie, en omvat ongeveer twee op de drie kinderen. Ook de herkomst van een kind speelt mee: de JGZ-richtlijn noemt aparte gemiddelden voor kinderen van Marokkaanse, Turkse en Hindoestaanse afkomst.',
        'Meet daarom altijd de lichaamslengte en zoek die op in de tabel hierboven. De maten in deze tabel komen uit onze eigen lengtetabel; de gemiddelde lengtes uit de JGZ-richtlijn Lengtegroei, op basis van de Vijfde landelijke groeistudie (metingen in 2008 en 2009).',
      ],
    },
    {
      heading: 'Volwassenen: 36,5 inch of langer?',
      level: 2,
      body: [
        'Voor volwassenen is 36,5 inch de meest gekozen lengte. Ben je 1,85 meter of langer, dan is 37,5 inch een logische richting, en vanaf zo’n 1,93 meter 38,5 inch. Merken leggen die grens net verschillend, dus zit je ertussenin, probeer dan beide. Langer is niet vanzelf beter: je hebt meer bereik, maar balcontrole dicht bij je lichaam wordt lastiger. Kies dus vooral wat prettig voelt.',
        'Er is ook een grens: een stick mag volgens de spelregels niet langer zijn dan 105 cm, op het veld én in de zaal.',
      ],
    },
    {
      heading: 'Wat zeggen de maattabellen van merken?',
      level: 2,
      body: [
        `Hieronder staan drie maattabellen van merken naast onze richtlijn, zoals ze op de eigen site van het merk staan (gelezen op ${CHARTS_READ_ON}). Bij "Onze richtlijn" staat de maat die de stickwijzer geeft, met tussen haakjes de maat die hij als alternatief noemt.`,
        {
          type: 'table',
          columns: COMPARISON_COLUMNS,
          rows: COMPARISON_ROWS,
        },
        `Alle maten in inch. Bij ${list(AGREE)} cm noemen alle tabellen dezelfde maat als wij. Bij ${list(DIFFER)} cm lopen ze uiteen. De bronnen staan onderaan dit artikel.`,
      ],
    },
    {
      heading: 'Waarom verschillen de tabellen?',
      level: 3,
      body: [
        'Een maattabel is een richtlijn, en elk merk trekt de grenzen zelf. Ze maken ook niet dezelfde lengtes: Osaka noemt voor de langste spelers 38 inch, Grays en wij 38,5. Princess geeft tussen 1,60 en 1,70 meter en vanaf 1,80 meter twee maten.',
        'Tussen 1,70 en 1,80 meter zijn de tabellen het eens. Daaronder noemt Princess ook 36 inch, en Osaka geeft al vanaf 1,52 meter 36,5 inch, waar de andere 35 noemen. Vanaf 1,80 meter lopen ze verder uiteen.',
      ],
    },
    {
      heading: 'Tussen twee maten: 36,5 of 37,5 inch?',
      level: 3,
      body: [
        'De stickwijzer kijkt alleen naar de lichaamslengte. Zit je in de bovenste helft van een lengteband voor volwassenen, dan noemt hij de langere maat als alternatief; zit je in de onderste helft, dan de kortere. Bij kinderen is het alternatief altijd de kortere maat. Verschilt je huidige stick meer dan een inch van het advies, dan zegt hij dat erbij.',
        'Onze tip als je tussen twee maten zit: een kortere stick houdt de bal dichter bij je lichaam, wat helpt bij aannemen en dribbelen. Een langere geeft meer bereik. Kies op wat je in een wedstrijd het meest doet, en laat je positie daarbij niet de doorslag geven. Kun je beide maten proberen, doe dan de houdingscheck van hierboven met allebei.',
      ],
    },
    {
      heading: 'Geldt dezelfde lengte in de zaal?',
      level: 2,
      body: [
        'Ja, als startpunt wel. Onze [zaalkeuze](/zaalsticks) gebruikt voor kinderen dezelfde tabel. Volwassen zaalsticks vind je meestal in 36,5 en 37,5 inch.',
      ],
    },
    {
      heading: 'Veelgestelde vragen',
      level: 2,
      body: [],
    },
    {
      heading: 'Ik ben 175 cm, welke sticklengte?',
      level: 3,
      body: [
        `Bij 175 cm noemen onze richtlijn en de tabellen van ${list(SIZE_CHARTS.map((chart) => chart.name))} allemaal ${formatInch(ADVICE_175.primaryInch)} inch. Je zit wel in de bovenste helft van onze band van ${BAND_175.minCm} tot ${BAND_175.maxCm} cm. Daarom noemt de stickwijzer ${formatInch(ADVICE_175.alternativeInch ?? ADVICE_175.primaryInch)} inch als alternatief. Twijfel je, begin dan met ${formatInch(ADVICE_175.primaryInch)} inch en probeer de langere als je meer bereik wilt.`,
      ],
    },
    {
      heading: 'Liever sticks in jouw maat zien?',
      level: 2,
      body: [
        'Weet je je maat al? Op [alle veldsticks](/sticks) kies je in de filters je lengte; voor volwassenen is dat meestal [36,5 inch](/sticks?lengte=36.5). Vul je liever je lichaamslengte, ervaring en wensen in, doe dan de [stickwijzer](/stickwijzer). Je krijgt dan niet alleen een maat, maar ook sticks die je in die maat kunt krijgen, met de redenen erbij. Wil je eerst meer weten over de rest van de keuze? Lees dan [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen).',
        'Ook nieuwe schoenen nodig? Bij de [hockeyschoenen](/hockeyschoenen) zie je per model of hij past bij je veld of de zaal.',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-11-13',
  sources: [
    {
      label:
        'Intersport: Waar moet je op letten bij de aanschaf van een hockeystick',
      url: INTERSPORT_GUIDE,
    },
    {
      label: 'Intersport: Hockeysticks (assortiment en lengtes)',
      url: INTERSPORT_STICKS,
    },
    {
      label: 'Grays: maattabel hockeysticks (lichaamslengte en sticklengte)',
    },
    { label: CHILD_HEIGHT_SOURCE.guidelineLabel, url: CHILD_HEIGHT_SOURCE.guidelineUrl },
    { label: CHILD_HEIGHT_SOURCE.studyLabel, url: CHILD_HEIGHT_SOURCE.studyUrl },
    ...SIZE_CHARTS.map((chart) => ({ label: `${chart.label}, gelezen op ${formatDutchDate(chart.readOn)}`, url: chart.url })),
    { label: ZAAL_SOURCES.fieldRules.label, url: ZAAL_SOURCES.fieldRules.url },
    {
      label:
        'Lengtetabel: redactionele richtlijn van jouwhockeystick.nl, dezelfde als in de stickwijzer (geen officiële norm)',
    },
  ],
  metaDescription:
    'Hockeystick lengte tabel: zie per lichaamslengte welke sticklengte in inch past, voor kinderen en volwassenen. Plus tips bij twijfel tussen twee maten.',
};
