import type { Shoe } from '../types';
import { checkedShoe, fromBrand } from './source';

/**
 * Brabo hockey shoes, from brabohockey.com (product pages read 2026-10-31).
 * Field or indoor from the brand's own product type ("Footwear Field",
 * "Footwear Indoor"). Brabo states no season on the page, so no model year.
 */
const ELITE = 'https://brabohockey.com/products/316-62043-010-elite-navy-white';
const FORCE = 'https://brabohockey.com/products/316-61013-010-force-navy-white';
const FORCE_INDOOR = 'https://brabohockey.com/products/316-61023-010-indoor-force-navy-white';
const TRIBUTE_INDOOR = 'https://brabohockey.com/products/316-61037-010-indoor-tribute-navy-white';

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
const sizes = (url: string, list: string[]) =>
  fromBrand({ sizes: list }, url, 'Maten in de productgegevens van Brabo (EU); geen breedtes genoemd.');

export const BRABO_SHOES: readonly Shoe[] = [
  checkedShoe({
    slug: 'brabo-elite',
    brand: 'Brabo',
    model: 'Elite',
    category: fromBrand('veld' as const, ELITE, 'Productcategorie "Footwear Field"; "De stevige zool biedt uitstekende grip op kunstgras"'),
    ageGroup: 'senior',
    sizesAndWidths: sizes(ELITE, range(34, 44)),
    support: fromBrand('de verstevigde hiel en stabiele constructie zorgen voor extra support tijdens intensieve momenten', ELITE, 'Brabo, productpagina'),
    evidenceLimits: [
      'Ondergrond: Brabo noemt "grip op kunstgras", maar niet water- of zandkunstgras apart; daarom onbekend.',
      'Pasvorm: Brabo noemt "de comfortabele pasvorm", maar niets over de breedte van voorvoet, hiel of wreef.',
      'Gewicht, uitneembare binnenzool, demping, bescherming, vochtbescherming en slijtvastheid: niet genoemd.',
    ],
  }),
  checkedShoe({
    slug: 'brabo-force',
    brand: 'Brabo',
    model: 'Force',
    category: fromBrand('veld' as const, FORCE, 'Productcategorie "Footwear Field"; "een toegankelijke en betrouwbare schoen voor op het veld"'),
    ageGroup: 'junior',
    sizesAndWidths: sizes(FORCE, range(28, 40)),
    support: fromBrand('Deze lichte schoen biedt fijne ondersteuning tijdens trainingen en wedstrijden', FORCE, 'Brabo, productpagina'),
    durability: fromBrand('Dankzij het duurzame materiaal kan de schoen tegen een stootje', FORCE, 'Brabo, productpagina'),
    evidenceLimits: [
      'Voor jonge spelers volgens Brabo, met klittenbandsluiting.',
      'Ondergrond: Brabo noemt "goede grip op kunstgras", maar niet water- of zandkunstgras apart; daarom onbekend.',
      'Pasvorm, gewicht, uitneembare binnenzool, demping, bescherming en vochtbescherming: niet genoemd.',
    ],
  }),
  checkedShoe({
    slug: 'brabo-force-zaal',
    brand: 'Brabo',
    model: 'Force Zaal',
    category: fromBrand('zaal' as const, FORCE_INDOOR, 'Productcategorie "Footwear Indoor"; "De Brabo Force zaalhockeyschoen"'),
    ageGroup: 'junior',
    indoorNonMarking: fromBrand('bevestigd' as const, FORCE_INDOOR, '"De non-marking zool biedt betrouwbare grip op zaalvloeren"'),
    sizesAndWidths: sizes(FORCE_INDOOR, range(28, 40)),
    support: fromBrand('Deze lichte schoen ondersteunt iedere beweging in de zaal', FORCE_INDOOR, 'Brabo, productpagina'),
    evidenceLimits: [
      'Voor jonge zaalhockeyers volgens Brabo, met klittenbandsluiting.',
      'Pasvorm, gewicht, uitneembare binnenzool, demping, bescherming, vochtbescherming en slijtvastheid: niet genoemd.',
    ],
  }),
  checkedShoe({
    slug: 'brabo-tribute-zaal',
    brand: 'Brabo',
    model: 'Tribute Zaal',
    category: fromBrand('zaal' as const, TRIBUTE_INDOOR, 'Productcategorie "Footwear Indoor"; "De Brabo Tribute zaalhockeyschoen"'),
    ageGroup: 'junior',
    indoorNonMarking: fromBrand('bevestigd' as const, TRIBUTE_INDOOR, '"De non-marking zool zorgt voor betrouwbare grip op zaalvloeren"'),
    sizesAndWidths: sizes(TRIBUTE_INDOOR, range(30, 42)),
    support: fromBrand('de verstevigde hiel extra support biedt waar je die nodig hebt', TRIBUTE_INDOOR, 'Brabo, productpagina'),
    evidenceLimits: [
      'Leeftijd: Brabo noemt geen leeftijdsgroep; de maten lopen van 30 tot 42 en de winkel noemt hem junior.',
      'Pasvorm: Brabo noemt "fijne aansluiting om de voet", maar niets over breedte.',
      'Gewicht, uitneembare binnenzool, demping, bescherming, vochtbescherming en slijtvastheid: niet genoemd.',
    ],
  }),
];
