import type { Metadata } from 'next';

export const SITE_URL = 'https://jouwhockeystick.nl';
export const SITE_NAME = 'jouwhockeystick.nl';
export const CONTACT_EMAIL = 'info@jouwhockeystick.nl';

export const DEFAULT_TITLE =
  'jouwhockeystick.nl — vind de hockeystick die bij je past';
export const DEFAULT_DESCRIPTION =
  'Doorloop de stickwijzer en krijg een uitlegbaar advies voor een hockeystick die past bij lengte, ervaring, speelwensen en budget — met redenen en bronnen per stick.';

/** Search results cut titles and descriptions off around these lengths. */
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 158;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  const cut = text.slice(0, maxLength - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—-]+$/, '')}…`;
}

/**
 * Per-page metadata with a canonical URL and matching Open Graph tags.
 * `path` is the stable URL of the page without query string, so filtered or
 * parameterised variants all point at one canonical address.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title?: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const metaDescription = truncate(description, MAX_DESCRIPTION_LENGTH);
  const withSuffix = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;

  return {
    // A long title drops the site suffix instead of being cut off mid-sentence.
    ...(title && {
      title: withSuffix.length > MAX_TITLE_LENGTH ? { absolute: title } : title,
    }),
    description: metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: title ?? DEFAULT_TITLE,
      description: metaDescription,
      url: path,
      siteName: SITE_NAME,
      locale: 'nl_NL',
      type: 'website',
      // Setting openGraph on a page replaces the inherited one, including the
      // file-based image, so the shared image is listed explicitly.
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: DEFAULT_TITLE,
        },
      ],
    },
    twitter: { card: 'summary_large_image' },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}
