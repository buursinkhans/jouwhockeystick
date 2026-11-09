// Daily publishing, reason c (decision log 2026-11-09). Read-only.
// Prints two lines: "build=true" or "build=false", then the reason.
// Usage: npm run --silent price:expiry -- <live build date, ISO; empty = unknown>
import { getAllProducts } from '../src/catalog/index';
import { getOffers } from '../src/catalog/offers/index';
import { priceExpiryDecision } from '../src/catalog/offers/expiry';
import { getShoes } from '../src/catalog/shoes/index';
import { getShoeOffers } from '../src/catalog/shoes/offers';

const [builtIso = ''] = process.argv.slice(2);
const now = new Date();

// Every read date the site shows a price with: sticks (also from the feeds) and shoes.
const offers = [
  ...getAllProducts(now, { includeImported: true }).flatMap(getOffers),
  ...getShoes({ includeImported: true }).flatMap(getShoeOffers),
];
const readDates = offers.flatMap((offer) => (offer.priceEur !== null && offer.readAt ? [offer.readAt] : []));

const decision = priceExpiryDecision(readDates, builtIso || null, now);
console.log(`build=${decision.build}`);
console.log(decision.reason);
