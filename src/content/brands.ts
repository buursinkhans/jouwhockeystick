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
    logoUrl: 'https://www.grays-hockey.eu/cdn/shop/files/Grays_Hockey_LOGOS_Positive.png?v=1613528562',
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
        sourceUrl: 'https://hockeystyle.nl/stories/sam-van-der-ven-hes-got-your-back-de-sterke-arm-van-zijn-team',
      },
    ],
    hasCatalogProducts: true,
  },
  {
    brand: 'Brabo',
    logoUrl: 'https://brabohockey.com/cdn/shop/files/logo-brabo.svg?v=1711717685&width=300',
    logoBackground: 'light',
    characteristics:
      'Brabo noemt zichzelf op zijn officiële site "Nederlands hockeymerk sinds 1968" en werkt met eigen technologienamen: Forged Carbon (hoge-druk samengeperst carbon), Pro Bow (curve op 260mm) en 12K Carbon (fijngeweven carbon voor extra stugheid).',
    characteristicsSourceUrl: 'https://brabohockey.com/en/pages/about-us',
    nationalTeamNote:
      'Brabo heeft officiële atletenpagina\'s voor Nederlandse internationals, waaronder olympisch kampioenen (Parijs 2024) Thierry Brinkman (aanvoerder Oranje heren) en Pien Sanders (Oranje dames, tweevoudig olympisch kampioen).',
    nationalTeamSourceUrl: 'https://brabohockey.com/en/pages/athletes/thierry-brinkman',
    quotes: [
      {
        quote:
          'The hockeystick I use is very good for the basic stuff. (trapping, shooting, receiving bouncy balls)',
        attribution: 'Thierry Brinkman, aanvoerder Oranje heren',
        sourceUrl: 'https://brabohockey.com/en/pages/athletes/thierry-brinkman',
        language: 'Engelstalig citaat, zoals gepubliceerd op de officiële Brabo-website',
      },
      {
        quote:
          'I have been playing with Brabo since my childhood. My role models played with it, and I came into contact with Joep. The brand radiates what I want to radiate myself.',
        attribution: 'Pien Sanders, Oranje dames',
        sourceUrl: 'https://brabohockey.com/en/pages/athletes/pien-sanders',
        language: 'Engelstalig citaat, zoals gepubliceerd op de officiële Brabo-website',
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
    logoUrl: 'https://www.princess-hockey.com/cdn/shop/files/Princess_-_logo_Black.png?v=1714973755',
    logoBackground: 'light',
    characteristics:
      'Princess is een Nederlands merk (opgericht 2003, hockeysticks sinds 2005) en staat bekend om zijn "Star"-classificatie: elke stick krijgt 2 tot 7 sterren, oplopend met het carbonpercentage — van circa 10% carbon bij 2 sterren tot 100% carbon bij 7 sterren.',
    characteristicsSourceUrl: 'https://princesshockey.co.za/pages/stick-technology',
    hasCatalogProducts: true,
  },
  {
    brand: 'adidas',
    logoBackground: 'light',
    characteristics:
      'De officiële adidas-website blokkeert geautomatiseerd bezoek, dus specs komen hier van gangbare hockeywinkels: de Carbon- en Compo1-lijnen gebruiken een "Dual Rod System" (twee massieve carbonstaven in de schacht) voor extra stugheid en slagkracht.',
    characteristicsSourceUrl: 'https://www.hockeydirect.com/collections/adidas-hockey-sticks',
    nationalTeamNote:
      'adidas is sinds 1999 officieel partner van de KNHB en levert de kleding/kit voor de Nederlandse jeugd- en A-teams (heren en dames) — dit is een kledingsponsoring, geen bevestigde koppeling met welke stick de spelers daadwerkelijk gebruiken.',
    nationalTeamSourceUrl: 'https://www.knhb.nl/over-knhb/partners/adidas',
    hasCatalogProducts: false,
  },
];
