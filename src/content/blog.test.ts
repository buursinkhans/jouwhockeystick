import { describe, expect, it } from 'vitest';
import { getAllBlogPosts, getBlogPostBySlug } from './blog';

describe('blog posts', () => {
  it('keeps the editorial order with the buying guide second', () => {
    expect(getAllBlogPosts().map((post) => post.slug)).toEqual([
      'hockeystick-kiezen-praktische-tips',
      'hockeystick-kopen',
    ]);
  });

  it('resolves every slug back to its post', () => {
    for (const post of getAllBlogPosts()) {
      expect(getBlogPostBySlug(post.slug)?.slug).toBe(post.slug);
    }
  });
});
