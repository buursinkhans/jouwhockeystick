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
  /** A quiet pointer to the shoe section (#100, decision log 2026-11-01). */
  shoesNote:
    'Ook zaalhockeyschoenen nodig? Bij de [hockeyschoenen](/hockeyschoenen?type=zaal) zie je per model of de zool non-marking is.',
  /**
   * "Wekelijks bijgewerkte winkelprijzen": the shop prices come from the
   * feeds through the weekly sync and disappear after 14 days, so "actueel"
   * would claim too much (decision log 2026-10-29).
   */
  metaDescription:
    'Zaalhockeystick kiezen of kopen? Lengte, bow en budget uitgelegd, met alle zaalsticks uit onze catalogus naast elkaar en wekelijks bijgewerkte winkelprijzen.',
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-05',
  updatedAt: '2026-11-09',
  /** Answers the main question within the first 80 words. */
  intro:
    'Een zaalhockeystick kies je net als een veldstick op lengte, niveau en gevoel, maar met het zaalspel in gedachten. In de zaal mag je de bal niet slaan en alleen omhoog spelen bij een schot op doel. Zaalhockey draait daardoor om pushen, balcontrole en snelle acties in een kleine ruimte. Voor de stick zelf gelden volgens de spelregels dezelfde maximale eisen als op het veld; merken ontwerpen zaalsticks wel voor dat andere spel. Hieronder vergelijk je alle zaalhockeysticks uit onze catalogus op lengte, bow en prijs, met bij elke stick een link naar de partnerwinkels die hem verkopen.',
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
  /** The finder (2026-11-09): three questions that filter the one list of sticks below. */
  finder: {
    heading: 'Vind je zaalstick',
    intro:
      'Beantwoord een, twee of alle drie de vragen. De lijst eronder past zich meteen aan, van laag naar hoog in prijs.',
    playerLabel: 'Voor wie zoek je een zaalstick?',
    sizeLabel: 'Welke sticklengte zoek je?',
    sizeUnknown: 'Ik weet mijn maat niet',
    heightLabel: 'Lichaamslengte',
    heightUnit: 'cm, zonder schoenen',
    heightHelp: 'We gebruiken dezelfde lengtetabel als de stickwijzer.',
    budgetLabel: 'Wat wil je uitgeven?',
    budgetNone: 'Geen voorkeur',
    budgetNote: 'Op de prijs die op de kaart staat: de laagste winkelprijs uit de feeds van hooguit 14 dagen oud, inclusief verzending, anders de richtprijs.',
    clear: 'Wis je keuze',
    resultsHeading: 'Alle zaalhockeysticks in onze catalogus',
    resultsHeadingFiltered: 'Zaalsticks die bij je keuze passen',
    sortNote:
      'Van laag naar hoog in prijs. Dit is een selectie op maat en budget, geen persoonlijk advies: op de pagina van elke stick zie je het profiel, de bronnen en de prijzen per winkel.',
    importedHeading: 'Uit de winkelfeeds, nog niet met de hand gecontroleerd',
    importedNote:
      'Deze gegevens komen uit de productfeeds van PassaHockey, Plutosport, HockeyCity en Daka. Controleer maat en specificaties bij de winkel.',
    loading: 'Sticks uit de winkelfeeds laden…',
    counting: 'Even tellen…',
    loadError: 'Laden lukte niet. Probeer het nog een keer.',
    more: 'Toon meer sticks',
    noneInBudget: (count: number) =>
      `Geen zaalstick in deze prijsklasse. Met een andere prijsklasse zijn er ${count}.`,
    showAllBudgets: 'Toon alle prijsklassen',
    noneInSize: 'In deze lengte hebben we op dit moment geen zaalstick.',
    shorterHeading: 'Eén maat korter',
    shorterNote:
      'Deze sticks zijn één maat korter dan het lengteadvies. Dat kan werken, maar pas de stick bij voorkeur eerst in de hand. Een langere stick tonen we bewust niet.',
    personalAdvice: 'Vraag persoonlijk advies',
  },
  /**
   * Short, self-contained answers to the questions people ask (and AI search
   * quotes), each pointing to the article that goes deeper, so the long
   * explanations are not repeated here (2026-11-09). Editorial reading.
   */
  whoFits: {
    heading: 'Welke zaalstick past bij wie?',
    note: 'Redactioneel advies op basis van de spelregels en de productgegevens van de merken; geen eigen test.',
    items: [
      {
        title: 'Voor een kind',
        body: 'Kies eerst de lengte uit de [lengtetabel](/kennis/hockeystick-lengte-tabel): dezelfde maat als op het veld, niet groter ‘op de groei’. Daarna is een lichte stick met weinig of geen carbon een logische richting, omdat balcontrole in de zaal zwaarder weegt dan slagkracht. Meer in [zaalstick voor kinderen](/kennis/zaalstick-voor-kinderen).',
      },
      {
        title: 'Voor een beginner',
        body: 'Er is geen beste zaalstick voor iedereen. Wie nog aan de basis werkt, heeft vaak het meeste aan een stick met weinig carbon en een rustig bow-profiel: die vergeeft een bal die je net niet goed raakt. [Is meer carbon altijd beter?](/kennis/meer-carbon-hockeystick-beter)',
      },
      {
        title: 'Hoeveel carbon?',
        body: 'Meer carbon maakt een stick stijver en directer. Dat kan passen bij een ervaren speler die hard en precies wil pushen; een kind of beginner merkt vooral dat zo’n stick minder vergeeft. Op elke stickpagina zie je of het percentage van het merk komt of van een winkel.',
      },
      {
        title: 'Wanneer is een duurdere stick zinvol?',
        body: 'Als je vaak speelt, je techniek staat en je weet welk profiel je fijn vindt. Het zaalseizoen is kort; speel je ook veldhockey, dan is een betaalbare tweede stick een logische afweging. Per prijsklasse zie je wat je krijgt in [wat krijg je voor een klein of ruim budget?](/kennis/zaalstick-budget)',
      },
    ],
  },
  /** Who makes this page and where the data comes from (2026-11-09). */
  howWeWork: {
    heading: 'Zo maken we deze pagina',
    items: [
      'De redactie van jouwhockeystick.nl schrijft het advies. Wie dat zijn, lees je op [over ons](/over-ons); hoe we tot een advies komen in [zo werkt ons advies](/methodiek).',
      'Productgegevens komen van de website van het merk, of van een winkel als het merk ze niet noemt. Op de pagina van elke stick staat per gegeven de bron en de datum. Sticks uit de winkelfeeds zijn nog niet met de hand gecontroleerd en staan apart.',
      'Prijzen komen uit de productfeeds van onze partnerwinkels, worden wekelijks bijgewerkt en zijn hooguit 14 dagen oud, inclusief verzendkosten voor zover bekend.',
      'We krijgen een vergoeding als je via een link koopt. Dat verandert de volgorde niet: de lijst staat op prijs, en de winkel is de verkoper. Hoe de winkels verschillen lees je in [waar koop je een hockeystick?](/kennis/waar-koop-je-een-hockeystick)',
    ],
  },
  /** Short answers to the questions people search for; details live in the linked articles. */
  faq: {
    heading: 'Veelgestelde vragen over de zaalhockeystick',
    items: [
      {
        question:
          'Wat is het verschil tussen een zaalhockeystick en een veldhockeystick?',
        answer:
          'Volgens de spelregels geen: voor beide gelden dezelfde maximale eisen voor dikte, kromming, gewicht en lengte. Het verschil zit in het ontwerp. Merken maken zaalsticks voor pushen, balcontrole en snelle acties in een kleine ruimte, bijvoorbeeld met een kleinere krul. Meer over het [verschil tussen een veld- en zaalstick](/kennis/veldstick-zaalhockey).',
      },
      {
        question: 'Welke lengte zaalhockeystick heb je nodig?',
        answer:
          'Dezelfde lengte als je veldstick. Weet je die niet, gebruik dan de [lengtetabel](/kennis/hockeystick-lengte-tabel) of vul in de keuzehulp bovenaan je lichaamslengte in; die laat ook zien in welke maten de zaalsticks er zijn. Koop een kinderstick niet extra groot ‘op de groei’.',
      },
      {
        question: 'Kun je met je veldstick zaalhockeyen?',
        answer:
          'Ja, dat mag volgens de spelregels. Een aparte zaalstick is een keuze, geen verplichting. Wat je wint en wat je inlevert lees je in [kun je met een veldstick zaalhockeyen?](/kennis/veldstick-zaalhockey).',
      },
      {
        question: 'Waar kun je een zaalhockeystick kopen?',
        answer:
          'Waar je wilt: in een hockeywinkel, de clubshop of online. Wil je de stick eerst in je handen hebben, dan is een winkel in de buurt handig. Bestel je online, neem dan de modelnaam en de lengte mee, zodat je precies dezelfde stick krijgt. Op de pagina van elke stick zie je welke van onze partnerwinkels hem verkopen; dat zijn partnerlinks en de winkel is de verkoper. Hoe de winkels verschillen in verzendkosten, retourneren en bezorging, lees je in [waar koop je een hockeystick?](/kennis/waar-koop-je-een-hockeystick).',
      },
    ],
    /** Built from the catalog on the page, so the numbers never go stale. */
    price: {
      question: 'Wat kost een zaalhockeystick?',
      answer: (count: number, min: string, max: string) =>
        `In onze catalogus staan ${count} zaalhockeysticks met een richtprijs van ${min} tot ${max}. Op de pagina van elke stick zie je bij welke partnerwinkels hij te koop is en voor welke prijs, inclusief verzendkosten voor zover die bekend zijn; die prijzen werken we wekelijks bij. Waar het verschil in zit en wat je voor je budget kunt verwachten, lees je in [wat krijg je voor een klein of ruim budget?](/kennis/zaalstick-budget).`,
    },
  },
  stickwijzerNote:
    'De stickwijzer geeft op dit moment alleen advies voor veldsticks. Voor zaalsticks kies je hier zelf, met de drie vragen bovenaan.',
} as const;
