import { describe, expect, it } from 'vitest';
import { getAllBlogPosts, getBlogPostBySlug } from './blog';
import { articleSchema } from './types';

describe('blog posts', () => {
  const posts = getAllBlogPosts();

  it('validates every post against the article schema', () => {
    for (const post of posts) {
      expect(() => articleSchema.parse(post)).not.toThrow();
    }
  });

  it('has unique slugs that resolve back to the post', () => {
    const slugs = posts.map((post) => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(getBlogPostBySlug(slug)?.slug).toBe(slug);
    }
  });

  it('keeps the editorial order with the buying guide second', () => {
    expect(posts.map((post) => post.slug)).toEqual([
      'hockeystick-kiezen-praktische-tips',
      'hockeystick-kopen',
    ]);
  });

  it('lists every inline source link in the source list', () => {
    for (const post of posts) {
      const listed = new Set(post.sources.map((source) => source.url));
      const text = JSON.stringify(post.sections);
      for (const [, url] of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
        expect(listed.has(url)).toBe(true);
      }
    }
  });
});
