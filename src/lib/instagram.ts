import { z } from 'zod';

/**
 * Recent posts of our own Instagram account, via the Instagram API with
 * Instagram Login (graph.instagram.com). Runs on the server only: the token
 * comes from the INSTAGRAM_ACCESS_TOKEN environment variable (Netlify), never
 * from code. Without a token, on any error, or before the first post, this
 * returns an empty list and the site simply shows no feed.
 */

const API_VERSION = 'v25.0';
const FIELDS =
  'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,alt_text';
/** Instagram CDN URLs expire, so the list is fetched again every hour. */
export const INSTAGRAM_REVALIDATE_SECONDS = 3600;

const mediaSchema = z.object({
  id: z.string(),
  caption: z.string().optional(),
  media_type: z.enum(['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM']),
  media_url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  permalink: z.string().url(),
  timestamp: z.string(),
  alt_text: z.string().optional(),
});

const responseSchema = z.object({ data: z.array(z.unknown()) });

export type InstagramPost = {
  id: string;
  permalink: string;
  /** The image to show: the photo itself, or a video's thumbnail. */
  imageUrl: string;
  /** Alt text set on Instagram, else the start of the caption. */
  alt: string;
  caption?: string;
  isVideo: boolean;
  timestamp: string;
};

const FALLBACK_ALT = 'Instagrampost van jouwhockeystick.nl';

/** Turns the raw API list into displayable posts; skips anything unusable. */
export function toInstagramPosts(raw: unknown, limit: number): InstagramPost[] {
  const parsed = responseSchema.safeParse(raw);
  if (!parsed.success) return [];
  const posts: InstagramPost[] = [];
  for (const item of parsed.data.data) {
    const media = mediaSchema.safeParse(item);
    if (!media.success) continue;
    const m = media.data;
    const imageUrl = m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url;
    if (!imageUrl) continue; // e.g. media_url withheld for copyrighted audio
    const caption = m.caption?.trim() || undefined;
    posts.push({
      id: m.id,
      permalink: m.permalink,
      imageUrl,
      alt:
        m.alt_text?.trim() || (caption ? caption.slice(0, 120) : FALLBACK_ALT),
      caption,
      isVideo: m.media_type === 'VIDEO',
      timestamp: m.timestamp,
    });
    if (posts.length === limit) break;
  }
  return posts;
}

export async function getInstagramPosts(limit = 6): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];
  const url = new URL(`https://graph.instagram.com/${API_VERSION}/me/media`);
  url.searchParams.set('fields', FIELDS);
  url.searchParams.set('limit', String(limit * 2));
  url.searchParams.set('access_token', token);
  try {
    const response = await fetch(url, {
      next: { revalidate: INSTAGRAM_REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];
    return toInstagramPosts(await response.json(), limit);
  } catch {
    // The feed is decoration; the page must never fail because of it.
    return [];
  }
}
