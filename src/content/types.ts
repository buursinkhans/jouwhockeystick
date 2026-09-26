import { z } from 'zod';

export const articleSectionSchema = z.object({
  heading: z.string(),
  level: z.union([z.literal(2), z.literal(3)]),
  body: z.array(z.string()),
});
export type ArticleSection = z.infer<typeof articleSectionSchema>;

export const articleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  /** Must answer the main question within the first ~80 words (GEO/SEO rule). */
  intro: z.string(),
  sections: z.array(articleSectionSchema),
  author: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string(),
  sources: z.array(
    z.object({
      label: z.string(),
      url: z.string().url().optional(),
    }),
  ),
  metaDescription: z.string(),
});
export type Article = z.infer<typeof articleSchema>;
