import { SITE_URL } from '../lib/site';
import type { Channel } from './content';

/**
 * The UTM standard of the marketing machine (docs/marketing/README.md §5).
 * utm_medium stays "social", as the Social-studio links already use and the
 * conversion report reads (it groups on utm_source); utm_campaign is the
 * campaign, utm_content the lasting content id, so one post can be traced.
 */
export function socialUrl(
  page: string,
  { channel, campaign, contentId }: { channel: Channel; campaign: string; contentId: string },
): string {
  if (!page.startsWith('/') || page.startsWith('//')) throw new Error(`Geen pagina van de site: ${page}`);
  for (const [name, value] of [['campaign', campaign], ['contentId', contentId]] as const) {
    if (!/^[a-z0-9-]+$/.test(value)) throw new Error(`Ongeldige ${name}: ${value}`);
  }
  const url = new URL(page, SITE_URL);
  url.searchParams.set('utm_source', channel);
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', campaign);
  url.searchParams.set('utm_content', contentId);
  return url.toString();
}
