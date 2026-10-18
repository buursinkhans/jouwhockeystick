import type { Brand } from '@/catalog/types';

export type BrandQuote = {
  quote: string;
  attribution: string;
  sourceUrl: string;
  /** Set when the quote is published in a language other than Dutch. */
  language?: string;
};

export type BrandPhilosophy = {
  paragraphs: string[];
  sources: { label: string; url: string }[];
  /** YYYY-MM-DD */
  checkedAt: string;
};

export type BrandProfile = {
  brand: Brand;
  logoUrl?: string;
  /** JDH's official logo file is white — needs a dark chip to stay visible. */
  logoBackground: 'light' | 'dark';
  characteristics: string;
  characteristicsSourceUrl: string;
  nationalTeamNote?: string;
  nationalTeamSourceUrl?: string;
  quotes?: BrandQuote[];
  /**
   * "Hoe denkt dit merk over sticks?": only what the brand says on its own
   * website, attributed to the brand. Left out when the site says nothing.
   */
  philosophy?: BrandPhilosophy;
  hasCatalogProducts: boolean;
};

export const BRAND_PROFILES: BrandProfile[] = [
  {
    brand: 'Grays',
    logoUrl:
      'https://www.grays-hockey.eu/cdn/shop/files/Grays_Hockey_LOGOS_Positive.png?v=1613528562',
    logoBackground: 'light',
    characteristics:
      'Grays bouwt zijn sticks rond eigen curve-families (Jumbow, Probow, Dynabow) en noemt op zijn productpagina\'s een "graphene-enhanced matrix" en "solvent-free core construction" als kernmateriaaltechnologie. Grays vermeldt op zijn officiële site geen carbonpercentages per model.',
    characteristicsSourceUrl:
      'https://www.grays-hockey.eu/collections/jb-jumbow-composite-hockey-sticks/products/jb10-composite-hockey-stick-1',
    nationalTeamNote:
      'Grays sponsort via "Team Grays" meerdere Nederlandse international, onder wie olympisch kampioenen Derck de Vilder, Lisa Post en Steijn van Heijningen (Parijs 2024).',
    nationalTeamSourceUrl: 'https://www.grays-hockey.eu/pages/team-grays',
    quotes: [
      {
        quote:
          'Ik keep al sinds ik klein met OBO en heb eigenlijk nooit iets anders geprobeerd of hoeven te proberen. Ik speel met sticks van Grays.',
        attribution: 'Sam van der Ven, Nederlands international keeper',
        sourceUrl:
          'https://hockeystyle.nl/stories/sam-van-der-ven-hes-got-your-back-de-sterke-arm-van-zijn-team',
      },
    ],
    philosophy: {
      paragraphs: [
        'Grays begint bij de vorm. Het merk heeft elf bows, en volgens Grays is elke bow ontworpen voor een eigen speelstijl of positie. De collectie is daarom ingedeeld rond die vormen, zodat je makkelijker ziet welke stickfamilie bij je vaardigheden past.',
        'Grays noemt zichzelf het oudste hockeymerk ter wereld. Het maakte in de jaren 1870 al sticks van essenhout en bracht in 1998 als eerste een reeks composietsticks uit. Sindsdien werkt het met graphene in de materiaalmix en met een schuimkern, die in de AeroCore-sticks volgens Grays zorgt voor gevoel, kracht en balans.',
        'De AeroCore-collectie is volgens Grays ontwikkeld in "talloze feedbacksessies met topsporters". Voor jongere spelers maakt het juniorsticks die lichter en vergevingsgezinder zijn.',
      ],
      sources: [
        {
          label: 'Grays — Hoe kies je de juiste hockeystick',
          url: 'https://www.grays-hockey.eu/nl/blogs/blog/how-to-choose-the-right-grays-hockey-stick-for-you',
        },
        {
          label: 'Grays — Over Grays Hockey',
          url: 'https://www.grays-hockey.eu/nl/blogs/blog/grays-hockey-about-us',
        },
        {
          label: 'Grays — Waarom AeroCore-sticks',
          url: 'https://www.grays-hockey.eu/nl/blogs/blog/why-choose-grays-aerocore-ac-hockey-sticks',
        },
      ],
      checkedAt: '2026-10-18',
    },
    hasCatalogProducts: true,
  },
  {
    brand: 'Brabo',
    logoUrl:
      'https://brabohockey.com/cdn/shop/files/logo-brabo.svg?v=1711717685&width=300',
    logoBackground: 'light',
    characteristics:
      'Brabo noemt zichzelf op zijn officiële site "Nederlands hockeymerk sinds 1968" en werkt met eigen technologienamen: Forged Carbon (hoge-druk samengeperst carbon), Pro Bow (curve op 260mm) en 12K Carbon (fijngeweven carbon voor extra stugheid).',
    characteristicsSourceUrl: 'https://brabohockey.com/en/pages/about-us',
    nationalTeamNote:
      "Brabo heeft officiële atletenpagina's voor Nederlandse internationals, waaronder olympisch kampioenen (Parijs 2024) Thierry Brinkman (aanvoerder Oranje heren) en Pien Sanders (Oranje dames, tweevoudig olympisch kampioen).",
    nationalTeamSourceUrl:
      'https://brabohockey.com/en/pages/athletes/thierry-brinkman',
    quotes: [
      {
        quote:
          'The hockeystick I use is very good for the basic stuff. (trapping, shooting, receiving bouncy balls)',
        attribution: 'Thierry Brinkman, aanvoerder Oranje heren',
        sourceUrl: 'https://brabohockey.com/en/pages/athletes/thierry-brinkman',
        language:
          'Engelstalig citaat, zoals gepubliceerd op de officiële Brabo-website',
      },
      {
        quote:
          'I have been playing with Brabo since my childhood. My role models played with it, and I came into contact with Joep. The brand radiates what I want to radiate myself.',
        attribution: 'Pien Sanders, Oranje dames',
        sourceUrl: 'https://brabohockey.com/en/pages/athletes/pien-sanders',
        language:
          'Engelstalig citaat, zoals gepubliceerd op de officiële Brabo-website',
      },
    ],
    philosophy: {
      paragraphs: [
        'Brabo ontwikkelt vanuit de praktijk. Oprichter Jan van den Brandt was zelf hockeykeeper en begon in 1968 in Boxtel met betere keepersbescherming, omdat die er nauwelijks was. Volgens Brabo staat het merk nog altijd voor producten die ontwikkeld zijn vanuit praktijkervaring.',
        'Bij sticks laat Brabo de stijfheid meegroeien met de speler, op een schaal van 1 tot 10. Een stijfheid van 1 of 2 is voor beginners: soepele materialen zoals hout of glasvezel, die fouten vergeven en helpen de basis te leren. 3 tot 5 is voor spelers die doorgroeien, met een mix van glasvezel en carbon. 6 tot 10 is voor gevorderde spelers die maximale kracht en snelheid zoeken. Het doel, schrijft Brabo: goede spullen voor iedereen, van internationals tot kinderen die net beginnen.',
      ],
      sources: [
        {
          label: 'Brabo — Over Brabo Hockey',
          url: 'https://brabohockey.com/pages/about-brabohockey',
        },
        {
          label: 'Brabo — Technology',
          url: 'https://brabohockey.com/en/pages/technology',
        },
      ],
      checkedAt: '2026-10-18',
    },
    hasCatalogProducts: true,
  },
  {
    brand: 'JDH',
    logoUrl:
      'https://cdn.prod.website-files.com/66a8c3d29cba08af0beff107/66aac20d941be1874fe1c466_logo-white-jdh.avif',
    logoBackground: 'dark',
    characteristics:
      'JDH is een multisportmerk ("All Sports. One Goal.") met voor hockey de merkfilosofie "Beyond limits. Powered by performance. Driven by discipline." JDH noemt op zijn site geen specifieke, eigen materiaaltechnologie zoals sommige concurrenten wel doen.',
    characteristicsSourceUrl: 'https://www.jdhsports.eu',
    nationalTeamNote:
      'JDH voert Koen Bijen (Oranje heren, olympisch kampioen Parijs 2024) en Marijn Veen (Oranje dames, olympisch kampioen Parijs 2024) op als ambassadeur — onafhankelijk bevestigd via hockey.nl.',
    nationalTeamSourceUrl: 'https://www.jdhsports.eu/team-jdh',
    hasCatalogProducts: true,
  },
  {
    brand: 'Princess',
    logoUrl:
      'https://www.princess-hockey.com/cdn/shop/files/Princess_-_logo_Black.png?v=1714973755',
    logoBackground: 'light',
    characteristics:
      'Princess is een Nederlands merk (opgericht 2003, hockeysticks sinds 2005) en staat bekend om zijn "Star"-classificatie: elke stick krijgt 2 tot 7 sterren, oplopend met het carbonpercentage — van circa 10% carbon bij 2 sterren tot 100% carbon bij 7 sterren.',
    characteristicsSourceUrl:
      'https://princesshockey.co.za/pages/stick-technology',
    philosophy: {
      paragraphs: [
        'Princess bouwt elke stick op uit drie keuzes: het carbon, de curve en de details. Meer carbon maakt de stick volgens Princess stijver, met meer kracht in je slag. De curve bepaalt hoe de stick met de bal meebeweegt. Princess heeft zes curves, van mid bow tot een extreme low bow voor de sleeppush.',
        'Een star rating van 1 tot 10 laat zien waar een stick in de lijn staat. Voor beginners is er een houten stick, versterkt met glasvezel. En verder? "Hockey is een manier van leven", schrijft Princess: plezier hoort erbij.',
      ],
      sources: [
        {
          label: 'Princess — Technologie',
          url: 'https://www.princess-hockey.com/pages/technologie',
        },
        {
          label: 'Princess — Over ons',
          url: 'https://www.princess-hockey.com/pages/about-us',
        },
      ],
      checkedAt: '2026-10-18',
    },
    hasCatalogProducts: true,
  },
  {
    brand: 'adidas',
    logoBackground: 'light',
    characteristics:
      'De officiële adidas-website blokkeert geautomatiseerd bezoek. De sticks in onze catalogus zijn daarom gesourced via bol.com-listings (onze verkooppartner) in plaats van adidas zelf; de Carbon- en Compo1-lijnen gebruiken volgens gangbare hockeywinkels een "Dual Rod System" (twee massieve carbonstaven in de schacht) voor extra stugheid en slagkracht.',
    characteristicsSourceUrl:
      'https://www.hockeydirect.com/collections/adidas-hockey-sticks',
    nationalTeamNote:
      'adidas is sinds 1999 officieel partner van de KNHB en levert de kleding/kit voor de Nederlandse jeugd- en A-teams (heren en dames) — dit is een kledingsponsoring, geen bevestigde koppeling met welke stick de spelers daadwerkelijk gebruiken.',
    nationalTeamSourceUrl: 'https://www.knhb.nl/over-knhb/partners/adidas',
    hasCatalogProducts: true,
  },
  {
    brand: 'Osaka',
    logoBackground: 'light',
    characteristics:
      'Osaka is opgericht in 2011 en vernoemd naar de Japanse stad, uit bewondering voor de Japanse cultuur en ontwerpstijl. Het merk noemt design "het startpunt van het hele productontwikkelingsproces" en kiest voor eenvoud: minimaal, strak en functioneel, volgens het principe "less is more". Osaka noemt op die pagina geen eigen materiaaltechnologie.',
    characteristicsSourceUrl: 'https://osakaworld.com/pages/about',
    nationalTeamNote:
      'Osaka presenteert Yibbi Jansen (Oranje dames, olympisch kampioen Parijs 2024) als ambassadeur. Op haar atletenpagina staat de Osaka x Yibbi-stick, en het merk heeft een eigen Yibbi-collectie.',
    nationalTeamSourceUrl: 'https://osakaworld.com/blogs/athletes/yibbi-jansen',
    philosophy: {
      paragraphs: [
        'Osaka begint bij design. Het merk is genoemd naar de Japanse stad, uit bewondering voor de Japanse vormgeving: eenvoudig, strak en functioneel, "less is more". Design is volgens Osaka het startpunt van de hele productontwikkeling, met de nadruk op veelzijdigheid, functionaliteit en duurzaamheid.',
        "Voor wie net begint, heeft Osaka een uitleg met video's over de grip, de push, slaan, de sweep en het stoppen van de bal.",
      ],
      sources: [
        { label: 'Osaka — About', url: 'https://osakaworld.com/pages/about' },
        {
          label: 'Osaka — How to hockey',
          url: 'https://osakaworld.com/nl-nl/pages/how-to-hockey',
        },
      ],
      checkedAt: '2026-10-18',
    },
    hasCatalogProducts: true,
  },
  {
    brand: 'The Indian Maharadja',
    logoBackground: 'light',
    characteristics:
      'The Indian Maharadja is volgens de eigen site een Nederlands lifestyle-hockeymerk, opgericht in 2009 in Amsterdam. Het merk is gebouwd rond het motto "East meets West": geïnspireerd door oosterse mystiek en westers hedendaags design. Het maakt kleurrijke jeugdsticks en sticks voor gevorderde spelers, en daarnaast teamkleding en clubartikelen.',
    characteristicsSourceUrl:
      'https://www.indianmaharadja.com/about-theindianmaharadja',
    philosophy: {
      paragraphs: [
        'The Indian Maharadja is een Nederlands lifestylemerk, in 2009 opgericht in Amsterdam, met als motto "East meets West": oosterse mystiek en westers design. Het merk wil spelers helpen hun eigen doelen te halen met kwaliteit, innovatie en opvallende ontwerpen, van kleurrijke jeugdsticks tot stijlvolle sticks voor gevorderden. Hoe het een stick technisch opbouwt, vertelt het merk op zijn site niet.',
      ],
      sources: [
        {
          label: 'The Indian Maharadja — About',
          url: 'https://www.indianmaharadja.com/about-theindianmaharadja',
        },
      ],
      checkedAt: '2026-10-18',
    },
    hasCatalogProducts: true,
  },
  {
    brand: 'TK',
    logoBackground: 'light',
    characteristics:
      'TK staat voor oprichter Thomas Kille, die al begin jaren zeventig als speler experimenteerde met sticks versterkt met glasvezel. In 1985 kwamen de eerste TK-sticks in de verkoop. Het logo met twee olifanten met gekruiste slurven verwijst naar de bully waarmee een wedstrijd toen begon. Volgens TK hadden op de Olympische Spelen van 1992 in Barcelona tien medaillewinnaars een stick met dat logo. Sinds 2020 voert TK Sports GmbH het merk.',
    characteristicsSourceUrl:
      'https://www.tk-sports.eu/de/news/pressemitteilung-staffeluebergabe-bei-tk-hockey',
    hasCatalogProducts: true,
  },
  {
    brand: 'Ritual',
    logoBackground: 'light',
    characteristics:
      'Ritual is een Australisch merk, opgericht door Nathaniel Nelson, die eerder bij andere hockeymerken werkte. De sticks worden in Australië ontworpen en volgens het merk getest door internationale spelers. Ritual noemt composiet met kevlar en carbon van lucht- en ruimtevaartleveranciers uit Nederland en Japan. Het merk zegt bewust geen hockeymateriaal "voor de massa" te maken, maar zich te richten op een kleine reeks sticks.',
    characteristicsSourceUrl: 'https://ritualhockey.com/pages/about-us',
    philosophy: {
      paragraphs: [
        'Ritual wil geen sticks voor de massa maken, maar sticks voor spelers die veel van hun stick vragen. Elke stick is volgens Ritual ontworpen voor één speelstijl: "generieke sticks" zitten er niet in het assortiment. Er is een stick voor lage, snelle aerials/scoopen, een voor spelers die meer rechtop spelen, een voor sleeppushspecialisten en een voor keepers.',
        'Ritual houdt het assortiment bewust klein. Ontwerpers, ingenieurs en sportwetenschappers werken met prototypes, die internationale spelers testen. Een stick die de lat niet haalt, komt niet uit. Het carbon en kevlar komen volgens Ritual van leveranciers in Nederland en Japan, en aan één stick zit tot tien uur handwerk.',
      ],
      sources: [
        {
          label: 'Ritual — About us',
          url: 'https://ritualhockey.com/pages/about-us',
        },
        {
          label: 'Ritual — Technology',
          url: 'https://ritualhockey.com/en-gb/pages/technology',
        },
      ],
      checkedAt: '2026-10-18',
    },
    hasCatalogProducts: true,
  },
  {
    brand: 'Scoop',
    logoBackground: 'light',
    characteristics:
      'Van Scoop hebben we geen officiële merkwebsite gevonden. De Scoop-zaalsticks in onze catalogus en hun gegevens komen daarom uit de productinformatie op bol.com, onze partnerwinkel, en niet van het merk zelf. Over de achtergrond van het merk kunnen we zonder officiële bron niets zeggen.',
    characteristicsSourceUrl:
      'https://www.bol.com/nl/nl/p/zaalhockeystick-19-indoor-mid-bow-20-carbon-hockeystick-senior-36-5-inch/9300000049502863/',
    hasCatalogProducts: true,
  },
  {
    brand: 'Stag',
    logoBackground: 'light',
    characteristics:
      'Van Stag hebben we geen officiële merkwebsite met informatie over hockeysticks gevonden. De Stag-juniorstick in onze catalogus en de gegevens daarvan komen uit de productinformatie op bol.com, onze partnerwinkel, en niet van het merk zelf. Over de achtergrond van het merk kunnen we zonder officiële bron niets zeggen.',
    characteristicsSourceUrl:
      'https://www.bol.com/nl/nl/p/stag-magic-hockeystick-jr-bow-junior-blauw-33-inch/9300000066814940/',
    hasCatalogProducts: true,
  },
  {
    brand: 'Y1',
    logoBackground: 'light',
    characteristics:
      'Y1 begon volgens de eigen site in 2012 in een studentenkamer aan de universiteit van Exeter (Verenigd Koninkrijk) en startte in 2015 met hockey. Het merk zegt producten te ontwikkelen "with players, not for them" en noemt zichzelf sinds 2021 het eerste klimaatneutrale hockeymerk. Volgens Y1 speelden op de Spelen van Parijs 2024 27 atleten met Y1.',
    characteristicsSourceUrl: 'https://y1sport.com/pages/unity-history-of-y1',
    philosophy: {
      paragraphs: [
        'Y1 ontwikkelt samen met de spelers die ermee spelen. Elke stick wordt volgens Y1 gevormd, gewogen en getest met atleten die er elke week mee op het veld staan, en internationals denken mee over het ontwerp. Werkt iets niet op zaterdag, dan gaat het niet de deur uit, zegt het merk.',
        'Per stick beschrijft Y1 welke vaardigheid de vorm moet helpen, zoals 3D-acties, liften op de backhand of de sleeppush. Daarnaast noemt Y1 zich sinds 2021 het eerste klimaatneutrale hockeymerk; de uitstoot van elke stick wordt volgens Y1 gecompenseerd.',
      ],
      sources: [
        {
          label: 'Y1 — Homepage (Cosmic-collectie)',
          url: 'https://y1sport.com/',
        },
        {
          label: 'Y1 — LB 70 (Cosmic 2026)',
          url: 'https://y1sport.com/products/lb-70-2026',
        },
        {
          label: 'Y1 — Geschiedenis van Y1',
          url: 'https://y1sport.com/pages/unity-history-of-y1',
        },
      ],
      checkedAt: '2026-10-18',
    },
    hasCatalogProducts: true,
  },
  {
    brand: 'Reece',
    logoBackground: 'light',
    characteristics:
      'Reece Australia maakt volgens de eigen site deel uit van de Deventrade Group, een Nederlands familiebedrijf dat in 1985 werd opgericht en vooral bekend is van teamkleding. Reece maakt hockeysticks voor jeugd en senioren, voor veld en zaal; in onze catalogus vooral junior- en zaalsticks.',
    characteristicsSourceUrl: 'https://www.reeceaustralia.com/nl/over-reece/',
    hasCatalogProducts: true,
  },
  {
    brand: 'Ravi',
    logoBackground: 'light',
    characteristics:
      'Van Ravi hebben we geen officiële merkwebsite gevonden. De Ravi-sticks in onze catalogus worden op bol.com door Ravi zelf verkocht; de gegevens komen uit die productinformatie, niet van een merksite. Over de achtergrond van het merk kunnen we zonder officiële bron niets zeggen.',
    characteristicsSourceUrl:
      'https://www.bol.com/nl/nl/p/ravi-hockeystick-mid-bow-70-carbon-black-36-5/9300000196468789/',
    hasCatalogProducts: true,
  },
  {
    brand: 'Csign',
    logoBackground: 'light',
    characteristics:
      'Van Csign hebben we geen officiële merkwebsite gevonden. De Csign-sticks in onze catalogus en hun gegevens komen uit de productinformatie op bol.com, onze partnerwinkel. De samenstelling (carbon, twaron, fiberglass) staat in de productnaam. Over de achtergrond van het merk kunnen we zonder officiële bron niets zeggen.',
    characteristicsSourceUrl:
      'https://www.bol.com/nl/nl/p/csign-sports-hockeystick-senior-40-carbon-10-twaron-50-fiberglass-low-bow-24mm/9300000008476394/',
    hasCatalogProducts: true,
  },
  {
    brand: 'Malik',
    logoBackground: 'light',
    characteristics:
      'Van Malik hebben we geen officiële merkwebsite gevonden. De Malik-sticks in onze catalogus komen uit de productinformatie van PassaSports; bol.com verkoopt ze niet. Over de achtergrond van het merk kunnen we zonder officiële bron niets zeggen.',
    characteristicsSourceUrl:
      'https://www.passasports.nl/hockey/hockeysticks/_brand-Malik',
    hasCatalogProducts: true,
  },
  {
    brand: 'Nike',
    logoBackground: 'light',
    characteristics:
      'De Nike-sticks in onze catalogus en hun gegevens komen uit de productfeed van PassaHockey (PassaSports), onze partnerwinkel. We hebben ze nog niet met de eigen website van Nike vergeleken.',
    characteristicsSourceUrl: 'https://www.passasports.nl/hockey/hockeysticks',
    hasCatalogProducts: true,
  },
  {
    brand: 'Yibbi',
    logoBackground: 'light',
    characteristics:
      'Van Yibbi hebben we geen officiële merkwebsite gecontroleerd. De Yibbi-sticks in onze catalogus en hun gegevens komen uit de productfeed van PassaHockey (PassaSports), onze partnerwinkel. Over de achtergrond van het merk kunnen we zonder officiële bron niets zeggen.',
    characteristicsSourceUrl: 'https://www.passasports.nl/hockey/hockeysticks',
    philosophy: {
      paragraphs: [
        'Yibbi draait om zelfvertrouwen: met lef het veld op en durven laten zien wie je bent. De oprichter, zelf hockeyspeelster, schrijft dat een klein detail een jonge speler net dat beetje extra zelfvertrouwen kan geven. De stick is volgens het merk na uitgebreid testen ontwikkeld voor het juiste gevoel en de juiste balans, met een strak ontwerp.',
      ],
      sources: [
        {
          label: 'Yibbi — Over Yibbi',
          url: 'https://osakaworld.com/pages/yibbi-about',
        },
      ],
      checkedAt: '2026-10-18',
    },
    hasCatalogProducts: true,
  },
];
