import { describe, expect, it } from 'vitest';
import { getAllBlogPosts, getBlogPostBySlug, getBlogPostsIncludingScheduled } from './blog';

describe('blog posts', () => {
  it('keeps the editorial order', () => {
    expect(getBlogPostsIncludingScheduled().map((post) => post.slug)).toEqual([
      'hockeystick-kiezen-praktische-tips',
      'hockeystick-kopen',
      'met-welke-stick-speelt-oranje',
    ]);
  });

  it('resolves every slug back to its post', () => {
    for (const post of getAllBlogPosts()) {
      expect(getBlogPostBySlug(post.slug)?.slug).toBe(post.slug);
    }
  });
});
