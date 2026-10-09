import { getFieldProducts } from '@/catalog';
import { isJuniorStick } from '@/catalog/similar';
import type { Article } from '../types';
import { byPrice, formatEuro, stickListItem } from '../catalogLinks';

const INTERSPORT_GUIDE =
  'https://intersport.nl/blogs/hockey/waar-moet-je-op-letten-bij-de-aanschaf-van-een-hockeystick';

const beginnerSticks = getFieldProducts().filter(
  (product) => product.experienceLevel.value === 'beginner',
);
const juniorSticks = beginnerSticks.filter(isJuniorStick).sort(byPrice);
const adultSticks = beginnerSticks
  .filter((product) => !isJuniorStick(product))
  .sort(byPrice);

const juniorPrices = juniorSticks.map((p) => p.priceIndicativeEur.value);
const juniorPriceRange =
  juniorPrices.length > 0
    ? `tussen ${formatEuro(Math.min(...juniorPrices))} en ${formatEuro(Math.max(...juniorPrices))}`
    : 'nog niet bekend';

export const hockeystickKinderenEnBeginners: Article = {
  slug: 'hockeystick-kinderen-en-beginners',
  title: 'Hockeystick voor kinderen en beginners: waar let je op?',
  intro:
    'Voor een kind of beginnende hockeyer is een eenvoudige stick meestal de verstandigste keuze: de juiste lengte, een rustig profiel zoals een standaard- of mid bow, weinig of geen carbon en een prijs waarbij je later zonder drempel overstapt. Sticks met veel carbon en een lage kromming zijn ontworpen voor spelers die de basis al beheersen. Hieronder lees je waar je op let en zie je welke junior- en beginnerssticks in onze catalogus staan.',
  sections: [
    {
      heading: 'Wat een eerste stick nodig heeft',
      level: 2,
      body: [
        {
          type: 'list',
          items: [
            '**Een passende lengte.** Niet op de groei: een te lange stick maakt het leren van de techniek lastiger. [Bron: Intersport — hockeystick kopen](' +
              INTERSPORT_GUIDE +
              ')',
            '**Een rustig profiel.** Een standaard- of mid bow maakt aannemen en vlak passen voorspelbaar.',
            '**Weinig of geen carbon.** Een soepele stick is vergevingsgezinder bij een mishit dan een stijve.',
            '**Een redelijke prijs.** Na een seizoen weet een speler veel beter wat hij of zij prettig vindt.',
          ],
        },
      ],
    },
    {
      heading: 'De juiste lengte voor je kind',
      level: 2,
      body: [
        'De lengte is bij kinderen het belangrijkste. In de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel) zie je per lichaamslengte welke maat een logisch startpunt is. Laat je kind de stick daarna vasthouden in een normale hockeyhouding: kan hij of zij ontspannen dribbelen en de stick dicht bij het lichaam houden?',
        'Is de juiste maat niet te krijgen, dan is één maat korter een redelijk alternatief. Een maat langer raden we af.',
      ],
    },
    {
      heading: 'Waarom weinig carbon en een rustige kromming?',
      level: 2,
      body: [
        'Carbon maakt een stick stijver. Dat geeft een directere respons, maar de bal springt bij een minder zuivere aanname ook sneller weg. In koopgidsen worden soepelere sticks daarom gekoppeld aan beginners en controle. [Bron: Intersport — hockeystick kopen](' +
          INTERSPORT_GUIDE +
          ')',
        'Een lage kromming (low bow) helpt bij liften en 3D-acties, maar vraagt meer techniek bij aannemen en vlak passen. Voor een beginner is dat zelden de eerste prioriteit. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
      ],
    },
    {
      heading: 'Wat kost een eerste stick?',
      level: 2,
      body: [
        `In onze catalogus liggen de richtprijzen van juniorsticks voor beginners ${juniorPriceRange}. Een duurdere stick is niet automatisch beter voor een kind: geef pas meer uit als je kunt uitleggen welke eigenschap je daarmee koopt.`,
      ],
    },
    {
      heading: 'Juniorsticks voor beginners in onze catalogus',
      level: 2,
      body: [
        'Gesorteerd op richtprijs. Controleer de actuele prijs en de leverbare maat bij de partnerwinkel.',
        { type: 'list', items: juniorSticks.map(stickListItem) },
      ],
    },
    {
      heading: 'Volwassen beginner?',
      level: 2,
      body: [
        'Ook als volwassene begin je het makkelijkst met een rustige, soepele stick in 36,5 inch. Deze sticks zijn in onze catalogus gericht op beginners:',
        { type: 'list', items: adultSticks.map(stickListItem) },
      ],
    },
    {
      heading: 'Zaalhockey',
      level: 3,
      body: [
        'Gaat je kind ook zaalhockeyen? Een aparte zaalstick is volgens de spelregels niet verplicht. Waar je op let als je er wel een koopt, lees je in [zaalstick voor kinderen](/kennis/zaalstick-voor-kinderen). Op de pagina [zaalsticks](/zaalsticks) maak je in drie vragen een eerste selectie.',
      ],
    },
    {
      heading: 'Persoonlijk advies in een paar minuten',
      level: 2,
      body: [
        'De [stickwijzer](/stickwijzer) heeft een eigen route voor een eerste stick. Je vult de lichaamslengte en een paar wensen in en krijgt sticks in de juiste maat, met de redenen erbij. Meer over de hele keuze lees je in [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-08',
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
    'Hockeystick voor een kind of beginner? Let op de lengte, een rustig profiel, weinig carbon en de prijs. Met een overzicht van junior- en beginnerssticks.',
};
