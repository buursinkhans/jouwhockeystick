import type { ContentItem } from '../content';

/**
 * Pilot "zaalhockey 2026" (PUSH campaign, docs/marketing/pilot-zaalhockey.md).
 * Ten items, all status "concept": nothing goes to Metricool before the owner
 * approves them in the Social-studio. Five reuse a studio concept that was
 * never posted (studioId); five are new, chosen from the Search Console report
 * of 2026-11-09. Facts only from the source page in this repo; no prices, no
 * stick names, no claims (docs/instagram.md §2).
 */
const base = {
  campagne: 'zaalhockey-2026',
  fase: 'push',
  status: 'concept',
  metricool: {},
} as const;

const TAGS = ['#hockey', '#zaalhockey', '#zaalhockeystick', '#hockeystick', '#hockeyouders', '#jeugdhockey'];
const PARTNER = 'Op de site staan partnerlinks naar winkels; daarvoor krijgen we een kleine vergoeding. Die speelt geen rol in ons advies.';

export const ZAALHOCKEY_PILOT: ContentItem[] = [
  {
    ...base,
    id: '20261117-veld-of-zaalstick',
    doelgroep: 'ouders',
    onderwerp: 'Kun je met een veldstick zaalhockeyen?',
    bronpagina: '/kennis/veldstick-zaalhockey',
    kanalen: ['instagram', 'facebook'],
    vorm: 'carrousel',
    datum: '2026-11-17',
    hook: 'Moet je kind een aparte zaalstick hebben?',
    tekst: `Moet je kind een aparte zaalstick hebben?

Volgens de FIH gelden voor een veld- en een zaalstick dezelfde maximale eisen. Een aparte zaalstick is dus geen verplichting.

Het verschil zit in het spel. In de zaal sla je de bal niet en blijft hij laag. Je speelt met een push of een flick.

Gaat je kind voor het eerst de zaal in, of speelt het er maar een paar keer? Dan is de veldstick een prima start. Speelt het vaak binnen, dan kan een zaalstick een logische stap zijn.

Link in bio.

${PARTNER}`,
    onderdelen: [
      'Opening: Moet je kind een aparte zaalstick hebben?',
      'Spelregels: dezelfde maximale eisen voor veld en zaal (FIH).',
      'Spel: in de zaal sla je niet, de bal blijft laag.',
      'Veldstick genoeg: eerste zaalseizoen, of maar een paar keer spelen.',
      'Zaalstick logisch: je speelt vaak binnen of neemt het zaalspel serieus.',
      'Slot: Lees het verschil op de site.',
    ],
    hashtags: [...TAGS, '#partnerlink'],
    media: 'Nieuwe carrousel in de Social-studio (6 slides, huisstijl); geen foto nodig.',
    cta: 'Lees het verschil op de site',
    studioId: null,
  },
  {
    ...base,
    id: '20261119-zaal-is-geen-veld',
    doelgroep: 'spelers',
    onderwerp: 'Zaalhockey is geen veldhockey binnen: drie regels',
    bronpagina: '/zaalsticks',
    kanalen: ['instagram', 'facebook', 'youtube', 'tiktok'],
    vorm: 'short',
    datum: '2026-11-19',
    hook: 'Zaalhockey is geen veldhockey binnen',
    tekst: `Zaalhockey is geen veldhockey binnen. Drie regels zijn anders. Slaan mag niet, ook geen slap: je speelt met een push langs de grond of met een flick. De bal blijft laag; van de grond spelen mag alleen bij een schot op doel. En je staat met hooguit zes spelers in het veld, met boarding langs de zijkant. Ander spel, andere keuze. Alle zaalsticks staan op jouwhockeystick.nl.`,
    onderdelen: [
      'Hook: Zaalhockey is geen veldhockey binnen',
      'Niet slaan, ook geen slap',
      'De bal blijft laag, behalve bij een schot op doel',
      'Zes spelers en boarding',
      'Slot: Kies je stick voor het zaalspel',
    ],
    hashtags: ['#zaalhockey', '#hockey', '#hockeyregels', '#shorts'],
    media: 'Bestaande video in de Social-studio (videos/20261106-zaal-is-geen-veld); renderen via de video-workflow.',
    cta: 'Doe de stickwijzer of kijk bij de zaalsticks',
    studioId: '20261106-zaal-is-geen-veld',
  },
  {
    ...base,
    id: '20261121-zaalstick-kiezen',
    doelgroep: 'ouders',
    onderwerp: 'Zaalstick kiezen: waar let je op?',
    bronpagina: '/zaalsticks',
    kanalen: ['instagram', 'facebook'],
    vorm: 'beeld',
    datum: '2026-11-21',
    hook: 'Zaalstick kiezen: waar let je op?',
    tekst: `Zaalstick kiezen: waar let je op?

Lengte: gebruik hetzelfde lengteadvies als voor een veldstick, en koop niet extra groot op de groei.
Controle: in de zaal sla je niet, dus balcontrole bij aannemen en pushen weegt doorgaans zwaarder dan power.
Bow-profiel: een lage kromming is gericht op flicks, liften en 3D; een rustiger profiel maakt vlak pushen vaak makkelijker.
Budget: de zaal is een kort seizoen. Speel je ook veld, dan is het een afweging hoeveel je aan een tweede stick uitgeeft.

Op de site kies je met drie vragen: voor wie, welke lengte en welk budget. Link in bio.

${PARTNER}`,
    onderdelen: ['Opening: Zaalstick kiezen: waar let je op? Lengte, controle, bow-profiel en budget.'],
    hashtags: [...TAGS, '#partnerlink'],
    media: 'Bestaande slide in de Social-studio (posts/20261105-zaalstick-kiezen).',
    cta: 'Kies op de site met drie vragen',
    studioId: '20261105-zaalstick-kiezen',
  },
  {
    ...base,
    id: '20261126-zaal-carbon',
    doelgroep: 'ouders',
    onderwerp: 'Meer carbon in de zaal?',
    bronpagina: '/kennis/zaalstick-voor-kinderen',
    kanalen: ['instagram', 'facebook', 'youtube', 'tiktok'],
    vorm: 'short',
    datum: '2026-11-26',
    hook: 'Meer carbon? In de zaal niet per se',
    tekst: `Meer carbon in een zaalstick? Dat levert in de zaal vaak weinig op. Je slaat er niet, je speelt met push en flick. Een soepele stick met weinig of geen carbon vergeeft het als een aanname net niet lukt. En het zaalseizoen duurt een paar maanden: geef pas meer uit als je weet wat het oplevert. Alle zaalsticks, met de bron per gegeven, staan op de site.`,
    onderdelen: [
      'Hook: Meer carbon? In de zaal niet per se',
      'In de zaal sla je niet',
      'Soepel vergeeft meer',
      'Kort seizoen',
      'Slot: Welke past bij jou? Op de site.',
    ],
    hashtags: ['#zaalhockey', '#hockeystick', '#hockeyouders', '#shorts'],
    media: 'Bestaande video in de Social-studio (videos/20261101-zaal-carbon); renderen via de video-workflow.',
    cta: 'Bekijk de zaalsticks op de site',
    studioId: '20261101-zaal-carbon',
  },
  {
    ...base,
    id: '20261128-zaalstick-budget',
    doelgroep: 'ouders',
    onderwerp: 'Waar zit het verschil in prijs bij een zaalstick?',
    bronpagina: '/kennis/zaalstick-budget',
    kanalen: ['instagram', 'facebook'],
    vorm: 'carrousel',
    datum: '2026-11-28',
    hook: 'Zaalstick: wat krijg je voor je geld?',
    tekst: `Wat krijg je voor je geld bij een zaalstick?

Het verschil zit vooral in het materiaal, het carbonpercentage, het bow-profiel en de maten. Of een duurdere stick ook beter speelt, is persoonlijk: dat hangt af van je techniek en wat jij fijn vindt.

Meer carbon maakt een stick stijver. In de zaal sla je niet, dus die stijfheid levert bij pushen en aannemen misschien weinig op.

Low bow of mid bow is een keuze en zegt niets over kwaliteit. De maat kies je op lichaamslengte.

Per prijsniveau zie je op de site wat er in onze catalogus staat. Link in bio.

${PARTNER}`,
    onderdelen: [
      'Opening: Zaalstick: wat krijg je voor je geld?',
      'Materiaal en carbon: stijver levert in de zaal misschien weinig op.',
      'Bow-profiel: een keuze, geen kwaliteitslabel.',
      'Maat kies je op lengte.',
      'Slot: Per prijsniveau op de site.',
    ],
    hashtags: [...TAGS, '#partnerlink'],
    media: 'Bestaande carrousel in de Social-studio (posts/20261029-zaalstick-budget).',
    cta: 'Lees meer op de site',
    studioId: '20261029-zaalstick-budget',
  },
  {
    ...base,
    id: '20261201-vind-je-zaalstick',
    doelgroep: 'ouders',
    onderwerp: 'De nieuwe zaalstickkeuze in drie vragen',
    bronpagina: '/zaalsticks',
    kanalen: ['instagram', 'facebook', 'youtube', 'tiktok'],
    vorm: 'reel',
    datum: '2026-12-01',
    hook: 'Zaalstick zoeken? Drie vragen',
    tekst: `Zaalstick zoeken voor je kind? Op jouwhockeystick.nl beantwoord je drie vragen. Voor wie is de stick. Welke lengte. En wat wil je uitgeven. Weet je de maat niet, vul dan de lichaamslengte in, zonder schoenen. De lijst past zich meteen aan, van laag naar hoog in prijs. Per stick zie je de bron van elk gegeven en de prijzen per winkel.`,
    onderdelen: [
      'Hook: Zaalstick zoeken? Drie vragen',
      'Vraag 1: voor wie (kind of volwassene)',
      'Vraag 2: welke lengte, of je lichaamslengte zonder schoenen',
      'Vraag 3: wat wil je uitgeven',
      'De lijst past zich meteen aan',
      'Slot: jouwhockeystick.nl/zaalsticks',
    ],
    hashtags: ['#zaalhockey', '#zaalhockeystick', '#hockeyouders', '#shorts'],
    media: 'Nieuw: schermopname van /zaalsticks op een telefoon (30 s) of een studio-video met deze scènes. Nog niet gemaakt.',
    cta: 'Probeer het op de site',
    studioId: null,
  },
  {
    ...base,
    id: '20261203-zaalstick-maat-kind',
    doelgroep: 'ouders',
    onderwerp: 'Welke maat zaalstick voor je kind?',
    bronpagina: '/kennis/hockeystick-lengte-tabel',
    kanalen: ['instagram', 'facebook'],
    vorm: 'beeld',
    datum: '2026-12-03',
    hook: 'Welke maat zaalstick voor je kind?',
    tekst: `Welke maat zaalstick heeft je kind nodig?

Dezelfde maat als op het veld. De lengtetabel geeft per lichaamslengte een stickmaat in inch. Meet je kind zonder schoenen.

Koop de stick niet extra groot op de groei. Een te lange stick maakt de bal dicht bij je lichaam lastiger te controleren, en in de zaal draait alles om controle.

Zit je kind tussen twee maten? Laat de houdingscheck beslissen: kan het ontspannen dribbelen met de stick dicht bij het lichaam? Blijf je twijfelen, kies dan de kortere.

De tabel staat op de site. Link in bio.`,
    onderdelen: ['Opening: Welke maat zaalstick voor je kind? Dezelfde maat als op het veld.'],
    hashtags: ['#hockey', '#zaalhockey', '#hockeystick', '#jeugdhockey', '#hockeyouders', '#lengtetabel'],
    media: 'Nieuwe slide in de Social-studio (één beeld, huisstijl).',
    cta: 'Bekijk de lengtetabel',
    studioId: null,
  },
  {
    ...base,
    id: '20261205-stickregels-25-mm',
    doelgroep: 'spelers',
    onderwerp: 'Dezelfde stickeisen in de zaal',
    bronpagina: '/kennis/veldstick-zaalhockey',
    kanalen: ['instagram', 'facebook', 'youtube', 'tiktok'],
    vorm: 'short',
    datum: '2026-12-05',
    hook: '25 mm: meer kromming mag niet',
    tekst: `25 millimeter: meer kromming mag een hockeystick niet hebben, op het veld en in de zaal. De FIH stelt voor beide dezelfde maximale eisen. De stick moet door een ring van 51 millimeter passen, mag niet zwaarder zijn dan 737 gram en niet langer dan 105 centimeter. Een zaalstick is dus een keuze voor het spel binnen. Het verschil lees je op jouwhockeystick.nl.`,
    onderdelen: [
      'Hook: 25 mm: meer kromming mag niet',
      'Door een ring van 51 mm',
      'Maximaal 737 gram',
      'Maximaal 105 cm',
      'Veld en zaal: dezelfde eisen (FIH)',
      'Slot: het verschil op de site',
    ],
    hashtags: ['#hockey', '#hockeyregels', '#zaalhockey', '#shorts'],
    media: 'Nieuwe video in de Social-studio (soort "hockey", hooktype "getal"); bron FIH in de beschrijving.',
    cta: 'Lees het verschil op de site',
    studioId: null,
  },
  {
    ...base,
    id: '20261208-eerste-zaalseizoen',
    doelgroep: 'spelers',
    onderwerp: 'Je eerste zaalseizoen: is je veldstick genoeg?',
    bronpagina: '/kennis/veldstick-zaalhockey',
    kanalen: ['facebook'],
    vorm: 'post',
    datum: '2026-12-08',
    hook: 'Je eerste zaalseizoen: is je veldstick genoeg?',
    tekst: `Je eerste zaalseizoen? Dan is je veldstick vaak genoeg.

Een seizoen met je eigen stick is een goede manier om te ontdekken of zaalhockey bij je past. Speel je maar een paar keer binnen, dan kost een tweede stick veel voor weinig speeltijd. En heeft je veldstick al een rustig profiel, dan gaan vlak pushen en aannemen vanzelfsprekend.

Wanneer een zaalstick wel een logische stap is, lees je op jouwhockeystick.nl.`,
    onderdelen: ['Tekstpost met link naar de bronpagina (Facebook toont de linkpreview).'],
    hashtags: [],
    media: 'Geen beeld nodig: Facebook maakt een preview van de link.',
    cta: 'Lees wanneer een zaalstick zinvol is',
    studioId: null,
  },
  {
    ...base,
    id: '20261212-zaalstick-3-dingen',
    doelgroep: 'ouders',
    onderwerp: 'Zaalhockeystick kopen: drie dingen om op te letten',
    bronpagina: '/zaalsticks',
    kanalen: ['instagram', 'facebook', 'youtube', 'tiktok'],
    vorm: 'short',
    datum: '2026-12-12',
    hook: 'Zaalhockeystick kopen? Check deze 3',
    tekst: `Zaalhockeystick kopen? Check dan drie dingen. De lengte: dezelfde maat als op het veld, niet groter. De controle: in de zaal sla je niet, dus aannemen en pushen tellen het meest. En het bow-profiel: een lage kromming is gericht op flicks en 3D, een rustiger profiel maakt vlak pushen makkelijker. Alle zaalsticks staan op de site, van laag naar hoog in prijs.`,
    onderdelen: [
      'Hook: Zaalhockeystick kopen? Check deze 3',
      'Lengte',
      'Controle',
      'Bow-profiel',
      'Slot: alle zaalsticks op de site',
    ],
    hashtags: ['#zaalhockey', '#zaalhockeystick', '#hockeyouders', '#shorts'],
    media: 'Bestaande video in de Social-studio (videos/20261108-zaalstick-3-dingen); renderen via de video-workflow.',
    cta: 'Bekijk de zaalsticks',
    studioId: '20261108-zaalstick-3-dingen',
  },
];
