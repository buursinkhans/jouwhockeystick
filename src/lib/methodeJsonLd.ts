import { METHODE } from '@/content/methode';
import { METHODIEK } from '@/content/methodiek';
import { SITE_URL, absoluteUrl } from '@/lib/site';

/**
 * Structured data for /methodiek: the page, the method as a defined term,
 * and the three parts as a HowTo. Every value is the same text that is
 * visible on the page (methodiek.test.ts checks that), because structured
 * data may only describe what a visitor can read.
 */
export function methodeJsonLd() {
  const url = absoluteUrl('/methodiek');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: METHODE.metaTitle,
        description: METHODE.metaDescription,
        inLanguage: 'nl-NL',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        datePublished: METHODIEK.publishedAt,
        dateModified: METHODIEK.updatedAt,
        about: { '@id': `${url}#methode` },
      },
      {
        '@type': 'DefinedTerm',
        '@id': `${url}#methode`,
        name: METHODE.name,
        description: METHODE.kernzin,
        url: `${url}#methode`,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Begrippen van jouwhockeystick.nl',
          url,
        },
      },
      {
        '@type': 'HowTo',
        '@id': `${url}#howto`,
        name: METHODE.howToName,
        url: `${url}#methode`,
        step: METHODE.parts.map((part, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: part.title,
          text: part.lead,
          url: `${url}#${part.id}`,
        })),
      },
    ],
  };
}
