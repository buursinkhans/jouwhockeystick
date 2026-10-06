import type { Article } from './types';
import { hockeystickKiezenPraktischeTips } from './blogPosts/hockeystick-kiezen-praktische-tips';
import { hockeystickKopen } from './blogPosts/hockeystick-kopen';

/** Listed on /blog in this order, as chosen by the editors. */
const ALL_BLOG_POSTS: Article[] = [
  hockeystickKiezenPraktischeTips,
  hockeystickKopen,
];

export function getAllBlogPosts(): Article[] {
  return [...ALL_BLOG_POSTS];
}

export function getBlogPostBySlug(slug: string): Article | undefined {
  return ALL_BLOG_POSTS.find((post) => post.slug === slug);
}
