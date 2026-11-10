import type { ContentItem } from './content';
import { claimPattern, loadSiteConfig } from './siteConfig';

/**
 * The automatic part of the AI editor (docs/marketing/merkstem.md): checks a
 * content item against docs/schrijfstijl.md, docs/instagram.md and the
 * commerce rules in CLAUDE.md before it may be marked "goedgekeurd". It finds
 * patterns; it does not rewrite and it does not judge facts, which stay a
 * human and source check.
 */
export type Finding = { level: 'P0' | 'P1'; rule: string; detail: string };

/** Claims the site never makes: `verbodenClaims` in the site configuration (CLAUDE.md, docs/instagram.md §2). */
const CLAIMS = claimPattern(loadSiteConfig());

/** AI words from docs/schrijfstijl.md ("Vermijden"). */
const AI_WORDS =
  /\b(cruciaal|essentieel|naadloos|robuust|baanbrekend|gamechanger|kortom|al met al|in de kern|een scala aan|beschikken over|fungeren als|superleuk|ontzettend|in de wereld van)\b|het is belangrijk om op te merken/i;

/** Sentence openers to avoid (docs/schrijfstijl.md). */
const OPENERS = /(^|[.?!]\s+)(Bovendien|Daarnaast|Tevens)\b/;

/** Interjections and labels (hard rule 4). */
const LABELS = /(^|\n|[.?!]\s+)(Goed nieuws|Je zult zien|Tip|Let op|Spoiler|Het resultaat\?|Zo onthoud je het)\b/;

/** "niet X, maar Y" and its variants (hard rule 1). */
const CONTRAST = /\b(niet|geen)\b[^.?!\n]{1,80}?,?\s+maar\b/gi;

/** Sales talk that does not fit the kernzin "Eerlijk, passend advies" (docs/marketing/merkplatform.md). */
const SALES = /\b(koop|bestel|shop) (nu|snel|vandaag)\b|op=op|\bmis (het|dit|deze) niet\b|\blaatste kans\b|\bnu of nooit\b|\bscoor\b/i;

/** Proof (building block 4): a number, or a named source such as the FIH rules or the length table. */
const PROOF = /\d|\bbron\b|\bvolgens\b|\bFIH\b|lengtetabel|\btabel\b|specificatie|\bfabrikant\b|\bmerk\b/i;

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

/**
 * The checks a person (or the planner itself) does, because a pattern cannot:
 * the idea test and the building blocks without a clear signal in the text
 * (docs/marketing/merkplatform.md). The planner answers them before saving.
 */
export const MANUAL_CHECKS = [
  'Helpt het de lezer: weet een ouder na de post iets wat helpt bij kiezen?',
  'Herkenning: staat er een situatie in die de lezer kent?',
  'Belofte: is duidelijk wat de lezer na de post weet of kan?',
] as const;

export type CheckOptions = {
  /** Paths of the live pages (state/paginas in the studio, or the sitemap); without it the page check is skipped. */
  livePages?: readonly string[];
};

export function checkItem(item: ContentItem, { livePages }: CheckOptions = {}): Finding[] {
  const findings: Finding[] = [];
  const all = [item.hook, item.tekst, ...item.onderdelen, item.cta].join('\n');
  const add = (level: Finding['level'], rule: string, detail: string) => findings.push({ level, rule, detail });

  const claim = CLAIMS.exec(all);
  if (claim) add('P0', 'claim', `"${claim[0]}" is een claim die de site niet maakt`);
  if (/[—–]/.test(all)) add('P0', 'gedachtestreepje', 'geen — of – in lopende tekst');
  if (all.includes('!')) add('P0', 'uitroepteken', 'geen uitroeptekens');
  if (/€\s?\d/.test(all)) add('P0', 'prijs', 'geen prijzen in een post: die verouderen (docs/instagram.md §2)');
  const contrasts = all.match(CONTRAST)?.length ?? 0;
  if (contrasts > 1) add('P1', 'contrast', `${contrasts}× "niet X, maar Y"; hooguit één`);
  const aiWord = AI_WORDS.exec(all);
  if (aiWord) add('P1', 'ai-woord', `"${aiWord[0]}"`);
  const opener = OPENERS.exec(all);
  if (opener) add('P1', 'zinsopener', `"${opener[2]}" als zinsopener`);
  const label = LABELS.exec(all);
  if (label) add('P1', 'label', `"${label[2]}" als tussenkreet`);

  if (words(item.hook) > 10) add('P1', 'hook', 'hook langer dan 10 woorden');
  const isVideo = item.vorm === 'reel' || item.vorm === 'short';
  if (!isVideo && words(item.tekst) > 160) add('P1', 'onderschrift', `onderschrift van ${words(item.tekst)} woorden; mik op hooguit 150`);
  if (isVideo && words(item.tekst) > 110) add('P1', 'script', `script van ${words(item.tekst)} woorden; 20–40 s is ongeveer 60–100 woorden`);
  if (item.kanalen.includes('instagram') && !isVideo && (item.hashtags.length < 5 || item.hashtags.length > 10)) {
    add('P1', 'hashtags', `${item.hashtags.length} hashtags; Instagram-posts hebben er 5 tot 10`);
  }
  for (const part of item.onderdelen) {
    if (words(part) > 40) add('P1', 'slide', `onderdeel van ${words(part)} woorden: "${part.slice(0, 40)}…"`);
  }

  // The idea test and the five building blocks (docs/marketing/merkplatform.md), where a pattern can tell.
  if (livePages && !livePages.includes(item.bronpagina)) add('P0', 'geen-live-pagina', `${item.bronpagina} staat niet live`);
  const sales = SALES.exec(all);
  if (sales) add('P1', 'verkooppraat', `"${sales[0]}" past niet bij de kernzin`);
  const first = item.onderdelen[0] ?? '';
  if (!isVideo && words(first) > 6) add('P1', 'eerste-beeld', `het eerste beeld heeft ${words(first)} woorden; hooguit 6`);
  if (!PROOF.test(all)) add('P1', 'bewijs', 'geen feit met een getal of een bron gevonden');
  if (words(item.cta) > 8) add('P1', 'vervolgstap', `de vervolgstap heeft ${words(item.cta)} woorden; één korte stap`);
  return findings;
}

/** Ready for the owner's approval: no P0 and no P1 left. */
export const isPublishable = (item: ContentItem) => checkItem(item).length === 0;
