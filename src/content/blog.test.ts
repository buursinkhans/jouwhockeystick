import { describe, expect, it } from 'vitest';
import { getAllBlogPosts, getBlogPostBySlug } from './blog';

describe('blog posts', () => {
  it('keeps the editorial order', () => {
    expect(getAllBlogPosts().map((post) => post.slug)).toEqual([
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
