import type { Brand } from '@/catalog/types';

export type BrandQuote = {
  quote: string;
  attribution: string;
  sourceUrl: string;
  /** Set when the quote is published in a language other than Dutch. */
  language?: string;
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
    hasCatalogProducts: true,
  },
  {
    brand: 'The Indian Maharadja',
    logoBackground: 'light',
    characteristics:
      'The Indian Maharadja is volgens de eigen site een Nederlands lifestyle-hockeymerk, opgericht in 2009 in Amsterdam. Het merk is gebouwd rond het motto "East meets West": geïnspireerd door oosterse mystiek en westers hedendaags design. Het maakt kleurrijke jeugdsticks en sticks voor gevorderde spelers, en daarnaast teamkleding en clubartikelen.',
    characteristicsSourceUrl:
      'https://www.indianmaharadja.com/about-theindianmaharadja',
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
];
