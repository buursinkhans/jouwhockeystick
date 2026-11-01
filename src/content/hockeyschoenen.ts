import { confirmedBySource, type ShoeCertainty } from '@/catalog/shoes/certainty';
import type { Shoe } from '@/catalog/shoes/types';

/**
 * Copy for /hockeyschoenen and the shoe model pages (decision log
 * 2026-11-01), following docs/spec/hockeyschoenen-keuzemodel.md: no "best
 * shoe", no injury or fit promises, no scores. Facts about a model come from
 * the catalog with their source, never from this file.
 */
export const HOCKEYSCHOENEN = {
  /** H1 on the overview. */
  title: 'Hockeyschoenen',
  seoTitle: 'Hockeyschoenen voor veld en zaal: ondergrond en pasvorm',
  metaDescription:
    'Welke hockeyschoenen heb je nodig? Eerst veld of zaal en je ondergrond, dan de pasvorm. Per model zie je wat de bron bevestigt en wat je zelf controleert.',
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-11-01',
  updatedAt: '2026-11-01',
  /** Answers "welke hockeyschoenen heb je nodig?" within the first 80 words. */
  intro:
    'Welke hockeyschoenen je nodig hebt, hangt eerst af van waar je speelt. Voor veldhockey kies je een veldschoen die volgens de fabrikant past bij jouw kunstgras: water-, zand- of semi-waterveld. Voor zaalhockey kies je een zaalschoen met een zool die geen strepen achterlaat (non-marking). Daarna telt de pasvorm: ruimte bij de voorvoet, een hiel die blijft zitten en geen druk op de wreef. Per model zie je wat de fabrikant of winkel bevestigt en wat je nog zelf moet controleren.',
  /** The button to the schoenenwijzer, right under the intro. */
  wizardButton: 'Doe de schoenenwijzer',
  filters: {
    legend: 'Filter',
    type: { all: 'Veld en zaal', veld: 'Veld', zaal: 'Zaal' },
    age: { all: 'Alle leeftijden', junior: 'Junior', senior: 'Senior' },
  },
  /**
   * Three short sections, one per search intent (SEO analysis 2026-11-01):
   * each answers one choice question. Counts come from intentFacts(), links
   * to the filters (canonical stays /hockeyschoenen) and to the article
   * once it is live.
   */
  intents: {
    veld: {
      heading: 'Veldhockeyschoenen',
      question: 'Welke veldhockeyschoen past bij jouw veld?',
      answer:
        'Kijk eerst op welk kunstgras je traint en speelt, ook bij uitwedstrijden: water-, zand- of semi-waterveld. Kies dan een schoen die volgens het merk of de winkel geschikt is voor dat veld. Staat de ondergrond bij een model op onbekend, vraag het dan na voordat je koopt. Pas daarna kijk je naar de pasvorm bij voorvoet, hiel en wreef.',
      filterLabel: 'Bekijk de veldhockeyschoenen',
      filterHref: '/hockeyschoenen?type=veld',
      articleSlug: 'hockeyschoenen-waterveld-zandveld',
    },
    zaal: {
      heading: 'Zaalhockeyschoenen',
      question: 'Waaraan herken je een geschikte zaalhockeyschoen?',
      answer:
        'Aan een zool die geen strepen achterlaat op de zaalvloer (non-marking) en grip op een gladde ondergrond. Een veldschoen is gemaakt voor kunstgras, niet voor de zaal. Staat bij een model dat non-marking niet bevestigd is, vraag het dan na bij de winkel.',
      filterLabel: 'Bekijk de zaalhockeyschoenen',
      filterHref: '/hockeyschoenen?type=zaal',
      articleSlug: 'zaalhockeyschoenen-of-indoorschoenen',
    },
    kinderen: {
      heading: 'Hockeyschoenen voor kinderen',
      question: 'Welke hockeyschoen past bij een kind dat nog groeit?',
      answer:
        'Een passend basispaar voor het veld of de zaal waar je kind speelt. Laat de maat de keuze bepalen, niet de leeftijd, en pas met de hockeysokken die je kind echt draagt: de tenen liggen ontspannen en de hiel blijft goed zitten. Een duurder model is voor een beginnend kind niet nodig.',
      filterLabel: 'Bekijk de hockeyschoenen voor kinderen',
      filterHref: '/hockeyschoenen?leeftijd=junior',
      articleSlug: 'hockeyschoenen-kinderen-maat',
    },
  },
  checked: {
    heading: 'Gecontroleerde modellen',
    intro:
      'Bij deze modellen hebben we de gegevens met de hand nagelopen, bij voorkeur op de site van het merk. Wat de bron niet zegt, staat op onbekend.',
    none: 'Geen gecontroleerde modellen met dit filter.',
  },
  feed: {
    heading: 'Nog niet gecontroleerd',
    intro:
      'Deze modellen komen uit het aanbod van de winkels. We weten alleen wat de winkel in zijn productfeed zet: naam, maten, prijs en voorraad. Ondergrond en pasvorm zijn nog niet nagelopen.',
    none: 'Geen andere modellen met dit filter.',
  },
  status: {
    heading: 'Zo lees je de status',
  },
  fitCheck: {
    heading: 'Pascontrole',
    /** Keuzemodel §10: the checklist word for word, intro and outro addressed to the visitor. */
    intro:
      'Pas met de hockeysokken die je echt gebruikt, en met je eigen inlegzolen of brace als je die hebt.',
    items: [
      'Beide schoenen passen.',
      'Tenen kunnen ontspannen liggen.',
      'Geen aanhoudende knelling aan zijkanten of wreef.',
      'Hiel blijft goed aangesloten.',
      'Geen hinderlijk schuiven bij gecontroleerd afremmen.',
      'Geen hinderlijk zijwaarts verschuiven.',
      'Bewegingen alleen uitvoeren waar ruimte en ondergrond dit veilig toelaten.',
    ],
    outro:
      'Er is geen vaste regel voor het aantal millimeters ruimte: dat verschilt per model en per voet. Zoek voldoende ruimte zonder dat je voet gaat schuiven, en laat je bij twijfel helpen bij het passen.',
  },
  model: {
    specsHeading: 'Wat de bron zegt',
    checkHeading: 'Wat je nog moet controleren',
    limitsHeading: 'Wat niet is vastgesteld',
    similarHeading: 'Vergelijkbare modellen',
    sizesHeading: 'Maten op voorraad',
    sizesNote: 'Volgens de productfeed van de winkel, over alle kleuren samen. De winkel bevestigt je maat pas bij het bestellen.',
    feedNotice:
      'Dit model komt uit het aanbod van de winkel en is nog niet met de hand gecontroleerd. Ondergrond, pasvorm en andere eigenschappen zijn onbekend.',
  },
} as const;

