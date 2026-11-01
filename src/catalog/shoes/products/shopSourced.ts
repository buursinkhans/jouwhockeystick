import type { Shoe } from '../types';
import { checkedShoe, fromShop } from './source';

/**
 * Models of brands whose own site cannot be read (ASICS and adidas refuse
 * automated access, The Indian Maharadja shows no product data), with the
 * shop's product text in the PassaHockey feed as the source (owner's
 * decision, decision log 2026-11-01). The shop texts are general and differ
 * per colour, so they settle field or indoor and little else.
 */
const PEAKE = 'https://www.passasports.nl/asics-gel-peake-3-1113a057-100';
/** The colour page whose shop text the field and cushioning quotes come from. */
const PEAKE_108 = 'https://www.passasports.nl/asics-gel-peake-3-1113a057-108';
const PRO_SLIM_INDOOR = 'https://www.passasports.nl/indian-maharadja-pro-slim-indoor-3426025';

export const SHOP_SOURCED_SHOES: readonly Shoe[] = [
  checkedShoe({
    slug: 'asics-gel-peake-3',
    brand: 'ASICS',
    model: 'Gel-Peake 3',
    version: '3',
    category: fromShop(
      'veld' as const,
      PEAKE_108,
      'PassaHockey: "een uitstekende keuze voor de heren hockeyspeler die op zoek is naar betrouwbare prestaties op het veld" (productomschrijving in de feed)',
    ),
    ageGroup: 'senior',
    sizesAndWidths: fromShop(
      { sizes: ['36', '37', '37 1/2', '38', '39', '39 1/2', '40', '40 1/2', '41 1/2', '42', '42 1/2', '43 1/2', '44', '44 1/2', '45', '46', '46 1/2', '47', '48', '49', '50 1/2'] },
      PEAKE,
      'Maten in de productfeed van PassaHockey, alle kleuren samen; geen maattabel van het merk.',
    ),
    cushioning: fromShop('De Gel-technologie in de zool zorgt voor optimale schokabsorptie', PEAKE_108, 'PassaHockey, productomschrijving in de feed'),
    evidenceLimits: [
      'Bron is de winkel, niet ASICS: de merksite weigert automatische toegang.',
      'Ondergrond: de winkel noemt "grasveld", "gras of kunstgras" en "diverse ondergronden", per kleur verschillend; geen water- of zandkunstgras. Daarom onbekend.',
      'Pasvorm, gewicht, uitneembare binnenzool, ondersteuning, bescherming, vochtbescherming en slijtvastheid: niet vastgesteld.',
    ],
  }),
  checkedShoe({
    slug: 'the-indian-maharadja-pro-slim-indoor',
    brand: 'The Indian Maharadja',
    model: 'Pro Slim Indoor',
    category: fromShop(
      'zaal' as const,
      PRO_SLIM_INDOOR,
      'PassaHockey: "Deze schoen is specifiek ontworpen voor gebruik in de zaal" (productomschrijving in de feed)',
    ),
    ageGroup: 'senior',
    sizesAndWidths: fromShop(
      { sizes: ['36', '37', '37 1/2', '38', '38 2/3', '39 1/3', '40', '40 2/3', '41 1/3', '42', '42 2/3', '43 1/3', '44'] },
      PRO_SLIM_INDOOR,
      'Maten in de productfeed van PassaHockey; geen maattabel van het merk.',
    ),
    evidenceLimits: [
      'Bron is de winkel, niet The Indian Maharadja: de merksite toont geen productgegevens.',
      'Pasvorm: de winkel noemt "De slanke pasvorm van de Pro Slim-lijn", maar niets over voorvoet, hiel of wreef apart; daarom onbekend.',
      'Non-marking, gewicht, uitneembare binnenzool, demping, ondersteuning, bescherming, vochtbescherming en slijtvastheid: niet vastgesteld.',
    ],
  }),
];
