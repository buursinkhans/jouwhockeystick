import { sourceLinkRel } from '@/content/linkPolicy';
import { parseInline } from './inlineMarkup';

export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((node, index) => {
        switch (node.kind) {
          case 'strong':
            return (
              <strong key={index} className="font-semibold text-inkt">
                {node.text}
              </strong>
            );
          case 'em':
            return <em key={index}>{node.text}</em>;
          case 'link':
            return (
              <a
                key={index}
                href={node.href}
                className="text-veld underline underline-offset-2 hover:text-inkt"
                rel={sourceLinkRel(node.href)}
                target="_blank"
              >
                {node.text}
              </a>
            );
          case 'text':
            return node.text;
        }
      })}
    </>
  );
}
