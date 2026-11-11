import { getAllProducts, getDiscipline } from '@/catalog';
import { getCatalogStats } from '@/catalog/stats';
import { RETAILERS } from '@/lib/retailers';
import type { FaqItem } from '@/lib/faqJsonLd';
import { routeStepRange } from './stickwijzer/progress';
import { METHODE } from './methode';

/**
 * Questions as people ask them in a search engine or an AI assistant, on the
 * landing pages (SEO/GEO step B, decision log 2026-11-08). Every answer
 * repeats what our checked articles, the methodiek or the catalog already
 * say, and links to the full explanation. Numbers come from the catalog.
 */

const joinDutch = (items: readonly string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} en ${items.at(-1)}`;

export function stickwijzerFaq(): FaqItem[] {
  return [
    {
      question: 'Welke hockeystick past bij een kind van 12?',
      answer:
        'Kijk eerst naar de lichaamslengte, niet naar de leeftijd: de [lengtetabel](/kennis/hockeystick-lengte-tabel) geeft de maat per lengte. Speelt het kind nog niet lang, dan werkt een eenvoudige stick meestal het best: een rustige mid bow en weinig of geen carbon. De stickwijzer vraagt daarnaast naar ervaring, speelwensen en budget, en toont maximaal drie sticks met de redenen erbij.',
    },
    {
      question: 'Maakt de positie uit, bijvoorbeeld voor een verdediger?',
      answer:
        'Minder dan vaak gedacht. Een verdediger en een aanvaller met dezelfde ervaring en dezelfde acties kunnen met dezelfde stick spelen. Daarom is positie in de stickwijzer nooit de enige reden voor een advies. Zwaarder wegen de lengte, hoe zeker de speler de bal aanneemt en welke acties hij vaak maakt, zoals hard slaan of 3D.',
    },
    {
      question: 'Hoe lang duurt de stickwijzer?',
      answer: `${routeStepRange().replace(/^./, (c) => c.toUpperCase())}, afhankelijk van de route. Je hebt geen account nodig en we vragen geen naam of e-mailadres. Je antwoorden blijven in je browser.`,
    },
    {
      question: 'Telt de winkelvergoeding mee in het advies?',
      answer:
        'De score van een stick hangt af van je antwoorden en de gegevens van de stick. Welke winkel hem verkoopt en wat wij daaraan verdienen, telt niet mee. Klik je door naar een winkel, dan gaat dat via een partnerlink; hoe dat werkt, staat in de [methodiek](/methodiek#partnerlinks).',
    },
    {
      question: METHODE.faq.question,
      answer: `${METHODE.m50} Meer lees je in de [methodiek](${METHODE.faq.link}).`,
    },
    {
      question: 'Wat als er geen stick past?',
      answer:
        'Dan zeggen we dat, met de reden: bijvoorbeeld dat er binnen je budget geen stick in jouw maat is. We versoepelen dan geen eisen om toch drie sticks te tonen.',
    },
  ];
}

export function kennisFaq(): FaqItem[] {
  return [
    {
      question: 'Wat is het verschil tussen 30% en 70% carbon?',
      answer:
        'Een stick met 70% carbon is meestal stijver en directer dan een stick met 30%. Een slag gaat er harder af, maar een bal die je net niet goed raakt, voel je meer. Met minder carbon is de stick vergevingsgezinder, wat helpt als je nog aan je basis werkt. Hoe stijf een stick echt is, hangt ook af van de opbouw, dus het percentage zegt niet alles. Meer lees je in [Hoeveel carbon heeft je hockeystick nodig?](/kennis/meer-carbon-hockeystick-beter)',
    },
    {
      question: 'Low bow of mid bow: wat past bij mij?',
      answer:
        'Bij een mid bow zit de kromming ongeveer halverwege de stick. Dat is rustig en voorspelbaar bij aannemen, vlak passen en pushen. Bij een low bow zit de kromming lager, dichter bij de krul: je komt makkelijker onder de bal voor lifts en 3D-acties, en de aanname vraagt meer techniek. Kies op de acties die je het meest maakt. Zie [Low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
    },
    {
      question: 'Hoe lang moet mijn hockeystick zijn?',
      answer:
        'Als richtsnoer: kinderen tot ongeveer 1,10 meter spelen meestal met 22 tot 24 inch, kinderen rond 1,40 meter met 32 inch, en vanaf zo’n 1,63 meter is 36,5 inch de gangbare maat. Ben je 1,85 meter of langer, dan past 37,5 of 38,5 inch vaak beter. Koop voor een kind geen langere stick om in te groeien. De volledige tabel staat in de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel).',
    },
    {
      question: 'Kan ik met een veldstick in de zaal spelen?',
      answer:
        'Ja. Volgens de spelregels van de FIH gelden voor een veld- en een zaalstick dezelfde maximale eisen. In de zaal mag je de bal niet slaan en blijft hij laag, en daar zijn zaalsticks op gemaakt. Je veldstick is een prima start; een zaalstick is vooral iets voor wie vaker de zaal in gaat. Zie [Kun je met een veldstick zaalhockeyen?](/kennis/veldstick-zaalhockey)',
    },
  ];
}

export function merkenFaq(now: Date = new Date()): FaqItem[] {
  const brands = getCatalogStats(now).brands;
  // Hand-checked field sticks only: their level comes with a source.
  const field = getAllProducts(now).filter((p) => getDiscipline(p) === 'veld');
  const brandsWith = (level: string) =>
    brands.filter((brand) => field.some((p) => p.brand === brand && p.experienceLevel.value === level));
  const beginner = brandsWith('beginner');
  const ervaren = brandsWith('ervaren');
  const shops = joinDutch(Object.values(RETAILERS).map((r) => r.label));
  return [
    {
      question: 'Welk hockeymerk is het beste?',
      answer: `Geen enkel merk is voor iedereen het best. We vergelijken sticks van ${brands.length} merken. In het deel van de catalogus dat we met de hand hebben nagekeken, hebben ${beginner.length} merken een veldstick voor beginners en ${ervaren.length} merken een veldstick voor ervaren spelers. Kies daarom eerst op lengte, kromming en ervaring; het merk is een voorkeur. De [stickwijzer](/stickwijzer) doet dat voor je.`,
    },
    {
      question: 'Welk merk heeft sticks voor beginners?',
      answer: `In onze met de hand nagekeken catalogus hebben ${joinDutch(beginner)} een veldstick die het merk of de winkel voor beginners noemt, of die wij zo inschatten. Bekijk ze per niveau op [veldsticks](/sticks).`,
    },
    {
      question: 'Waar koop je sticks van deze merken?',
      answer: `Bij onze partnerwinkels: ${shops}. Per stick zie je bij welke winkel hij te koop is, met de prijs inclusief verzending. Het verschil tussen de winkels staat in [Waar koop je een hockeystick?](/kennis/waar-koop-je-een-hockeystick)`,
    },
  ];
}
