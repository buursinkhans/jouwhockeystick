import { z } from 'zod';

/**
 * One social content item of the marketing machine (docs/marketing/README.md).
 * The Social-studio stays the planner; this shape is what the Social-planner
 * hands over and what the pilot files in this folder hold. Metricool ids are
 * stored per channel so a post is never created twice.
 */

/** PLAN, PULSE, PUSH or PEAK: the owner's marketing method. */
export const FASES = ['plan', 'pulse', 'push', 'peak'] as const;

export const CHANNELS = ['instagram', 'facebook', 'youtube', 'tiktok'] as const;
export type Channel = (typeof CHANNELS)[number];

export const FORMATS = ['carrousel', 'beeld', 'reel', 'short', 'post'] as const;

/**
 * Status flow. Only the owner moves an item to "goedgekeurd"; only the
 * handover moves it on. "onzeker" means a Metricool call may have created the
 * post without confirming it: a person checks Metricool before anything else.
 */
export const STATUSES = ['concept', 'goedgekeurd', 'naar-metricool', 'onzeker', 'concept-in-metricool', 'ingepland', 'geplaatst', 'afgewezen'] as const;
export type Status = (typeof STATUSES)[number];

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const metricoolRefSchema = z.object({
  /** Metricool post id; changes on every update, so the uuid is the lasting key. */
  id: z.string().min(1),
  uuid: z.string().min(1),
  /** When the handover created it (ISO). */
  createdAt: z.string().min(1),
});

export const contentItemSchema = z.object({
  /** Lasting id, also utm_content: YYYYMMDD-onderwerp. */
  id: z.string().regex(/^\d{8}-[a-z0-9-]+$/),
  fase: z.enum(FASES),
  /** Campaign id, also utm_campaign, e.g. zaalhockey-2026 or pulse-2026. */
  campagne: slug,
  doelgroep: z.enum(['ouders', 'spelers', 'trainers']),
  onderwerp: z.string().min(5),
  /** A live page on the site; the post makes curious, the page answers (docs/instagram.md §1). */
  bronpagina: z.string().regex(/^\/[a-z0-9/-]*$/),
  kanalen: z.array(z.enum(CHANNELS)).min(1),
  vorm: z.enum(FORMATS),
  /** Planned date (YYYY-MM-DD), Dutch time; null = not planned yet. */
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  /** Opening line or first frame: the hook. */
  hook: z.string().min(3),
  /** Caption (posts) or spoken script (video), final text. */
  tekst: z.string().min(20),
  /** Slides or scenes, each one short line. */
  onderdelen: z.array(z.string().min(2)).min(1),
  hashtags: z.array(z.string().regex(/^#[a-z0-9]+$/)).max(10),
  /** What is needed before it can go out (existing studio slides, a rendered video, …). */
  media: z.string().min(3),
  cta: z.string().min(3),
  status: z.enum(STATUSES),
  /** Existing Social-studio document this item reuses or replaces, if any. */
  studioId: z.string().nullable(),
  metricool: z.partialRecord(z.enum(CHANNELS), metricoolRefSchema),
});
export type ContentItem = z.infer<typeof contentItemSchema>;
