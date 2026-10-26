import { describe, expect, it } from 'vitest';
import { CsvReader, detectDelimiter, parseCsv } from './csv';

describe('parseCsv', () => {
  it('reads quoted fields, doubled quotes and line breaks inside quotes', () => {
    const text = 'name,description,price\n"Grays ""JB"" 12+","regel 1\nregel 2, met komma",99.95\nTK 3,,25\n';
    expect(parseCsv(text)).toEqual([
      { name: 'Grays "JB" 12+', description: 'regel 1\nregel 2, met komma', price: '99.95' },
      { name: 'TK 3', description: '', price: '25' },
    ]);
  });

  it('handles CRLF, a byte order mark and a last line without a line break', () => {
    expect(parseCsv('﻿a,b\r\n1,2\r\n3,4')).toEqual([
      { a: '1', b: '2' },
      { a: '3', b: '4' },
    ]);
  });

  it('takes the delimiter from the header line', () => {
    expect(detectDelimiter('a|b|"c,d"|e')).toBe('|');
    expect(detectDelimiter('a\tb\tc')).toBe('\t');
    expect(parseCsv('a|b\n1|2,5\n')).toEqual([{ a: '1', b: '2,5' }]);
  });

  it('gives the same rows when the text arrives in arbitrary chunks', () => {
    const text = 'a,b\n"x ""y""\nz",1\n2,"3"\n';
    const reader = new CsvReader();
    const rows = [...text].flatMap((char) => reader.push(char));
    expect([...rows, ...reader.end()]).toEqual(parseCsv(text));
  });

  it('leaves out columns a short row does not have', () => {
    expect(parseCsv('a,b,c\n1,2\n')).toEqual([{ a: '1', b: '2' }]);
  });
});
