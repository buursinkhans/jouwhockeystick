/**
 * Does a page already link to another page in its own content? Header and footer
 * are outside <main>, so a menu link does not count. Pure: the monthly script
 * fetches the HTML. Undefined means "we do not know" (no <main> in the answer).
 */
export function hasContentLink(html: string, target: string, site = 'https://jouwhockeystick.nl'): boolean | undefined {
  const main = /<main[\s>][\s\S]*<\/main>/i.exec(html)?.[0];
  if (!main) return undefined;
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // The exact path, optionally with a query string or anchor: /sticks is not a link to /sticks/demo.
  return new RegExp(`href="(?:${escape(site)})?${escape(target)}/?(?:[?#][^"]*)?"`).test(main);
}
