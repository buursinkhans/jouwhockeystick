import {
  DIRECT_MIN_CARBON,
  HIGH_CARBON,
  SOFT_MAX_CARBON,
} from '@/advice-engine/carbon';
import { getFieldProducts } from '@/catalog';
import { isJuniorStick } from '@/catalog/similar';
import { EXPERIENCE_LABELS } from '@/catalog/labels';
import type { Product } from '@/catalog/types';
import { METHODE } from '../methode';
import type { Article } from '../types';

const LEVELS: Product['experienceLevel']['value'][] = [
  'beginner',
  'gevorderd',
  'ervaren',
];

const adultFieldSticks = getFieldProducts().filter(
  (product) => !isJuniorStick(product),
);

/** Band edges derived from the engine's rule of thumb, so the text cannot drift from it. */
const BALANCED_FROM = SOFT_MAX_CARBON + 1;
const BALANCED_TO = DIRECT_MIN_CARBON - 1;
const DIRECT_TO = HIGH_CARBON - 1;

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
  title: 'Hoeveel carbon heeft je hockeystick nodig?',
  seoTitle: 'Hoeveel carbon in je hockeystick? 30, 50, 70 of 90%',
  intro:
    'Voor beginners en jonge kinderen is 0 tot 30% carbon meestal genoeg. Veel clubhockeyers zitten goed rond de 50%. Een stick met 70% of 90% is stijf en direct, en past vooral bij spelers die de bal al zuiver aannemen en slaan. Meer carbon maakt een stick stijver; of dat bij je past, hangt af van je techniek en wat je prettig vindt. Dit zijn uitgangspunten, geen vaste norm: merken noemen voor hetzelfde niveau verschillende percentages.',
  sections: [
    {
      heading: 'Wat is het carbonpercentage?',
      level: 2,
      body: [
        'Het carbonpercentage is het aandeel carbonvezel in de vezelmix van een composietstick. De rest is meestal glasvezel, soms aangevuld met aramide (bekend van de merknaam Kevlar). Carbon maakt de stick stijf, glasvezel buigt meer mee en aramide dempt trillingen.',
        'Bij een goede slag buigt een stijve stick nauwelijks door, zodat je kracht direct in de bal gaat. Bij het aannemen werkt het andersom: een harde pass wordt minder opgevangen, dus de bal springt sneller van je stick als je hem niet netjes dempt.',
        'Het percentage is een grove indicatie. Vezelsoort, vezelrichting, hars en opbouw verschillen per merk, waardoor twee sticks met allebei 70% carbon anders kunnen aanvoelen. Dit artikel gaat over composietsticks; een houten stick bevat geen carbon.',
        {
          type: 'note',
          text: '**Hockeytermen in dit artikel.** **Aannemen:** de bal stoppen en onder controle krijgen. **Pushen:** de bal wegschuiven zonder uithaal. **Flatsen:** een harde, platte slag waarbij de stick laag over de grond gaat. **Slaan:** een slag met uithaal. **Kromming (bow):** de bocht in de stick, zichtbaar als je hem van opzij bekijkt.',
        },
      ],
    },
    {
      heading: 'Hoeveel carbon past bij wie?',
      level: 2,
      body: [
        {
          type: 'table',
          columns: ['Carbon', 'Stickgevoel (onze vuistregel)', 'Kan passen bij'],
          rows: [
            [`Tot ${SOFT_MAX_CARBON}%`, 'Zacht', 'Beginners, jonge jeugd, recreanten'],
            [
              `${BALANCED_FROM} tot ${BALANCED_TO}%, bijvoorbeeld 50%`,
              'Gebalanceerd',
              'Veel clubhockeyers',
            ],
            [
              `${DIRECT_MIN_CARBON} tot ${DIRECT_TO}%`,
              'Direct',
              'Gevorderden met een goede techniek',
            ],
            [
              `${HIGH_CARBON}% en meer`,
              'Zeer direct',
              'Ervaren spelers die bewust een stijve stick zoeken',
            ],
          ],
        },
        `Deze indeling gebruikt de stickwijzer om het stickgevoel in te schatten. In de ${METHODE.name} is carbon een indicatie van het stickgevoel (onderdeel [Stick](/methodiek#stick)) en nooit een maatstaf voor kwaliteit. Is de eerste aanname nog in ontwikkeling, dan adviseert de stickwijzer geen stick met ongeveer ${HIGH_CARBON}% carbon of meer.`,
        'Merken houden zich niet aan vaste grenzen. Dat zie je in onze catalogus: voor hetzelfde niveau noemen ze verschillende percentages.',
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
      ],
    },
    {
      heading: `Tot ${SOFT_MAX_CARBON}% carbon: voor wie de basis nog leert`,
      level: 2,
      body: [
        'Ben je net begonnen of oefen je nog veel op aannemen en pushen, neem dan een soepele stick. Die vangt een pass deels voor je op, dus de bal blijft ook bij een niet helemaal zuivere aanname in de buurt. Deze sticks zijn vaak ook goedkoper.',
        'Bij harde slagen voelt een soepele stick minder direct. Dat merk je pas als je slagtechniek goed genoeg is.',
        'Voor beginnende volwassenen geldt hetzelfde. Met een goede balcoördinatie kan 40 of 50% ook prettig zijn. Van een dure stick met veel carbon word je niet sneller beter, en overstappen kan later altijd nog.',
      ],
    },
    {
      heading: 'Rond 50% carbon: voor de meeste clubhockeyers',
      level: 2,
      body: [
        'Train en speel je elke week, dan is 50% een logisch startpunt. Zo’n stick is stijver dan een beginnersmodel, maar je hoeft de bal nog niet perfect te dempen.',
        'Veel spelers denken dat ze na een paar jaar hockey door moeten naar 70% of 90%. Dat hoeft niet. Ook met 50% carbon kun je op hoog niveau spelen.',
      ],
    },
    {
      heading: '70% carbon: meer directheid, minder marge',
      level: 2,
      body: [
        'Bij 70% begin je aan de stijve sticks. Met een goede slagtechniek voelen passen, flatsen en slaan directer aan. Harder slaan gaat niet vanzelf: je moet de bal nog steeds zuiver raken, met genoeg snelheid in je slag.',
        'Bij het aannemen moet je zelf meer dempen, omdat de stick minder meegeeft. Reken ook op een hogere prijs dan bij vergelijkbare sticks met minder carbon.',
      ],
    },
    {
      heading: '90% carbon of meer: voor ervaren spelers',
      level: 2,
      body: [
        'Een stick met 90% carbon is zeer stijf. Een technisch sterke speler die van een direct gevoel houdt, kan er bij harde passes en slagen voordeel van hebben.',
        'Het gevoel is harder en een slordige aanname kaatst sneller weg. Bij dribbelen en passen heb je weinig aan de extra stijfheid, en de prijs ligt meestal hoger. Twijfel je, probeer dan ook een stick met 70% en kijk welke prettiger speelt.',
      ],
    },
    {
      heading: 'Twijfel tussen 50% en 70%',
      level: 2,
      body: [
        'Speel je al een paar jaar en is je techniek behoorlijk goed, dan kies je waarschijnlijk tussen deze twee.',
        {
          type: 'table',
          columns: ['Waar let je op?', '50% carbon', '70% carbon'],
          rows: [
            ['Aannemen', 'Vergevingsgezinder', 'Vraagt meer precisie'],
            ['Slagkracht', 'Ruim voldoende voor veel spelers', 'Extra stijfheid kan helpen'],
            ['Balgevoel', 'Relatief soepel', 'Relatief direct'],
            ['Techniek', 'Past bij uiteenlopende niveaus', 'Vooral bij een stabiele techniek'],
          ],
        },
        'Een voorbeeld: je speelt in een seniorenteam, je aannames zijn goed en je wilt meer directheid bij het flatsen. Dan is 70% het proberen waard. Merk je tijdens het testen dat je de bal met 50% makkelijker onder controle houdt, kies dan die.',
      ],
    },
    {
      heading: 'Voor ouders: hoeveel carbon heeft je kind nodig?',
      level: 2,
      body: [
        'Een kind dat nog leert hockeyen, heeft weinig aan een stijve stick. Een model met weinig of geen carbon werkt meestal beter. Voor technisch sterke jeugdspelers worden sticks met 30 tot 50% carbon interessant, en een ervaren jeugdspeler kan ook met 70% goed uit de voeten.',
        'Selectieniveau is op zich geen reden voor meer carbon. Speelt je kind goed met een stick van 40%, dan hoeft het niet over naar 70% omdat teamgenoten dat doen. Lengte, gewicht en hanteerbaarheid zijn bij kinderen belangrijker dan het percentage.',
        'Let bij het kopen op deze punten:',
        {
          type: 'list',
          ordered: true,
          items: [
            'Kan je kind de stick makkelijk bewegen?',
            'Lukt het om een harde pass aan te nemen?',
            'Past de lengte bij de lichaamslengte? Meet zonder schoenen en kijk in de [lengtetabel](/kennis/hockeystick-lengte-tabel).',
          ],
        },
        'Meer over de eerste stick lees je in [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners). Liever direct een voorstel? De [stickwijzer](/stickwijzer) houdt rekening met leeftijd, niveau en lengte.',
      ],
    },
    {
      heading: 'Is meer carbon altijd beter?',
      level: 2,
      body: [
        'Nee. Meer carbon maakt een stick stijver en directer, en daarmee ook minder vergevingsgezind als je de bal net niet goed raakt. Of dat een voordeel is, hangt af van je techniek.',
        'Een hoger percentage is ook niet vanzelf een betere koop. De prijs hangt mede af van merk, productiemethode, afwerking en ontwerp. Een stick van 50% die prettig in je handen ligt, is een betere aankoop dan een dure 90%-stick die je niet onder controle krijgt. Wat sticks per prijsklasse kosten, lees je in [wat kost een hockeystick?](/kennis/wat-kost-een-hockeystick). Meer keuzefouten lees je in [zes veelgemaakte fouten bij het kiezen van een hockeystick](/blog/hockeystick-kiezen-praktische-tips).',
      ],
    },
    {
      heading: 'Kijk ook naar kromming, lengte en balans',
      level: 2,
      body: [
        'Carbon is maar één van de specificaties. De kromming telt ook mee: een mid bow is veelzijdig en makkelijk in gebruik, een low bow helpt bij liften en 3D-skills (trucs waarbij je de bal van de grond haalt). Het verschil lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
        'Een verkeerde lengte beïnvloedt je houding en techniek. Bij het gewicht gaat het vooral om de balans: waar het gewicht zit, merk je meer dan hoe zwaar de stick in totaal is. Daardoor kan een 70%-stick met een andere kromming en balans prettiger spelen dan een 50%-model, of juist andersom.',
      ],
    },
    {
      heading: 'Overstappen naar een stick met meer carbon',
      level: 2,
      body: [
        'Verander niet tegelijk de kromming, het percentage en het merk, want dan weet je daarna niet wat je wel of niet beviel. Een goede volgende stap is een stick met een vergelijkbare kromming en iets meer carbon.',
        'Let in de eerste weken op je aanname en je passes. Voelt het onrustiger, geef het dan even de tijd. Blijft het zo, kies dan gerust een stap terug.',
      ],
    },
    {
      heading: 'Zo test je welk percentage bij je past',
      level: 2,
      body: [
        'Pak in de winkel of bij een teamgenoot twee of drie sticks met ongeveer dezelfde lengte en kromming, maar een ander carbonpercentage. Doe met elke stick hetzelfde rondje:',
        {
          type: 'list',
          ordered: true,
          items: [
            'Neem vijf harde passes aan. Hoe makkelijk houd je de bal onder controle?',
            'Push een paar ballen naar een medespeler. Gaat de bal waar je hem wilt hebben?',
            'Flats en sla een paar keer. Voel je verschil in kracht of directheid?',
            'Dribbel met snelle richtingsveranderingen. Welke stick voelt het prettigst?',
          ],
        },
        'Kies de stick waarmee je de meeste acties goed uitvoert, ook als een andere stick bij de slag net wat harder aanvoelt.',
      ],
    },
    {
      heading: 'Wat als het percentage er niet bij staat?',
      level: 2,
      body: [
        'Niet elk merk noemt het carbonpercentage. Staat het er niet bij, dan zie je bij ons "niet vermeld". Dat betekent niet dat er geen carbon in zit, en we gaan nooit gokken. Kijk dan naar wat het merk wel zegt, zoals het niveau en het bow-profiel. Hoe je bow-profiel, carbon en niveau samen weegt, lees je in [welke hockeystick kopen?](/kennis/hoe-kies-je-de-juiste-hockeystick).',
      ],
    },
    {
      heading: 'Veelgestelde vragen',
      level: 2,
      body: [],
    },
    {
      heading: 'Hoeveel procent carbon heeft een beginner nodig?',
      level: 3,
      body: [
        `Een beginnende hockeyer heeft meestal genoeg aan een stick met 0 tot ${SOFT_MAX_CARBON}% carbon. Zo’n stick is soepeler en vergevingsgezinder bij het aannemen. Lengte, gewicht en kromming zijn minstens zo belangrijk.`,
      ],
    },
    {
      heading: 'Is 50% carbon genoeg voor een goede hockeyer?',
      level: 3,
      body: [
        'Ja, een stick met 50% carbon kan prima passen bij een ervaren clubhockeyer. Het percentage bepaalt niet hoe goed je speelt. Ben je tevreden over je controle en slagkracht, dan hoef je niet over te stappen.',
      ],
    },
    {
      heading: 'Kun je met meer carbon harder slaan?',
      level: 3,
      body: [
        'Een stijvere stick kan bij een goed uitgevoerde slag meer balsnelheid geven. Zonder goede techniek en swingsnelheid levert meer carbon weinig op.',
      ],
    },
    {
      heading: 'Is het carbonpercentage per merk vergelijkbaar?',
      level: 3,
      body: [
        'Niet helemaal. Vezels, constructie, hars, balans en kromming verschillen per merk, dus twee sticks met hetzelfde percentage kunnen anders aanvoelen. Vergelijk daarom meer dan alleen het percentage.',
      ],
    },
    {
      heading: 'Heeft een zaalhockeystick carbon nodig?',
      level: 3,
      body: [
        'Niet per se. In de zaal draait het vooral om nauwkeurig pushen, dribbelen en aannemen, en het percentage zegt ook daar alleen iets over stijfheid. Een aparte zaalstick is volgens de spelregels niet verplicht. Wil je er toch een, kijk dan bij de [zaalsticks](/zaalsticks).',
      ],
    },
    {
      heading: 'Welke stick past bij jou?',
      level: 2,
      body: [
        'In de [stickwijzer](/stickwijzer) beantwoord je een paar vragen over je ervaring en je spel, en krijg je maximaal drie sticks met de redenen erbij. Zelf vergelijken kan bij de [veldhockeysticks](/sticks): daar staat het carbonpercentage bij elke stick, met de bron.',
        {
          type: 'note',
          text: 'Wij testen sticks niet zelf. Wat hier staat is gebaseerd op de gegevens van merken en winkels en op onze eigen uitgangspunten, en is geen garantie voor hoe een stick bij jou voelt.',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-19',
  updatedAt: '2026-11-13',
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
      label: `Adviesregels van de stickwijzer: stickgevoel zacht tot ${SOFT_MAX_CARBON}% en direct vanaf ${DIRECT_MIN_CARBON}% carbon; geen sticks met ongeveer ${HIGH_CARBON}% carbon of meer als de eerste aanname nog in ontwikkeling is (zie /methodiek)`,
    },
    {
      label:
        'Redactionele uitgangspunten jouwhockeystick.nl: geen eigen testresultaten of prestatiegaranties',
    },
  ],
  metaDescription:
    'Beginners zitten goed met 0 tot 30% carbon, clubhockeyers vaak rond 50%. Wat carbon doet, wanneer 70 of 90% past en hoe je het zelf test.',
};