export const CATEGORY_LABEL = { veld: 'Veld', zaal: 'Zaal', onbekend: 'Veld of zaal onbekend' } as const;
export const AGE_LABEL = { junior: 'Junior', senior: 'Senior' } as const;

/** Laag C of the keuzemodel, per model: label and what it means. */
export const CERTAINTY_TEXT: Record<ShoeCertainty, { label: string; text: string }> = {
  'goede-onderbouwing': {
    label: 'Goede onderbouwing',
    text: 'Veld of zaal en de ondergrond of de non-marking zool zijn door het merk of de winkel bevestigd. De pasvorm controleer je zelf bij het passen; dit is geen garantie op een goede pasvorm.',
  },
  voorwaardelijk: {
    label: 'Voorwaardelijk',
    text: 'Veld of zaal is bevestigd, maar de ondergrond of de non-marking zool is niet door het merk of de winkel bevestigd. Controleer dat voordat je koopt.',
  },
  'onvoldoende-informatie': {
    label: 'Onvoldoende informatie',
    text: 'Er is te weinig gecontroleerd om iets over geschiktheid te zeggen.',
  },
};

export const SOURCE_KIND_LABEL = {
  'brand-website': 'Fabrikant',
  'partner-shop': 'Winkel',
  'editorial-estimate': 'Redactie',
  'fih-rules': 'FIH-reglement',
} as const;

/** The warning on indoor shoes without a confirmed non-marking sole (owner's decision, 2026-11-01). */
export const NON_MARKING_WARNING = {
  inschatting:
    'Let op: niet bevestigd dat de zool non-marking is. We gaan ervan uit omdat de zool op de productfoto niet zwart is. Vraag het na bij de winkel.',
  onbekend: 'Let op: niet bevestigd dat de zool non-marking is. Vraag het na bij de winkel voordat je ermee in de zaal speelt.',
} as const;

export const SUITABILITY_LABEL = { bevestigd: 'Bevestigd', ongeschikt: 'Ongeschikt', onbekend: 'Onbekend' } as const;

/** The properties on a model page, in the keuzemodel's order of weight (§2). */
export const PROPERTY_LABEL = {
  category: 'Veld of zaal',
  surfaceWater: 'Waterveld',
  surfaceSand: 'Zandveld',
  surfaceSemiWaterHybrid: 'Semi-water of hybride veld',
  indoorNonMarking: 'Non-marking zool',
  fitForefoot: 'Pasvorm voorvoet',
  fitHeel: 'Pasvorm hiel',
  fitInstep: 'Pasvorm wreef',
  cushioning: 'Demping',
  support: 'Ondersteuning',
  protection: 'Bescherming',
  moistureProtection: 'Bescherming tegen vocht',
  durability: 'Slijtvastheid',
  weight: 'Gewicht',
  removableInsole: 'Uitneembare binnenzool',
  sizesAndWidths: 'Maten (bron)',
} as const satisfies Partial<Record<keyof Shoe, string>>;

/**
 * "Wat je nog moet controleren": what this model's data leaves open, as
 * concrete checks (keuzemodel §8). Unknown is never shown as a strength.
 */
