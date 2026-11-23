import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // /interesse is kept out of the index with a noindex tag on the page
    // itself; blocking it here would stop crawlers from ever seeing that tag.
    // /aanbod holds the feed-imported sticks (noindex): closed to crawlers so
    // Google does not spend its crawl budget on them (decision log 2026-10-23).
    // /go/ is the redirect behind every shop button (decision log 2026-11-24): bots get a 403 there,
    // and well-behaved crawlers are asked not to come at all.
    rules: { userAgent: '*', allow: '/', disallow: ['/aanbod/', '/go/'] },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
