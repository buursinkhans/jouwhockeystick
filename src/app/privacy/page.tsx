import { PRIVACY } from '@/content/privacy';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: PRIVACY.title,
  description: PRIVACY.metaDescription,
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold">{PRIVACY.title}</h1>
      <p className="mt-2 text-sm text-lijngrijs">
        Versie {PRIVACY.version} · laatst gewijzigd op{' '}
        <time dateTime={PRIVACY.updatedAt}>{PRIVACY.updatedAt}</time>
      </p>
      <div className="mt-6 space-y-4 text-inkt">
        {PRIVACY.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {PRIVACY.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="mt-10 text-xl font-bold">{section.heading}</h2>
          <div className="mt-3 space-y-3 text-inkt/80">
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items && (
              <ul className="list-disc space-y-2 pl-5">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
