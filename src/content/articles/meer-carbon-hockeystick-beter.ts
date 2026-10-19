import { getFieldProducts } from '@/catalog';
import { isJuniorStick } from '@/catalog/similar';
import { EXPERIENCE_LABELS } from '@/catalog/labels';
import type { Product } from '@/catalog/types';
import type { Article } from '../types';

const LEVELS: Product['experienceLevel']['value'][] = [
  'beginner',
  'gevorderd',
  'ervaren',
];

const adultFieldSticks = getFieldProducts().filter(
  (product) => !isJuniorStick(product),
);

/** One table row per level, generated from the catalog; a missing percentage is never estimated. */
function carbonRowForLevel(
  level: Product['experienceLevel']['value'],
): string[] {
  const sticks = adultFieldSticks.filter(
    (product) => product.experienceLevel.value === level,
  );
  const percentages = sticks.flatMap((product) =>
    product.carbonPercentage ? [product.carbonPercentage.value] : [],
  );
  const range =
    percentages.length > 0
      ? `${Math.min(...percentages)}% tot ${Math.max(...percentages)}%`
      : 'niet vermeld';
  return [
    EXPERIENCE_LABELS[level],
    String(sticks.length),
    String(percentages.length),
    range,
  ];
}

export const meerCarbonHockeystickBeter: Article = {
  slug: 'meer-carbon-hockeystick-beter',
  title: 'Is een hockeystick met meer carbon altijd beter?',
  intro:
    'Nee, meer carbon is niet altijd beter. Carbon maakt een stick stijver en directer, maar ook minder vergevingsgezind als je de bal net niet goed raakt. Of dat bij je past, hangt af van je ervaring, je spel en wat je fijn vindt. Als je nog aan je basis werkt, is een stick met minder carbon vaak een fijn startpunt. Hieronder lees je waarom, en hoe je rustig doorgroeit.',
  sections: [
    {
      heading: 'Wat doet carbon in een stick?',
      level: 2,
      body: [
        'Een composietstick is een mix van materialen, zoals glasvezel, aramide en carbon. Het carbonpercentage zegt hoeveel van die mix carbon is. Meer carbon maakt de stick meestal stijver, en een stijve stick voelt directer: wat je met je handen doet, komt snel terug in de bal.',
        'Of je liever hout, composiet of volledig carbon hebt, is een andere vraag. Dit artikel gaat alleen over het percentage binnen composietsticks.',
      ],
    },
    {
      heading: 'Waarom is meer carbon niet altijd beter?',
      level: 2,
      body: [
        'Directer is niet hetzelfde als beter. Een stijve stick geeft weinig mee. Neem je de bal net niet zuiver aan, dan springt hij sneller weg. Een soepeler stick vangt dat deels op en vergeeft dus meer.',
        'Daar komt bij dat het percentage maar één van de dingen is die bepalen hoe een stick voelt. Ook de kromming, het gewicht, de balans en de opbouw van het merk spelen mee. Twee sticks met hetzelfde percentage kunnen dus toch verschillend aanvoelen. Het cijfer is een hulpje, geen rapportcijfer.',
        'Een hoger percentage is dus ook niet vanzelf een betere koop. Meer over dit en andere veelgemaakte keuzefouten lees je in [zes veelgemaakte fouten bij het kiezen van een hockeystick](/blog/hockeystick-kiezen-praktische-tips).',
      ],
    },
    {
      heading: 'Hoeveel carbon past bij welk niveau?',
      level: 2,
      body: [
        'Een vaste norm is er niet. Onze tip als uitgangspunt: begin je of ben je nog volop aan het leren, kies dan een stick met minder carbon. Die vergeeft meer terwijl je aanname en slag nog groeien. Heb je de basis onder de knie en wil je een directer gevoel, dan is een stick met meer carbon een logische volgende stap. Zeker weten doen we het niet: sommige gevorderde spelers voelen zich juist prettiger bij een soepelere stick.',
        'Dat het niet in vaste percentages te vangen is, zie je ook in onze catalogus. Merken noemen sticks voor hetzelfde niveau met verschillende percentages.',
        {
          type: 'table',
          columns: [
            'Niveau volgens het merk of de winkel',
            'Veldsticks voor volwassenen',
            'Waarvan met carbonpercentage',
            'Genoemde percentages',
          ],
          rows: LEVELS.map(carbonRowForLevel),
        },
        'Dit zijn de sticks in onze catalogus, geen volledig overzicht van de markt. Staat er geen percentage bij een stick, dan tellen we hem niet mee in het bereik.',
        'Is het voor een kind? Lees dan [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
      ],
    },
    {
      heading: 'Zaal en veld',
      level: 2,
      body: [
        'Voor de zaal geldt hetzelfde verhaal: het percentage zegt iets over stijfheid, niet over of de stick goed bij jou past. Een aparte zaalstick is volgens de spelregels niet verplicht. Wil je er toch een, kijk dan bij de [zaalsticks](/zaalsticks) en maak in drie vragen een eerste selectie.',
      ],
    },
    {
      heading: 'Overstappen naar een stick met meer carbon',
      level: 2,
      body: [
        'Wil je meer carbon proberen? Doe het dan stap voor stap. Verander niet tegelijk de kromming, het percentage en het merk, want dan weet je daarna niet wat je nou wel of niet beviel. Een mooie volgende stap is een stick met een vergelijkbare kromming en iets meer carbon. Meer over de kromming lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
        'Let in de eerste weken op je aanname en je passes. Voelt het ineens onrustiger? Geef het even de tijd, maar kies anders gerust een stap terug. Dat is geen mislukking, het is gewoon ontdekken wat bij je past.',
      ],
    },
    {
      heading: 'Wat als het percentage er niet bij staat?',
      level: 2,
      body: [
        'Niet elk merk noemt het carbonpercentage. Staat het er niet bij, dan zie je bij ons "niet vermeld". Dat betekent niet dat er geen carbon in zit, en we gaan nooit gokken. Kijk dan naar wat het merk wel zegt, zoals het niveau en het bow-profiel. De uitleg van die begrippen vind je in [hockeystick-begrippen uitgelegd](/kennis/hoe-kies-je-de-juiste-hockeystick).',
      ],
    },
    {
      heading: 'Welke stick past bij jou?',
      level: 2,
      body: [
        'Liever geen cijfers uitpluizen? De [stickwijzer](/stickwijzer) vraagt naar je ervaring en spel, en laat sticks zien met de redenen erbij. Het carbonpercentage is daar één van de dingen die meetellen, niet de enige.',
        {
          type: 'note',
          text: 'Wij testen sticks niet zelf. Wat hier staat is gebaseerd op de gegevens van merken en winkels en op onze eigen uitgangspunten, en is geen garantie voor hoe een stick bij jou voelt.',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-19',
  updatedAt: '2026-10-19',
  sources: [
    {
      label:
        'Productgegevens (carbonpercentage, niveau): de productpagina’s op deze site, met bron per gegeven',
    },
    {
      label:
        'FIH Rules of Hockey (geen aparte zaalstick verplicht, technische grenzen aan de stick)',
    },
    {
      label:
        'Redactionele uitgangspunten jouwhockeystick.nl: geen eigen testresultaten of prestatiegaranties, geen vaste percentages per niveau',
    },
  ],
  metaDescription:
    'Is een hockeystick met meer carbon altijd beter? Nee. Lees wat carbon doet, hoeveel carbon bij je niveau past en hoe je rustig overstapt.',
};
