/**
 * Builds the shoe catalog import from the parsed shop feeds (see
 * ../shoeFeed.ts): colour pages merged into one model, PassaHockey and
 * Plutosport linked on EAN only, and every content property unknown.
 * Pure functions; downloading and writing live in scripts/shoe-import.ts.
 * Decision log 2026-10-31.
 */
import { bySize, isHockeyShoePath, type ShoeModel } from '../shoeFeed';
import { UNKNOWN, type Shoe, type ShoeListing } from './types';

const BRAND_DISPLAY: Record<string, string> = {
  asics: 'ASICS',
  adidas: 'adidas',
  mizuno: 'Mizuno',
  grays: 'Grays',
  osaka: 'Osaka',
  brabo: 'Brabo',
  nike: 'Nike',
  puma: 'Puma',
  reece: 'Reece',
  'the indian maharadja': 'The Indian Maharadja',
  'indian maharadja': 'The Indian Maharadja',
};

/** Words shops add to a name that say nothing about the model. */
const SHOP_WORDS = new Set(['hockeyschoenen', 'hockeyschoen', 'hockeyshoes', 'schoenen', 'indoorschoenen', 'senior', 'sr', 'outdoor']);
/** Same meaning, different words between shops. */
const SYNONYMS: Record<string, string> = {
  men: 'heren', mens: 'heren', women: 'dames', womens: 'dames', jr: 'junior', kids: 'junior', kinder: 'junior', gs: 'junior',
  zaal: 'indoor',
};

const displayBrand = (brand: string) => BRAND_DISPLAY[brand.trim().toLowerCase()] ?? brand.trim();

/** Lower-case words of a name, without the brand ("ASICS Gel-Peake 3" → gel, peake, 3). */
function words(name: string, brand: string): string[] {
  const brandWords = new Set(displayBrand(brand).toLowerCase().split(/\s+/));
  return name
    .toLowerCase()
    .replace(/(\d)\.(\d)/g, '$1_$2')
    .split(/[^a-z0-9_]+/)
    .filter(Boolean)
    .map((w) => w.replace('_', '.'))
    .filter((w) => !brandWords.has(w) && w !== 'indian' && w !== 'maharadja');
}

/**
 * The key that puts colour pages of one model together: brand plus the
 * model words, order-free, without shop words. Cut words (heren, dames,
 * junior, indoor) stay, so those remain separate models.
 */
export function modelKey(model: Pick<ShoeModel, 'name' | 'brand'>): string {
  const tokens = words(model.name, model.brand)
    .map((w) => SYNONYMS[w] ?? w)
    .filter((w) => !SHOP_WORDS.has(w));
  return `${displayBrand(model.brand).toLowerCase()}|${[...new Set(tokens)].sort().join(' ')}`;
}

/**
 * The article code in a page URL that ends in article plus colour
 * ("…-1072a104-103", "…-x1ga2350-83", "…-ftw00026-raspberry"). Two pages
 * with the same name but different article codes may be different versions,
 * so they are not merged (doubt case, listed in the report).
 */
export function articleCode(url: string): string | null {
  const last = url.replace(/\/$/, '').split('/').pop() ?? '';
  const match = last.match(/-([a-z]*\d[a-z0-9]{3,})-([a-z0-9]{2,})$/i);
  return match?.[1] ? match[1].toLowerCase() : null;
}

const INDOOR_PATH = /zaal|indoor/i;
/** Only Plutosport has a field path ("Hockey > Schoenen > Veldhockey"); PassaHockey's general path is no field claim. */
const FIELD_PATH = /veld/i;

export type ShoeImportGroup = {
  key: string;
  members: ShoeModel[];
};

export type DisciplineConflict = { name: string; urls: string[] };

