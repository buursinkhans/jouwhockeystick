import type { Channel, ContentItem } from './content';

/**
 * What the handover from the Social-studio to Metricool may do for one item
 * and one channel (docs/marketing/README.md §4). Pure, so it can be tested;
 * the Social-planner applies it with the Metricool MCP.
 *
 * Rules:
 * - Only "goedgekeurd" items go over. Since 2026-11-09 approving means going
 *   live: the planner schedules them to publish by themselves (social-planner.md, STAP 5).
 * - A stored Metricool id means done: never a second post.
 * - Before creating, the planner reads Metricool's scheduled posts around the
 *   date. A post with the same text start on the same day and network is this
 *   item (a call that worked without its answer arriving): link it, don't create.
 * - An item marked "naar-metricool" (a call was started) without an id and
 *   without a match stays "onzeker" for a person to check. A missing id never
 *   leads to a second create on its own.
 */
export type ScheduledPost = {
  id: string;
  uuid: string;
  /** YYYY-MM-DDTHH:mm:ss in the brand's timezone. */
  dateTime: string;
  text: string;
  networks: readonly string[];
};

export type HandoverAction =
  | { kind: 'skip'; reason: 'niet-goedgekeurd' | 'al-in-metricool' | 'geen-datum' | 'datum-voorbij' }
  | { kind: 'link'; post: ScheduledPost }
  | { kind: 'create' }
  | { kind: 'onzeker'; reason: string };

const norm = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 80);

/** A scheduled post that is this item on this channel: same day, network and text start. */
export function findExisting(item: ContentItem, channel: Channel, posts: readonly ScheduledPost[]): ScheduledPost | null {
  if (!item.datum) return null;
  const date = item.datum;
  const start = norm(item.tekst);
  return posts.find((p) => p.dateTime.startsWith(date) && p.networks.includes(channel) && norm(p.text) === start) ?? null;
}

export function handoverAction(
  item: ContentItem,
  channel: Channel,
  posts: readonly ScheduledPost[],
  today: string,
): HandoverAction {
  if (item.metricool[channel]) return { kind: 'skip', reason: 'al-in-metricool' };
  if (!item.datum) return { kind: 'skip', reason: 'geen-datum' };
  if (item.datum <= today) return { kind: 'skip', reason: 'datum-voorbij' };
  const existing = findExisting(item, channel, posts);
  if (existing) return { kind: 'link', post: existing };
  if (item.status === 'naar-metricool' || item.status === 'onzeker') {
    return { kind: 'onzeker', reason: 'een eerdere overdracht is gestart, maar er is geen bericht in Metricool gevonden; controleer Metricool voordat er opnieuw iets gebeurt' };
  }
  if (item.status !== 'goedgekeurd') return { kind: 'skip', reason: 'niet-goedgekeurd' };
  return { kind: 'create' };
}
