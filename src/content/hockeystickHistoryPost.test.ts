import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import BlogPostPage, { generateMetadata } from '@/app/blog/[slug]/page';
import sitemap from '@/app/sitemap';
import { absoluteUrl } from '@/lib/site';
import { plainText } from '@/components/article/inlineMarkup';
import { getAllBlogPosts, getBlogPostBySlug } from './blog';
import { geschiedenisVanDeHockeystick as post } from './blogPosts/geschiedenis-van-de-hockeystick';
import { getArticleBySlug } from './index';

/** The owner's own story, published as written on 2026-11-17 (decision log). */
describe('blog: Van hout tot carbon (the history of the hockey stick)', () => {
  const text = JSON.stringify(post.sections);

  it('is live, listed first on the blog, in the sitemap, under the owner’s name', async () => {
    expect(post.publishedAt).toBe('2026-11-17');
    expect(post.author).toBe('Hans Buursink');
    expect(getBlogPostBySlug('geschiedenis-van-de-hockeystick')?.title).toBe('Van hout tot carbon: hoe de hockeystick zijn vorm kreeg');
    expect(getAllBlogPosts()[0]!.slug).toBe(post.slug);
    expect(sitemap().map((entry) => entry.url)).toContain(absoluteUrl(`/blog/${post.slug}`));
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: post.slug }) });
    expect(JSON.stringify(metadata.title)).toContain(post.title);
    expect(post.metaDescription.length).toBeLessThanOrEqual(155);
  });

  it('keeps the author’s text and adds the links to the choosing articles and the stickwijzer', () => {
    for (const phrase of ['maximaal 25 millimeter diep', 'minimaal 200 millimeter', 'zes jaar later gevolgd', 'seizoen 1926–1927', 'Montreal in 1976', 'ruim honderdvijftig jaar hockeyontwikkeling']) {
      expect(`${post.intro}${text}`).toContain(phrase);
    }
    for (const href of ['/kennis/low-bow-vs-mid-bow', '/kennis/meer-carbon-hockeystick-beter', '/stickwijzer']) {
      expect(text, href).toContain(`](${href})`);
      if (href.startsWith('/kennis/')) expect(getArticleBySlug(href.split('/')[2]!), href).toBeDefined();
    }
    expect(post.sections.at(-1)!.body.at(-1)).toBe('Als je zondagochtend je stick uit je tas trekt, heb je ruim honderdvijftig jaar hockeyontwikkeling in handen.');
  });

  it('names its sources, with the FIH rules for the curve limits, and says what has no source of its own', () => {
    const labels = post.sources.map((s) => s.label).join(' ');
    expect(post.sources.some((s) => s.url?.includes('fih-Rules-of-hockey-2026'))).toBe(true);
    expect(labels).toMatch(/regel 4\.6 en 2\.15/);
    expect(labels).toMatch(/Niet elk detail heeft hier een eigen bron/);
    expect(plainText(post.intro).split(/\s+/).length).toBeLessThanOrEqual(90);
  });

  it('renders one H1 and the person as the author in the structured data', async () => {
    const html = renderToStaticMarkup(await BlogPostPage({ params: Promise.resolve({ slug: post.slug }) }));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Door Hans Buursink');
    const ld = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/.exec(html)![1]!) as { author: { '@type': string; name: string } };
    expect(ld.author).toMatchObject({ '@type': 'Person', name: 'Hans Buursink' });
  });
});