export function checksFor(shoe: Shoe): string[] {
  const checks: string[] = [];
  if (shoe.feedImport) checks.push('Dit model is nog niet gecontroleerd: alleen de gegevens van de winkel zijn bekend.');
  if (shoe.category.value === 'onbekend') checks.push('Of het een veld- of zaalschoen is: niet bevestigd. Vraag het na bij de winkel.');
  if (shoe.category.value === 'veld') {
    if (shoe.surfaceWater.value === 'onbekend' && shoe.surfaceSand.value === 'onbekend') {
      checks.push('Of de schoen past bij jouw veld (water, zand of semi-water): niet bevestigd door een bron.');
    } else {
      if (shoe.surfaceWater.value === 'onbekend') checks.push('Waterveld: niet bevestigd door een bron.');
      if (shoe.surfaceSand.value === 'onbekend') checks.push('Zandveld: niet bevestigd door een bron.');
      if (shoe.surfaceSemiWaterHybrid.value === 'onbekend') checks.push('Semi-water of hybride veld: niet bevestigd. Speel je daarop, vraag het dan na.');
    }
  }
  if (shoe.category.value === 'zaal' && !confirmedBySource(shoe.indoorNonMarking)) {
    checks.push(
      shoe.indoorNonMarking.value === 'bevestigd'
        ? 'Of de zool non-marking is: onze inschatting op basis van de foto, niet bevestigd. Vraag het na bij de winkel.'
        : 'Of de zool non-marking is: niet bevestigd. Vraag het na bij de winkel.',
    );
  }
  if ([shoe.fitForefoot, shoe.fitHeel, shoe.fitInstep].every((part) => part.value === 'onbekend')) {
    checks.push('De pasvorm bij voorvoet, hiel en wreef: online niet bevestigd. Controleer het bij het passen.');
  }
  if (Object.values(shoe).some((v) => v && typeof v === 'object' && 'source' in v && v.source === 'partner-shop') && !shoe.feedImport) {
    checks.push('Een deel van de gegevens komt van de winkel, niet van het merk.');
  }
  checks.push('Of jouw maat op voorraad is: dat bevestigt de winkel bij het bestellen.');
  return checks;
}

export type IntentFacts = {
  veld: { checked: number; surfaceConfirmed: number; feed: number };
  zaal: { checked: number; nonMarkingConfirmed: number; nonMarkingEstimated: number; feed: number };
  kinderen: { checked: number; veld: number; zaal: number; feed: number };
};

/**
 * The counts in the three intent sections, from the catalog only. A model
 * with unknown field or indoor is never counted as either; feed models count
 * only where a shop's own category says field or indoor.
 */
export function intentFacts(checked: readonly Shoe[], feed: readonly Shoe[]): IntentFacts {
  const of = (list: readonly Shoe[], category: 'veld' | 'zaal') => list.filter((s) => s.category.value === category);
  const veld = of(checked, 'veld');
  const zaal = of(checked, 'zaal');
  const junior = checked.filter((s) => s.ageGroup === 'junior');
  return {
    veld: {
      checked: veld.length,
      surfaceConfirmed: veld.filter((s) => confirmedBySource(s.surfaceWater) || confirmedBySource(s.surfaceSand)).length,
      feed: of(feed, 'veld').length,
    },
    zaal: {
      checked: zaal.length,
      nonMarkingConfirmed: zaal.filter((s) => confirmedBySource(s.indoorNonMarking)).length,
      nonMarkingEstimated: zaal.filter((s) => s.indoorNonMarking.value === 'bevestigd' && !confirmedBySource(s.indoorNonMarking)).length,
      feed: of(feed, 'zaal').length,
    },
    kinderen: {
      checked: junior.length,
      veld: of(junior, 'veld').length,
      zaal: of(junior, 'zaal').length,
      feed: feed.filter((s) => s.ageGroup === 'junior' && s.category.value !== 'onbekend').length,
    },
  };
}

const models = (n: number) => `${n} ${n === 1 ? 'model' : 'modellen'}`;
const feedLine = (n: number) => (n > 0 ? ` Daarnaast ${models(n)} uit het aanbod van de winkels, nog niet gecontroleerd.` : '');

/** The fact line under each section, in plain words; never more than the catalog says. */
export function intentFactLine(intent: keyof IntentFacts, facts: IntentFacts): string {
  if (intent === 'veld') {
    const f = facts.veld;
    return `We hebben ${models(f.checked)} met de hand gecontroleerd. Bij ${f.surfaceConfirmed} daarvan bevestigt het merk of de winkel voor welk veld de schoen bedoeld is.${feedLine(f.feed)}`;
  }
  if (intent === 'zaal') {
    const f = facts.zaal;
    return `We hebben ${models(f.checked)} met de hand gecontroleerd. Bij ${f.nonMarkingConfirmed} bevestigt het merk of de winkel dat de zool non-marking is; bij ${f.nonMarkingEstimated} is dat onze inschatting op basis van de foto.${feedLine(f.feed)}`;
  }
  const f = facts.kinderen;
  return `We hebben ${models(f.checked)} voor junioren met de hand gecontroleerd: ${f.veld} voor het veld en ${f.zaal} voor de zaal.${feedLine(f.feed)}`;
}
