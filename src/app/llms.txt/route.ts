import { getAllArticles } from '@/content';
import { getAllBlogPosts } from '@/content/blog';
import { METHODIEK } from '@/content/methodiek';
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl } from '@/lib/site';

export const dynamic = 'force-static';

/**
 * Plain-text overview of the pages worth reading, for AI crawlers that look
 * for /llms.txt. Generated from the same content the pages render, so it
 * never lists something that isn't visible on the site.
 */
export function GET() {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${DEFAULT_DESCRIPTION}`,
    '',
    '## Keuzehulp en methode',
    `- [Stickwijzer](${absoluteUrl('/stickwijzer')}): keuzehulp met drie routes (start, ontwikkel, prestatie).`,
    `- [${METHODIEK.title}](${absoluteUrl('/methodiek')}): ${METHODIEK.metaDescription}`,
    '',
    '## Kennis',
    ...getAllArticles().map(
      (article) =>
        `- [${article.title}](${absoluteUrl(`/kennis/${article.slug}`)}): ${article.metaDescription}`,
    ),
    ...getAllBlogPosts().map(
      (post) =>
        `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.metaDescription}`,
    ),
    '',
    '## Catalogus',
    `- [Alle hockeysticks](${absoluteUrl('/sticks')}): specificaties met bron en controledatum per stick.`,
    `- [Merken](${absoluteUrl('/merken')}): de merken in de catalogus.`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
