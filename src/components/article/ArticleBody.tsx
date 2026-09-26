import type { Article } from '@/content/types';

export function ArticleBody({ article }: { article: Article }) {
  return (
    <div className="max-w-none space-y-6">
      <p className="text-lg leading-relaxed text-zinc-800">{article.intro}</p>
      {article.sections.map((section) => {
        const Heading = section.level === 2 ? 'h2' : 'h3';
        const headingClass =
          section.level === 2
            ? 'text-2xl font-bold mt-8'
            : 'text-xl font-semibold mt-6';
        return (
          <div key={section.heading}>
            <Heading className={headingClass}>{section.heading}</Heading>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-relaxed text-zinc-700">
                {paragraph}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
