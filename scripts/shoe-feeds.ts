// Shared readers for the shoe feed scripts (shoe-feed-check.ts, shoe-import.ts).
// The Awin URL holds an API key: it comes only from AWIN_PLUTOSPORT_FEED_URL and
// never reaches a report, log or error message (redact).
import { createReadStream, readFileSync } from 'node:fs';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { createGunzip } from 'node:zlib';
import { PASSAHOCKEY_FEED_URL } from '../src/catalog/passaFeed';
import { PlutoShoeCollector, parsePassaShoes, type ShoeModel } from '../src/catalog/shoeFeed';
import { CsvReader } from '../src/lib/csv';

const FEED_ENV = 'AWIN_PLUTOSPORT_FEED_URL';

export type FeedResult = { models: ShoeModel[]; note: string } | { error: string };

/** Never let the Awin URL or its key reach the report or the log. */
export function redact(text: string): string {
  const url = process.env[FEED_ENV]?.trim();
  let safe = text;
  if (url) {
    safe = safe.split(url).join('[feed-URL]');
    const query = url.split('?')[1];
    if (query) safe = safe.split(query).join('[…]');
  }
  return safe.replace(/https?:\/\/[^\s"']*awin[^\s"']*/gi, '[Awin-URL]');
}

export async function readPassa(localPath: string | undefined): Promise<FeedResult> {
  try {
    let xml: string;
    if (localPath) {
      xml = readFileSync(localPath, 'utf8');
    } else {
      const response = await fetch(PASSAHOCKEY_FEED_URL, { signal: AbortSignal.timeout(300_000) });
      if (!response.ok) return { error: `PassaHockey-feed niet opgehaald (HTTP ${response.status}).` };
      xml = await response.text();
    }
    const products = (xml.match(/<product[\s>]/g) ?? []).length;
    return { models: parsePassaShoes(xml), note: `${products} productregels gelezen.` };
  } catch (error) {
    return { error: `PassaHockey-feed niet gelezen (${error instanceof Error ? error.name : 'onbekende fout'}).` };
  }
}

async function* gunzipIfNeeded(source: AsyncIterable<Buffer | Uint8Array>): AsyncGenerator<string> {
  const decoder = new TextDecoder('utf-8');
  const buffers: Buffer[] = [];
  for await (const chunk of source) buffers.push(Buffer.from(chunk));
  const all = Buffer.concat(buffers);
  const gzip = all[0] === 0x1f && all[1] === 0x8b;
  const stream = gzip ? Readable.from([all]).pipe(createGunzip()) : Readable.from([all]);
  for await (const chunk of stream) yield decoder.decode(chunk as Buffer, { stream: true });
  const tail = decoder.decode();
  if (tail) yield tail;
}

export async function readPlutosport(localPath: string | undefined): Promise<FeedResult> {
  try {
    let source: AsyncIterable<Buffer | Uint8Array>;
    if (localPath) {
      source = createReadStream(localPath);
    } else {
      const url = process.env[FEED_ENV]?.trim();
      if (!url) return { error: `${FEED_ENV} ontbreekt (GitHub-secret).` };
      const response = await fetch(url, { signal: AbortSignal.timeout(600_000) });
      if (!response.ok || !response.body) return { error: `Plutosport-feed niet opgehaald (HTTP ${response.status}).` };
      source = Readable.fromWeb(response.body as WebReadableStream<Uint8Array>);
    }
    const collector = new PlutoShoeCollector();
    const reader = new CsvReader();
    // The feed is filtered in Awin to hockey products, so it fits in memory.
    for await (const text of gunzipIfNeeded(source)) for (const row of reader.push(text)) collector.add(row);
    for (const row of reader.end()) collector.add(row);
    return {
      models: collector.result(),
      note: `${collector.rows} regels gelezen. Het Awin-filter van deze feed staat op hockeyproducten; staan er geen schoenen in, controleer dan eerst dat filter.`,
    };
  } catch (error) {
    return { error: redact(`Plutosport-feed niet gelezen (${error instanceof Error ? error.name : 'onbekende fout'}).`) };
  }
}

