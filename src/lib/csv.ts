/**
 * Streaming CSV reader (RFC 4180: quoted fields, doubled quotes, line breaks
 * inside quotes). Feeds can be hundreds of megabytes, so text goes in chunk by
 * chunk and complete rows come out; nothing keeps the whole file in memory.
 * The delimiter is taken from the header line (comma, pipe, tab or semicolon),
 * because affiliate networks let the publisher choose it.
 */
export type CsvRow = Record<string, string>;

const DELIMITERS = [',', '|', '\t', ';'] as const;

/** The delimiter that occurs most often outside quotes in the header line. */
export function detectDelimiter(headerLine: string): string {
  const unquoted = headerLine.replace(/"[^"]*"/g, '');
  let best: string = ',';
  let bestCount = 0;
  for (const delimiter of DELIMITERS) {
    const count = unquoted.split(delimiter).length - 1;
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }
  return best;
}

export class CsvReader {
  private delimiter: string | null = null;
  private header: string[] | null = null;
  private field = '';
  private record: string[] = [];
  private inQuotes = false;
  /** A quote inside a quoted field: either the end of the field or the first of a doubled quote. */
  private quotePending = false;
  private headerBuffer = '';

  /** Rows completed by this chunk, keyed by header name. */
  push(chunk: string): CsvRow[] {
    if (this.delimiter === null) {
      this.headerBuffer += chunk;
      const end = this.headerBuffer.search(/\r?\n/);
      if (end === -1) return [];
      this.delimiter = detectDelimiter(this.headerBuffer.slice(0, end));
      chunk = this.headerBuffer;
      this.headerBuffer = '';
    }
    return this.consume(chunk);
  }

  /** Rows left at the end of the input (a last line without a line break). */
  end(): CsvRow[] {
    if (this.delimiter === null) {
      if (!this.headerBuffer) return [];
      this.delimiter = detectDelimiter(this.headerBuffer);
      const rest = this.headerBuffer;
      this.headerBuffer = '';
      this.consume(rest);
    }
    this.quotePending = false;
    this.inQuotes = false;
    const rows: CsvRow[] = [];
    if (this.field !== '' || this.record.length > 0) this.finishRecord(rows);
    return rows;
  }

  private consume(text: string): CsvRow[] {
    const delimiter = this.delimiter ?? ',';
    const rows: CsvRow[] = [];
    for (let i = 0; i < text.length; i++) {
      const char = text[i] as string;
      if (this.quotePending) {
        this.quotePending = false;
        if (char === '"') {
          this.field += '"';
          continue;
        }
        this.inQuotes = false;
      }
      if (this.inQuotes) {
        if (char === '"') this.quotePending = true;
        else this.field += char;
        continue;
      }
      if (char === '"' && this.field === '') {
        this.inQuotes = true;
      } else if (char === delimiter) {
        this.record.push(this.field);
        this.field = '';
      } else if (char === '\n') {
        this.finishRecord(rows);
      } else if (char !== '\r') {
        this.field += char;
      }
    }
    return rows;
  }

  private finishRecord(rows: CsvRow[]): void {
    this.record.push(this.field);
    this.field = '';
    const values = this.record;
    this.record = [];
    if (values.length === 1 && values[0] === '') return;
    if (this.header === null) {
      this.header = values.map((name) => name.trim().replace(/^﻿/, ''));
      return;
    }
    const row: CsvRow = {};
    this.header.forEach((name, index) => {
      const value = values[index];
      if (value !== undefined) row[name] = value;
    });
    rows.push(row);
  }
}

/** All rows of a complete CSV text; for tests and small files. */
export function parseCsv(text: string): CsvRow[] {
  const reader = new CsvReader();
  return [...reader.push(text), ...reader.end()];
}
