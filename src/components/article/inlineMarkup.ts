export type InlineNode =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'em'; text: string }
  | { kind: 'link'; text: string; href: string };

const INLINE_PATTERN =
  /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*(.+?)\*/g;

/** Parses the small inline markup used in article text (no nesting). */
export function parseInline(source: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let lastIndex = 0;
  for (const match of source.matchAll(INLINE_PATTERN)) {
    const index = match.index;
    if (index > lastIndex) {
      nodes.push({ kind: 'text', text: source.slice(lastIndex, index) });
    }
    const [whole, strong, linkText, href, em] = match;
    if (strong !== undefined) {
      nodes.push({ kind: 'strong', text: strong });
    } else if (linkText !== undefined && href !== undefined) {
      nodes.push({ kind: 'link', text: linkText, href });
    } else if (em !== undefined) {
      nodes.push({ kind: 'em', text: em });
    }
    lastIndex = index + whole.length;
  }
  if (lastIndex < source.length) {
    nodes.push({ kind: 'text', text: source.slice(lastIndex) });
  }
  return nodes;
}
