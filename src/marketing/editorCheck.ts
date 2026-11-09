import type { ContentItem } from './content';

/**
 * The automatic part of the AI editor (docs/marketing/merkstem.md): checks a
 * content item against docs/schrijfstijl.md, docs/instagram.md and the
 * commerce rules in CLAUDE.md before it may be marked "goedgekeurd". It finds
 * patterns; it does not rewrite and it does not judge facts, which stay a
 * human and source check.
 */
export type Finding = { level: 'P0' | 'P1'; rule: string; detail: string };

/** Claims the site never makes (CLAUDE.md, docs/instagram.md §2). */
const CLAIMS =
  /goedkoopst|beste prijs|scherpste prijs|laagste prijs|\bde beste\b|\bbeste (zaal)?stick\b|gegarandeerd|bewezen|\bkorting\b|\breview\b|voorkomt blessures|\baanrader\b/i;

/** AI words from docs/schrijfstijl.md ("Vermijden"). */
const AI_WORDS =
  /\b(cruciaal|essentieel|naadloos|robuust|baanbrekend|gamechanger|kortom|al met al|in de kern|een scala aan|beschikken over|fungeren als|superleuk|ontzettend|in de wereld van)\b|het is belangrijk om op te merken/i;

/** Sentence openers to avoid (docs/schrijfstijl.md). */
const OPENERS = /(^|[.?!]\s+)(Bovendien|Daarnaast|Tevens)\b/;

/** Interjections and labels (hard rule 4). */
const LABELS = /(^|\n|[.?!]\s+)(Goed nieuws|Je zult zien|Tip|Let op|Spoiler|Het resultaat\?|Zo onthoud je het)\b/;

/** "niet X, maar Y" and its variants (hard rule 1). */
const CONTRAST = /\b(niet|geen)\b[^.?!\n]{1,80}?,?\s+maar\b/gi;

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

export function checkItem(item: ContentItem): Finding[] {
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
  return findings;
}

/** Ready for the owner's approval: no P0 and no P1 left. */
export const isPublishable = (item: ContentItem) => checkItem(item).length === 0;
