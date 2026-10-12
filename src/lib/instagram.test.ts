import { describe, expect, it } from 'vitest';
import { toInstagramPosts } from './instagram';

const image = {
  id: '1',
  media_type: 'IMAGE',
  media_url: 'https://scontent.cdninstagram.com/a.jpg',
  permalink: 'https://www.instagram.com/p/AAA/',
  timestamp: '2026-10-12T10:00:00+0000',
  caption: 'Nieuwe zaalsticks in de catalogus',
};

describe('toInstagramPosts', () => {
  it('maps an image post and uses the caption as alt text when there is none', () => {
    const [post] = toInstagramPosts({ data: [image] }, 6);
    expect(post).toMatchObject({
      id: '1',
      imageUrl: image.media_url,
      alt: 'Nieuwe zaalsticks in de catalogus',
      isVideo: false,
    });
  });

  it('prefers the alt text set on Instagram', () => {
    const [post] = toInstagramPosts(
      { data: [{ ...image, alt_text: 'Drie zaalsticks op een rij' }] },
      6,
    );
    expect(post?.alt).toBe('Drie zaalsticks op een rij');
  });

  it("shows a video's thumbnail and skips posts without an image", () => {
    const posts = toInstagramPosts(
      {
        data: [
          {
            ...image,
            id: '2',
            media_type: 'VIDEO',
            media_url: undefined,
            thumbnail_url: 'https://scontent.cdninstagram.com/t.jpg',
          },
          { ...image, id: '3', media_url: undefined },
        ],
      },
      6,
    );
    expect(posts.map((p) => p.id)).toEqual(['2']);
    expect(posts[0]?.isVideo).toBe(true);
  });

  it('returns nothing for an empty account or an unexpected response', () => {
    expect(toInstagramPosts({ data: [] }, 6)).toEqual([]);
    expect(
      toInstagramPosts({ error: { message: 'Invalid token' } }, 6),
    ).toEqual([]);
  });

  it('respects the limit', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      ...image,
      id: String(i),
    }));
    expect(toInstagramPosts({ data: many }, 6)).toHaveLength(6);
  });
});
