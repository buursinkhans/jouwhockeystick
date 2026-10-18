import { describe, expect, it } from 'vitest';
import { bolRows, formatSalesReport, passaRows, type SalesData } from './sales';

const SOAP = `<?xml version="1.0"?><SOAP-ENV:Envelope><SOAP-ENV:Body><ns1:getReportReferenceResponse>
<reportReference SOAP-ENC:arrayType="ns1:ReportReferenceElement[2]">
<item xsi:type="ns1:ReportReferenceElement"><reference xsi:type="xsd:string">stickwijzer</reference><campaign><ID>39608</ID><name>Passasports.nl</name></campaign><reportData><overallClickCount xsi:type="xsd:integer">12</overallClickCount><uniqueClickCount>10</uniqueClickCount><saleCount xsi:type="xsd:integer">2</saleCount><totalCommission>9.99</totalCommission></reportData></item>
<item xsi:type="ns1:ReportReferenceElement"><reference>productpagina</reference><reportData><overallClickCount>5</overallClickCount><saleCount>0</saleCount></reportData></item>
</reportReference></ns1:getReportReferenceResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>`;

describe('parsing', () => {
  it('reads clicks and sales per reference from TradeTracker, nothing else', () => {
    expect(passaRows(SOAP)).toEqual([
      { reference: 'stickwijzer', clicks: 12, sales: 2 },
      { reference: 'productpagina', clicks: 5, sales: 0 },
    ]);
  });

  it('reduces the bol.com report to counts and drops amounts', () => {
    const rows = bolRows({
      items: [
        {
          subId: 'stickwijzer',
          name: 'Grays DB 8',
          clicks: 7,
          orders: 1,
          commission: 5.5,
        },
        { subId: '', name: 'testlink', clicks: 2, orders: 0 },
      ],
    });
    expect(rows).toEqual([
      { subId: 'stickwijzer', name: 'Grays DB 8', clicks: 7, orders: 1 },
      { subId: null, name: 'testlink', clicks: 2, orders: 0 },
    ]);
    expect(JSON.stringify(rows)).not.toContain('5.5');
  });
});

describe('formatSalesReport', () => {
  const data: SalesData = {
    current: { from: '2026-10-12', to: '2026-10-18' },
    previous: { from: '2026-10-05', to: '2026-10-11' },
    bol: {
      current: {
        rows: [
          { subId: 'stickwijzer', name: 'Grays DB 8', clicks: 8, orders: 1 },
          { subId: null, name: 'testlink', clicks: 2, orders: 0 },
        ],
      },
      previous: {
        rows: [{ subId: 'stickwijzer', name: 'x', clicks: 5, orders: 0 }],
      },
    },
    passa: { current: { error: 'inloggen mislukt' }, previous: { error: 'x' } },
  };
  const report = formatSalesReport(data);

  it('shows counts per placement, groups unknown links, and changes', () => {
    expect(report).toContain(
      '**bol.com:** 10 kliks (+100%), 1 bestellingen (nieuw)',
    );
    expect(report).toContain('| Stickwijzer | 8 | 1 | – | – |');
    expect(report).toContain(
      '| Overig (andere of oude link) | 2 | 0 | – | – |',
    );
    expect(report).toContain('| Grays DB 8 | 8 | 1 |');
  });

  it('says when a source failed instead of failing the whole report', () => {
    expect(report).toContain(
      '**PassaHockey:** kon niet worden opgehaald (inloggen mislukt).',
    );
  });

  it('never contains money', () => {
    expect(report).not.toMatch(/€|commissie:|omzet:/i);
  });
});
