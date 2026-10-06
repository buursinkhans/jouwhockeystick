import type { Article, ArticleBlock } from '@/content/types';
import { InlineText } from './InlineText';

function Block({ block }: { block: ArticleBlock }) {
  if (typeof block === 'string') {
    return (
      <p className="mt-3 leading-relaxed text-inkt/80">
        <InlineText text={block} />
      </p>
    );
  }

  switch (block.type) {
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List
          className={`mt-3 space-y-1.5 pl-6 leading-relaxed text-inkt/80 ${
            block.ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {block.items.map((item) => (
            <li key={item}>
              <InlineText text={item} />
            </li>
          ))}
        </List>
      );
    }
    case 'table':
      return (
        <div className="mt-4 overflow-x-auto rounded-lg border border-rand">
          <table className="w-full text-left text-sm">
            <thead className="bg-krijt">
              <tr>
                {block.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-4 py-2 font-semibold"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join('|')} className="border-t border-rand">
                  {row.map((cell, index) => (
                    <td
                      key={index}
                      className="px-4 py-2 align-top text-inkt/80"
                    >
                      <InlineText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'note':
      return (
        <p className="mt-6 border-t border-rand pt-4 text-sm leading-relaxed text-lijngrijs">
          <InlineText text={block.text} />
        </p>
      );
  }
}

export function ArticleBody({ article }: { article: Article }) {
  return (
    <div className="max-w-none space-y-6">
      <p className="text-lg leading-relaxed text-inkt">
        <InlineText text={article.intro} />
      </p>
      {article.sections.map((section) => {
        const Heading = section.level === 2 ? 'h2' : 'h3';
        const headingClass =
          section.level === 2
            ? 'text-2xl font-bold mt-8'
            : 'text-xl font-semibold mt-6';
        return (
          <div key={section.heading}>
            <Heading className={headingClass}>{section.heading}</Heading>
            {section.body.map((block, index) => (
              <Block key={index} block={block} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
