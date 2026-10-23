import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // /interesse is kept out of the index with a noindex tag on the page
    // itself; blocking it here would stop crawlers from ever seeing that tag.
    // /aanbod holds the feed-imported sticks (noindex): closed to crawlers so
    // Google does not spend its crawl budget on them (decision log 2026-10-23).
    rules: { userAgent: '*', allow: '/', disallow: '/aanbod/' },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
