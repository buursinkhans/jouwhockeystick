import type { Article } from './types';
import { hockeystickKiezenPraktischeTips } from './blogPosts/hockeystick-kiezen-praktische-tips';

const ALL_BLOG_POSTS: Article[] = [hockeystickKiezenPraktischeTips];

export function getAllBlogPosts(): Article[] {
  return [...ALL_BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getBlogPostBySlug(slug: string): Article | undefined {
  return ALL_BLOG_POSTS.find((post) => post.slug === slug);
}
