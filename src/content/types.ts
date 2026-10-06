import { z } from 'zod';

/**
 * Text inside blocks may use a small inline markup: **bold**, *italic* and
 * [label](https://url). See src/components/article/InlineText.tsx.
 */
export const articleBlockSchema = z.union([
  z.string(),
  z.object({
    type: z.literal('list'),
    ordered: z.boolean().optional(),
    items: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal('table'),
    columns: z.array(z.string()).min(2),
    rows: z.array(z.array(z.string())).min(1),
  }),
  z.object({
    type: z.literal('note'),
    text: z.string(),
  }),
]);
export type ArticleBlock = z.infer<typeof articleBlockSchema>;

export const articleSectionSchema = z.object({
  heading: z.string(),
  level: z.union([z.literal(2), z.literal(3)]),
  /** A plain string is a paragraph. */
  body: z.array(articleBlockSchema),
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