export type ShoeImportResult = {
  shoes: Shoe[];
  listings: Record<string, ShoeListing[]>;
  /** Curated slugs that got listings from the feeds (matched on EAN). */
  curatedMatched: string[];
  /** Same name, different article codes: kept apart. */
  splitByArticle: { name: string; codes: string[] }[];
  /** Models one shop puts under field and another under indoor: left unknown. */
  disciplineConflicts: DisciplineConflict[];
};

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Groups one shop's pages: by model key, split where article codes differ.
 * `splitCode` gives each page of a split group its article code, so every
 * article of that name gets the code in its slug and keeps its URL when
 * another article leaves the feed.
 */
function groupShop(models: readonly ShoeModel[]): {
  groups: ShoeModel[][];
  split: { name: string; codes: string[] }[];
  splitCode: Map<string, string>;
} {
  const splitCode = new Map<string, string>();
  const byKey = new Map<string, ShoeModel[]>();
  for (const m of [...models].sort((a, b) => a.url.localeCompare(b.url))) {
    const key = modelKey(m);
    byKey.set(key, [...(byKey.get(key) ?? []), m]);
  }
  const groups: ShoeModel[][] = [];
  const split: { name: string; codes: string[] }[] = [];
  for (const members of byKey.values()) {
    const codes = [...new Set(members.map((m) => articleCode(m.url)).filter((c): c is string => c !== null))].sort();
    if (codes.length <= 1) {
      groups.push(members);
      continue;
    }
    split.push({ name: members[0]!.name, codes });
    const byCode = new Map<string, ShoeModel[]>();
    for (const m of members) {
      // A page without a code joins the first article.
      const code = articleCode(m.url) ?? codes[0]!;
      byCode.set(code, [...(byCode.get(code) ?? []), m]);
      splitCode.set(m.url, code);
    }
    groups.push(...byCode.values());
  }
  return { groups, split, splitCode };
}

/** Joins groups that share an EAN (across shops), union-find style. */
function joinOnEan(groups: ShoeModel[][]): ShoeModel[][] {
  const parent = groups.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));
  const owner = new Map<string, number>();
  groups.forEach((members, i) => {
    for (const ean of members.flatMap((m) => m.eans)) {
      const other = owner.get(ean);
      if (other === undefined) owner.set(ean, i);
      else parent[find(i)] = find(other);
    }
  });
  const joined = new Map<number, ShoeModel[]>();
  groups.forEach((members, i) => {
    const root = find(i);
    joined.set(root, [...(joined.get(root) ?? []), ...members]);
  });
  return [...joined.values()];
}

type Evidence = { category: 'veld' | 'zaal' | 'onbekend'; shop?: 'PassaHockey' | 'Plutosport'; conflict: boolean };

/** Field or indoor from the shops' own field and indoor categories (and "indoor" in a hockey-shoe name). */
function categoryEvidence(members: readonly ShoeModel[]): Evidence {
  const indoor = members.find(
    (m) => m.categories.some((c) => isHockeyShoePath(c) && INDOOR_PATH.test(c)) || /\b(indoor|zaal)/i.test(m.name),
  );
  const field = members.find((m) => m.categories.some((c) => isHockeyShoePath(c) && FIELD_PATH.test(c)));
  if (indoor && field) return { category: 'onbekend', conflict: true };
  if (indoor) return { category: 'zaal', shop: indoor.shop, conflict: false };
  if (field) return { category: 'veld', shop: field.shop, conflict: false };
  return { category: 'onbekend', conflict: false };
}

function listing(shop: ShoeListing['shop'], pages: readonly ShoeModel[], date: string): ShoeListing {
  const inStock = pages.filter((p) => p.inStock);
  const pool = inStock.length ? inStock : pages;
  const cheapest = [...pool].sort((a, b) => a.priceMin - b.priceMin || a.url.localeCompare(b.url))[0]!;
  const union = (pick: (p: ShoeModel) => string[]) => [...new Set(pages.flatMap(pick))];
  return {
    shop,
    url: cheapest.url,
    priceEur: cheapest.priceMin,
    inStock: inStock.length > 0,
    sizes: union((p) => p.sizes).sort(bySize),
    sizesInStock: union((p) => p.sizesInStock).sort(bySize),
    colourPages: pages.length,
    readAt: date,
  };
}

