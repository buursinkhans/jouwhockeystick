/**
 * Content for /clubs: a free page hockey clubs can share with parents of new
 * members. Referenced by the club-outreach agent (docs/club-outreach.md).
 * UI lives in src/app/clubs/page.tsx; the length table comes from
 * LENGTH_GUIDE so it always matches the stickwijzer.
 */
export const CLUBS_PAGE = {
  title: 'Stickadvies voor nieuwe leden van jouw hockeyclub',
  metaDescription:
    'Gratis voor hockeyclubs: een printbare lengtetabel, een link naar de stickwijzer en een kant-en-klare tekst voor je nieuwsbrief of ouder-app.',
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-12',
  updatedAt: '2026-10-12',
  intro: [
    'Welke stick moet mijn kind hebben? Die vraag krijgt elke jeugdcommissie aan het begin van het seizoen. Op deze pagina vind je gratis materiaal om nieuwe leden en hun ouders op weg te helpen: een printbare lengtetabel, een link naar onze stickwijzer en een tekst die je zo in je nieuwsbrief of ouder-app kunt zetten. Je hoeft je nergens voor aan te melden en er zit geen tegenprestatie aan vast.',
  ],
  newsletterHeading: 'Tekst voor je nieuwsbrief of ouder-app',
  newsletterIntro:
    'Kopieer deze tekst en pas hem gerust aan. Je mag hem zonder bronvermelding gebruiken.',
  newsletterText: [
    'Nieuw bij de club en nog geen stick? Kies vooral een stick die past bij de lengte van je kind, niet een te lange om in te groeien: met een passende stick leert je kind de techniek makkelijker.',
    'Twijfel je over de maat, of over zaal- en veldsticks? Op jouwhockeystick.nl/stickwijzer krijg je in een paar vragen een onafhankelijk stickadvies, met uitleg waarom een stick wel of niet past. De lengtetabel staat op jouwhockeystick.nl/kennis/hockeystick-lengte-tabel.',
  ],
  tableHeading: 'Printbare lengtetabel',
  tableIntro:
    'Een richtlijn per lichaamslengte, gemeten zonder schoenen. Dezelfde tabel gebruikt de stickwijzer. Print deze pagina of sla hem via je browser op als pdf; de navigatie valt bij het printen weg.',
  tableNote:
    'Dit is een redactionele richtlijn, geen norm van de KNHB of een fabrikant. Op de grens tussen twee maten noemen we beide.',
  honestyHeading: 'Wie zijn wij',
  honesty: [
    "jouwhockeystick.nl is een onafhankelijke Nederlandse site die spelers en ouders helpt een passende stick te kiezen. We verkopen zelf niets. Bij sommige sticks linken we naar bol.com; koopt iemand via zo'n link, dan krijgen we een kleine vergoeding van bol.com. Die vergoeding speelt geen rol in het advies, en de stickwijzer laat ook sticks zien die bol.com niet verkoopt.",
    'Liever iets anders voor je club, zoals een tabel in clubkleuren of een andere tekst? Mail ons gerust.',
  ],
} as const;
