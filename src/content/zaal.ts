/**
 * Copy for the /zaalsticks page. Rule statements cite the FIH rule books;
 * product-specific statements stay on the product records with their own
 * sources. Everything else is labelled as our editorial reading.
 */
export const ZAAL_SOURCES = {
  indoorRules: {
    label: 'FIH, Rules of Indoor Hockey, geldig vanaf 1 december 2023',
    url: 'https://www.fih.hockey/static-assets/pdf/fih-rules-of-indoor-hockey-2023.pdf',
  },
  fieldRules: {
    label: 'FIH, Rules of Hockey, geldig vanaf maart 2026',
    url: 'https://www.fih.hockey/static-assets/pdf/fih-Rules-of-hockey-2026-final.pdf',
  },
  graysIndoor: {
    label:
      'Grays, collectie Indoor Hockey Sticks (productpagina’s, geraadpleegd 5 oktober 2026)',
    url: 'https://www.grays-hockey.eu/collections/indoor-hockey-sticks',
  },
  bolListings: {
    label:
      'bol.com, productlistings van de zaalsticks van Grays (4i, 6i), Scoop, The Indian Maharadja en TK (geraadpleegd 5 oktober 2026)',
    url: 'https://www.bol.com/nl/nl/s/?searchtext=zaalhockeystick',
  },
} as const;

export const ZAAL = {
  title: 'Zaalhockeystick kiezen: waar let je op in de zaal?',
  /** Search-result title (<title>), aimed at the queries in Search Console; the H1 stays `title`. */
  seoTitle: 'Zaalhockeystick kiezen en kopen: zaalsticks vergeleken',
  navLabel: 'Zaalsticks',
  metaDescription:
    'Welke zaalhockeystick past bij jou of je kind? Lengte, bow en budget uitgelegd, met de zaalsticks uit onze catalogus naast elkaar, met richtprijs en bron.',
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-05',
  updatedAt: '2026-10-23',
  /** Answers the main question within the first 80 words. */
  intro:
    'Een zaalhockeystick kies je net als een veldstick op lengte, niveau en gevoel, maar met het zaalspel in gedachten. In de zaal mag je de bal niet slaan en alleen omhoog spelen bij een schot op doel. Zaalhockey draait daardoor om pushen, balcontrole en snelle acties in een kleine ruimte. Voor de stick zelf gelden volgens de spelregels dezelfde maximale eisen als op het veld; merken ontwerpen zaalsticks wel voor dat andere spel.',
  differences: {
    heading: 'Wat is er anders in de zaal?',
    items: [
      {
        title: 'Niet slaan, alleen pushen en flicken',
        body: 'Slaan is in de zaal niet toegestaan, ook niet als "slap": de bal speel je met een push langs de grond of met een flick.',
        source: 'FIH Rules of Indoor Hockey, regel 9.5 en definities',
      },
      {
        title: 'De bal blijft laag',
        body: 'Je mag de bal niet van de grond spelen, behalve bij een schot op doel. Onbedoeld minder dan 10 cm omhoog is geen overtreding, tenzij er een tegenstander dichtbij is.',
        source: 'FIH Rules of Indoor Hockey, regel 9.9',
      },
      {
        title: 'Zes spelers en boarding',
        body: 'Een team staat met maximaal zes spelers in het veld. Langs de zijkant staat boarding; gaat de bal daaroverheen, dan volgt een vrije push.',
        source: 'FIH Rules of Indoor Hockey, terminologie en regel 7',
      },
    ],
  },
  stickRules: {
    heading: 'Gelden er andere eisen voor de stick?',
    paragraphs: [
      'Nee, de maximale eisen zijn gelijk. In beide spelregelboeken moet de stick door een ring van 51 mm passen, mag de kromming (bow) maximaal 25 mm zijn, mag de stick niet zwaarder zijn dan 737 gram en niet langer dan 105 cm.',
      'Een zaalstick is dus geen spelregeleis, maar een keuze voor een stick die is ontworpen voor het zaalspel. Grays beschrijft zijn zaalmodellen bijvoorbeeld met een "Micro headshape for tight indoor spaces and quick skills".',
    ],
  },
  choosing: {
    heading: 'Waar let je op bij een zaalstick?',
    note: 'Dit is onze redactionele vertaling van de spelregels naar een keuze, geen meting.',
    items: [
      {
        title: 'Lengte',
        body: 'Gebruik hetzelfde lengteadvies als voor een veldstick. Koop niet extra groot ‘op de groei’.',
      },
      {
        title: 'Controle boven slagkracht',
        body: 'Omdat je in de zaal niet slaat, weegt balcontrole bij het aannemen en pushen doorgaans zwaarder dan maximale power.',
      },
      {
        title: 'Bow-profiel',
        body: 'Een lage kromming is gericht op flicks, liften en 3D; een rustiger profiel maakt strak vlak pushen vaak makkelijker. Kies naar het spel dat de speler in de zaal speelt.',
      },
      {
        title: 'Budget',
        body: 'De zaal is een kort seizoen. Speel je ook veldhockey, dan is het een logische afweging hoeveel je aan een tweede stick uitgeeft.',
      },
    ],
  },
  selector: {
    heading: 'Snel een eerste selectie',
    intro:
      'Drie vragen: voor wie, bij een kind de lengte, en het budget. Je ziet meteen welke zaalsticks in de juiste maat en binnen je budget vallen.',
  },
  /** Short answers to the questions people search for; details live in the linked articles. */
  faq: {
    heading: 'Veelgestelde vragen over de zaalhockeystick',
    items: [
      {
        question:
          'Wat is het verschil tussen een zaalhockeystick en een veldhockeystick?',
        answer:
          'Volgens de spelregels geen: voor beide gelden dezelfde maximale eisen voor dikte, kromming, gewicht en lengte. Het verschil zit in het ontwerp. Merken maken zaalsticks voor pushen, balcontrole en snelle acties in een kleine ruimte, bijvoorbeeld met een kleinere krul. Meer lees je in [kun je met een veldstick zaalhockeyen?](/kennis/veldstick-zaalhockey).',
      },
      {
        question: 'Welke lengte zaalhockeystick heb je nodig?',
        answer:
          'Dezelfde lengte als je veldstick. Volwassen zaalsticks vind je meestal in 36,5 en 37,5 inch. Voor kinderen gebruik je de [lengtetabel](/kennis/hockeystick-lengte-tabel), en koop je niet extra groot ‘op de groei’.',
      },
      {
        question: 'Kun je met je veldstick zaalhockeyen?',
        answer:
          'Ja, dat mag volgens de spelregels. Een aparte zaalstick is een keuze, geen verplichting. Wat je wint en wat je inlevert lees je in [kun je met een veldstick zaalhockeyen?](/kennis/veldstick-zaalhockey).',
      },
    ],
    /** Built from the catalog on the page, so the numbers never go stale. */
    price: {
      question: 'Wat kost een zaalhockeystick?',
      answer: (count: number, min: string, max: string) =>
        `In onze catalogus staan ${count} zaalsticks met een richtprijs van ${min} tot ${max}. Waar het verschil in zit en wat je voor je budget kunt verwachten, lees je in [wat krijg je voor een klein of ruim budget?](/kennis/zaalstick-budget).`,
    },
  },
  catalogHeading: 'Alle zaalsticks in onze catalogus',
  stickwijzerNote:
    'De stickwijzer geeft op dit moment alleen advies voor veldsticks. Voor zaalsticks vergelijk je hieronder zelf, van laag naar hoog in prijs. Bij elke stick staat of een gegeven van het merk komt of van een winkel-listing op bol.com.',
} as const;
