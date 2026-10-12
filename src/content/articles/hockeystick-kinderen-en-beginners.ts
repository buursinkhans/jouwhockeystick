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
    'Een eerste stick hoeft niet ingewikkeld te zijn. Voor een kind of beginner werkt een eenvoudige stick meestal het best: de juiste lengte, een rustig profiel zoals een standaard- of mid bow, weinig of geen carbon, en een prijs waarbij overstappen later geen drama is. Sticks met veel carbon en een lage kromming zijn gemaakt voor spelers die de basis al onder de knie hebben. Hieronder lees je waar je op let, met een overzicht van sticks.',
  sections: [
    {
      heading: 'Wat een eerste stick nodig heeft',
      level: 2,
      body: [
        {
          type: 'list',
          items: [
            '**Een stick die nu past.** Niet op de groei: met een te lange stick wordt het leren van de techniek een stuk lastiger.',
            '**Een rustig profiel.** Met een standaard- of mid bow gaan aannemen en vlak passen vanzelfsprekender.',
            '**Weinig of geen carbon.** Een soepele stick vergeeft het als je de bal net niet goed raakt.',
            '**Een vriendelijke prijs.** Na een seizoen weet je veel beter wat je fijn vindt. Dan is een volgende stick een leuke stap.',
          ],
        },
      ],
    },
    {
      heading: 'De juiste lengte voor je kind',
      level: 2,
      body: [
        'Bij kinderen is de lengte het allerbelangrijkst. In de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel) zie je per lichaamslengte welke maat een goed startpunt is. Laat je kind de stick daarna even vasthouden in een normale hockeyhouding: lukt dribbelen ontspannen, en blijft de stick dicht bij het lichaam? Top.',
        'Is de juiste maat niet te krijgen, dan is één maatje korter prima. Een maat langer raden we af.',
      ],
    },
    {
      heading: 'Waarom weinig carbon en een rustige kromming?',
      level: 2,
      body: [
        'Carbon maakt een stick stijver. Dat voelt directer, maar de bal springt ook sneller weg als je hem niet helemaal zuiver aanneemt. Juist voor beginners en voor controle is een soepele stick daarom zo fijn.',
        'Een lage kromming (low bow) helpt bij liften en 3D-acties, maar vraagt meer techniek bij het aannemen en vlak passen. Voor een beginner is dat zelden het eerste waar je aan werkt. Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
      ],
    },
    {
      heading: 'Wat kost een eerste stick?',
      level: 2,
      body: [
        `In onze catalogus liggen de richtprijzen van juniorsticks voor beginners ${juniorPriceRange}. Duurder is voor een kind niet vanzelf beter. Geef pas meer uit als je weet wat je daarvoor terugkrijgt.`,
      ],
    },
    {
      heading: 'Juniorsticks voor beginners in onze catalogus',
      level: 2,
      body: [
        'Op volgorde van richtprijs. Kijk bij de partnerwinkel even naar de actuele prijs en de maten die leverbaar zijn.',
        { type: 'list', items: juniorSticks.map(stickListItem) },
      ],
    },
    {
      heading: 'Begin je als volwassene?',
      level: 2,
      body: [
        'Leuk dat je begint! Ook als volwassene start je het makkelijkst met een rustige, soepele stick in 36,5 inch. Deze sticks uit onze catalogus zijn gemaakt voor beginners:',
        { type: 'list', items: adultSticks.map(stickListItem) },
      ],
    },
    {
      heading: 'Zaalhockey',
      level: 3,
      body: [
        'Gaat je kind ook de zaal in? Een aparte zaalstick is volgens de spelregels niet verplicht. Wil je er toch een, dan lees je waar je op let in [zaalstick voor kinderen](/kennis/zaalstick-voor-kinderen). Bij de [zaalsticks](/zaalsticks) maak je in drie vragen een eerste selectie.',
      ],
    },
    {
      heading: 'Persoonlijk advies in een paar minuten',
      level: 2,
      body: [
        'De [stickwijzer](/stickwijzer) heeft een eigen route voor een eerste stick. Vul de lichaamslengte en een paar wensen in, en je krijgt sticks in de juiste maat, met de redenen erbij. Meer over de hele keuze lees je in [hockeystick kopen: zo kies je een stick die bij je past](/blog/hockeystick-kopen).',
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-08',
  updatedAt: '2026-10-12',
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