const DISPLAY_WORDS: Record<string, string> = { men: 'Heren', mens: 'Heren', women: 'Dames', womens: 'Dames' };

/**
 * One listing per shop: when several feed models belong to one checked model
 * (two colour articles, say), keep the cheapest page in stock and add up the
 * sizes and colour pages.
 */
export function mergeListings(listings: readonly ShoeListing[]): ShoeListing[] {
  const byShop = new Map<ShoeListing['shop'], ShoeListing[]>();
  for (const l of listings) byShop.set(l.shop, [...(byShop.get(l.shop) ?? []), l]);
  return [...byShop.values()].map((group) => {
    const inStock = group.filter((l) => l.inStock);
    const best = [...(inStock.length ? inStock : group)].sort((a, b) => a.priceEur - b.priceEur || a.url.localeCompare(b.url))[0]!;
    const union = (pick: (l: ShoeListing) => string[]) => [...new Set(group.flatMap(pick))].sort(bySize);
    return {
      ...best,
      sizes: union((l) => l.sizes),
      sizesInStock: union((l) => l.sizesInStock),
      colourPages: group.reduce((sum, l) => sum + l.colourPages, 0),
      readAt: group.map((l) => l.readAt).sort()[0]!,
    };
  });
}

/** The display name: the shortest shop name, without brand and shop words, in the shop's own spelling. */
function displayModel(members: readonly ShoeModel[]): string {
  const names = members.map((m) => {
    const brandWords = new Set([...displayBrand(m.brand).toLowerCase().split(/\s+/), 'indian', 'maharadja']);
    return m.name
      .split(/\s+/)
      .filter((w) => !brandWords.has(w.toLowerCase()) && !SHOP_WORDS.has(w.toLowerCase()))
      .map((w) => DISPLAY_WORDS[w.toLowerCase()] ?? w)
      .join(' ')
      .trim();
  });
  return [...names].filter(Boolean).sort((a, b) => a.length - b.length || a.localeCompare(b))[0] ?? members[0]!.name;
}

const CUT = /\b(heren|dames|men|women)\b/i;

/**
 * The feed import. `curated` are hand-checked shoes (their EANs): a feed model
 * sharing an EAN with one gives that shoe its listings and is not imported
 * again.
 */
