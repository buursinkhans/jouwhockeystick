import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // /interesse is kept out of the index with a noindex tag on the page
    // itself; blocking it here would stop crawlers from ever seeing that tag.
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
