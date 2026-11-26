// Decathlon product feed (Odyssey Partnerships), read-only look: which tag is one product, which
// fields it has, how many hockey sticks and shoes there are and a masked sample of each. It
// writes nothing to the site or the catalog. The feed is big, so it is read as a stream.
// The feed URL comes from ODYSSEY_FEED_URL (a GitHub secret). It holds a signature: it is never
// printed, logged or written, and an error shows only a fixed sentence and the HTTP status.
// Usage: npm run decathlon:feed-check > report.md
import { detectItemTag, FeedSummary, maskSecrets, summaryReport } from '../src/lib/feedSample';

const SAMPLE_BYTES = 400_000;
/** A feed larger than this is cut off: the look is for the structure, not for all products. */
const MAX_BYTES = 600_000_000;

const stop = (text: string): never => {
  process.stderr.write(`${text}\n`);
  process.exit(1);
};

async function main() {
  const url = process.env.ODYSSEY_FEED_URL;
  if (!url) return stop('ODYSSEY_FEED_URL ontbreekt (GitHub Secrets).');

  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/xml,text/xml,*/*' }, redirect: 'follow' });
  } catch {
    return stop('De feed kon niet worden gelezen (geen verbinding).');
  }
  if (!response.ok || !response.body) return stop(`De feed gaf HTTP ${response.status}. Kijk of de link nog geldig is en zonder inloggen werkt.`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let bytes = 0;
  let tag: string | null = null;
  const summary = new FeedSummary();
  let head = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (value) {
      bytes += value.byteLength;
      buffer += decoder.decode(value, { stream: true });
    }
    if (tag === null && (buffer.length >= SAMPLE_BYTES || done)) {
      head = buffer.slice(0, 1500);
      tag = detectItemTag(buffer.slice(0, SAMPLE_BYTES));
      if (tag === null) {
        process.stdout.write(`# Decathlon-feed: formaat niet herkend\n\nGeen productregels gevonden in de eerste ${SAMPLE_BYTES} tekens. Begin van het bestand:\n\n\`\`\`\n${maskSecrets(head)}\n\`\`\`\n`);
        return;
      }
    }
    if (tag !== null) {
      const close = `</${tag}>`;
      for (let end = buffer.indexOf(close); end >= 0; end = buffer.indexOf(close)) {
        const start = buffer.lastIndexOf(`<${tag}`, end);
        if (start >= 0) summary.add(buffer.slice(start, end + close.length));
        buffer = buffer.slice(end + close.length);
      }
    }
    if (done || bytes > MAX_BYTES) break;
  }
  if (tag === null) return stop('De feed was leeg.');
  process.stdout.write(`${summaryReport(summary.result(), tag, bytes)}\n`);
}

main().catch(() => stop('De feedcontrole mislukte (onverwachte fout).'));