export function buildShoeImport(
  feeds: { passa: readonly ShoeModel[]; pluto: readonly ShoeModel[] },
  curated: readonly Pick<Shoe, 'slug' | 'eans'>[],
  date: string,
): ShoeImportResult {
  const passa = groupShop(feeds.passa);
  const pluto = groupShop(feeds.pluto);
  const models = joinOnEan([...passa.groups, ...pluto.groups]);
  const splitCode = new Map([...passa.splitCode, ...pluto.splitCode]);

  const curatedByEan = new Map<string, string>();
  for (const shoe of curated) for (const ean of shoe.eans) curatedByEan.set(ean, shoe.slug);

  const shoes: Shoe[] = [];
  const listings: Record<string, ShoeListing[]> = {};
  const curatedMatched = new Set<string>();
  const conflicts: DisciplineConflict[] = [];
  const usedSlugs = new Set(curated.map((s) => s.slug));

  const ordered = models
    .map((members) => [...members].sort((a, b) => a.shop.localeCompare(b.shop) || a.url.localeCompare(b.url)))
    .sort((a, b) => a[0]!.url.localeCompare(b[0]!.url));

  for (const members of ordered) {
    const shopPages = (shop: ShoeModel['shop']) => members.filter((m) => m.shop === shop);
    const modelListings: ShoeListing[] = [];
    if (shopPages('PassaHockey').length) modelListings.push(listing('passasports', shopPages('PassaHockey'), date));
    if (shopPages('Plutosport').length) modelListings.push(listing('plutosport', shopPages('Plutosport'), date));
    const eans = [...new Set(members.flatMap((m) => m.eans))].sort();

    const curatedSlug = eans.map((ean) => curatedByEan.get(ean)).find(Boolean);
    if (curatedSlug) {
      curatedMatched.add(curatedSlug);
      listings[curatedSlug] = mergeListings([...(listings[curatedSlug] ?? []), ...modelListings]);
      continue;
    }

    const first = members[0]!;
    const brand = displayBrand(first.brand);
    const model = displayModel(members);
    const evidence = categoryEvidence(members);
    if (evidence.conflict) conflicts.push({ name: `${brand} ${model}`, urls: members.map((m) => m.url) });

    const code = members.map((m) => splitCode.get(m.url)).find(Boolean);
    let slug = slugify(code ? `${brand} ${model} ${code}` : `${brand} ${model}`);
    if (usedSlugs.has(slug)) slug = slugify(`${slug} ${articleCode(first.url) ?? eans[0] ?? first.url}`);
    usedSlugs.add(slug);

    const cut = model.match(CUT)?.[1];
    const passaPage = modelListings.find((l) => l.shop === 'passasports')?.url;
    const plutoPage = modelListings.find((l) => l.shop === 'plutosport')?.url;
    const sizes = [...new Set(modelListings.flatMap((l) => l.sizes))].sort(bySize);
    const image = members.find((m) => m.imageUrl)?.imageUrl;
    const shopLabel = (shop: 'PassaHockey' | 'Plutosport') =>
      shop === 'Plutosport' ? 'de categorie van Plutosport' : 'de categorie van PassaHockey';

    shoes.push({
      id: slug,
      slug,
      brand,
      model,
      ...(cut && { variant: cut[0]!.toUpperCase() + cut.slice(1).toLowerCase() }),
      category:
        evidence.category === 'onbekend' || !evidence.shop
          ? UNKNOWN
          : {
              value: evidence.category,
              source: 'partner-shop',
              sourceLabel: `Volgens ${shopLabel(evidence.shop)} in de productfeed op ${date}.`,
              lastVerifiedAt: date,
            },
      ageGroup: members.some((m) => m.junior) ? 'junior' : 'senior',
      surfaceWater: UNKNOWN,
      surfaceSand: UNKNOWN,
      surfaceSemiWaterHybrid: UNKNOWN,
      indoorNonMarking: UNKNOWN,
      fitForefoot: UNKNOWN,
      fitHeel: UNKNOWN,
      fitInstep: UNKNOWN,
      weight: UNKNOWN,
      sizesAndWidths: sizes.length
        ? {
            value: { sizes },
            source: 'partner-shop',
            sourceLabel: `Maten in de productfeed van de winkel op ${date}; geen maattabel van het merk.`,
            lastVerifiedAt: date,
          }
        : UNKNOWN,
      removableInsole: UNKNOWN,
      cushioning: UNKNOWN,
      support: UNKNOWN,
      protection: UNKNOWN,
      moistureProtection: UNKNOWN,
      durability: UNKNOWN,
      evidenceLimits: [
        'Uit de productfeed van de winkel: ondergrond, pasvorm, gewicht en andere eigenschappen zijn niet gecontroleerd.',
      ],
      eans,
      ...(passaPage && { passaSportsProductUrl: passaPage }),
      ...(plutoPage && { plutosportProductUrl: plutoPage }),
      ...(image && { imageUrl: image }),
      feedImport: {
        feeds: [
          ...(passaPage ? (['passahockey'] as const) : []),
          ...(plutoPage ? (['plutosport'] as const) : []),
        ],
        importedAt: date,
      },
    });
    listings[slug] = modelListings;
  }

  return {
    shoes: shoes.sort((a, b) => a.slug.localeCompare(b.slug)),
    listings,
    curatedMatched: [...curatedMatched].sort(),
    splitByArticle: [...passa.split, ...pluto.split],
    disciplineConflicts: conflicts,
  };
}
