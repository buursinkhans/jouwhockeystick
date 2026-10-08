import Link from 'next/link';
import { sourceLinkRel } from '@/content/linkPolicy';
import { parseInline } from './inlineMarkup';

const LINK_CLASS = 'text-veld underline underline-offset-2 hover:text-inkt';

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
            // Internal paths stay in the same tab; sources open in a new one.
            return node.href.startsWith('/') ? (
              <Link key={index} href={node.href} className={LINK_CLASS}>
                {node.text}
              </Link>
            ) : (
              <a
                key={index}
                href={node.href}
                className={LINK_CLASS}
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
