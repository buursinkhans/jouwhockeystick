import type { Article } from './types';
import { visibleItems } from './schedule';
import { hockeystickKiezenPraktischeTips } from './blogPosts/hockeystick-kiezen-praktische-tips';
import { hockeystickKopen } from './blogPosts/hockeystick-kopen';
import { metWelkeStickSpeeltOranje } from './blogPosts/met-welke-stick-speelt-oranje';

/** Listed on /blog in this order, as chosen by the editors. */
const ALL_BLOG_POSTS: Article[] = [
  hockeystickKiezenPraktischeTips,
  hockeystickKopen,
  metWelkeStickSpeeltOranje,
];

/** Blog posts a visitor may see now (scheduled ones only on previews). */
export function getAllBlogPosts(): Article[] {
  return visibleItems(ALL_BLOG_POSTS);
}

export function getBlogPostBySlug(slug: string): Article | undefined {
  return getAllBlogPosts().find((post) => post.slug === slug);
}

/** Every blog post, including scheduled ones. For tests and the publication workflow. */
export function getBlogPostsIncludingScheduled(): Article[] {
  return [...ALL_BLOG_POSTS];
}
