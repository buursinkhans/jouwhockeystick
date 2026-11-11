import { describe, expect, it } from 'vitest';
import { awinClicks, awinSales, bolRows, daisyconRows, formatSalesReport, passaRows, type SalesData } from './sales';

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

describe('formatSalesReport with HockeyCity (decision log 2026-11-03)', () => {
  it('adds HockeyCity to the summary and the table, from its own TradeTracker campaign', () => {
    const report = formatSalesReport({
      current: { from: '2026-11-02', to: '2026-11-08' },
      previous: { from: '2026-10-26', to: '2026-11-01' },
      bol: { current: { rows: [] }, previous: { rows: [] } },
      passa: { current: { rows: [] }, previous: { rows: [] } },
      hockeyCity: {
        current: { rows: [{ reference: 'productpagina', clicks: 3, sales: 1 }] },
        previous: { error: 'x' },
      },
    });
    expect(report).toContain('**HockeyCity:** 3 kliks, 1 verkopen.');
    expect(report).toContain(
      '| Plek | bol.com kliks | bol.com bestellingen | PassaHockey kliks | PassaHockey verkopen | HockeyCity kliks | HockeyCity verkopen |',
    );
    expect(report).toContain('| Stickpagina | 0 | 0 | 0 | 0 | 3 | 1 |');
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

describe('Plutosport (Awin) and Daka (Daisycon) in the sales report (decision log 2026-11-11)', () => {
  const awinTransactions = [
    { id: 1, advertiserId: 8342, commissionStatus: 'approved', clickRefs: { clickRef: 'stickwijzer' }, saleAmount: { amount: 99.95, currency: 'EUR' }, commissionAmount: { amount: 6.5, currency: 'EUR' } },
    { id: 2, advertiserId: 8342, commissionStatus: 'pending', clickRefs: { clickRef: 'stickwijzer' } },
    { id: 3, advertiserId: 8342, commissionStatus: 'declined', clickRefs: { clickRef: 'productpagina' } },
    { id: 4, advertiserId: 8342, commissionStatus: 'deleted', clickRef: 'catalogus' },
    { id: 5, advertiserId: 8342, commissionStatus: 'approved', clickRef: 'catalogus' },
    { id: 6, advertiserId: 8342, commissionStatus: 'approved' },
  ];

  it('counts the Awin sales per click reference, without declined or deleted transactions, and drops amounts', () => {
    const rows = awinSales(awinTransactions);
    expect(rows).toEqual([
      { reference: 'stickwijzer', clicks: 0, sales: 2 },
      { reference: 'catalogus', clicks: 0, sales: 1 },
      { reference: '', clicks: 0, sales: 1 },
    ]);
    expect(JSON.stringify(rows)).not.toMatch(/99|6\.5|EUR/);
    expect(awinSales({ error: 'x' })).toEqual([]);
    expect(awinSales([null, 3, 'x'])).toEqual([]);
  });

  it('reads the clicks of the advertiser from the Awin advertiser report, or null without a row', () => {
    const body = [
      { advertiserId: 1001, clicks: 7, confirmedValue: 12.5 },
      { advertiserId: 8342, clicks: 41, confirmedValue: 99 },
    ];
    expect(awinClicks(body, '8342')).toBe(41);
    expect(awinClicks(body, '999')).toBeNull();
    expect(awinClicks('nee', '8342')).toBeNull();
  });

  it('reads Daisycon clicks and orders per sub id: open plus approved, not disapproved, no amounts', () => {
    const rows = daisyconRows([
      { subid: 'stickwijzer', click_raw: 12, click_unique: 9, transaction_unique: 3, transaction_open: 1, transaction_approved: 1, transaction_disapproved: 1, transaction_amount: 120.5, transaction_revenue: 8.4 },
      { subid: 'catalogus', click_raw: 5 },
      { click_raw: 2 },
    ]);
    expect(rows).toEqual([
      { reference: 'stickwijzer', clicks: 12, sales: 2 },
      { reference: 'catalogus', clicks: 5, sales: 0 },
      { reference: '', clicks: 2, sales: 0 },
    ]);
    expect(JSON.stringify(rows)).not.toMatch(/120|8\.4/);
    expect(daisyconRows('nee')).toEqual([]);
  });

  const base: SalesData = {
    current: { from: '2026-11-02', to: '2026-11-08' },
    previous: { from: '2026-10-26', to: '2026-11-01' },
    bol: { current: { rows: [] }, previous: { rows: [] } },
    passa: { current: { rows: [] }, previous: { rows: [] } },
  };

  it('shows Plutosport with total clicks and sales per place, and Daka with both per place', () => {
    const report = formatSalesReport({
      ...base,
      plutosport: {
        current: { rows: awinSales(awinTransactions) },
        previous: { rows: [{ reference: 'stickwijzer', clicks: 0, sales: 1 }] },
        clicks: { current: { value: 41 }, previous: { value: 20 } },
      },
      daka: {
        current: { rows: [{ reference: 'zaalkeuze', clicks: 6, sales: 1 }] },
        previous: { error: 'x' },
      },
    });
    expect(report).toContain('**Plutosport:** 41 kliks (alle plekken) (+105%), 4 verkopen (+300%).');
    expect(report).toContain('**Daka:** 6 kliks, 1 verkopen.');
    expect(report).toContain('Plutosport kliks | Plutosport verkopen | Daka kliks | Daka verkopen |');
    // Plutosport: clicks per place are not available ("–"), sales are.
    expect(report).toContain('| Stickwijzer | 0 | 0 | 0 | 0 | – | 2 | 0 | 0 |');
    expect(report).toContain('| Zaalkeuze | 0 | 0 | 0 | 0 | – | 0 | 6 | 1 |');
    // A sale without a click reference lands under "Overig", not lost.
    expect(report).toContain('| Overig (andere of oude link) | 0 | 0 | 0 | 0 | – | 1 | 0 | 0 |');
    expect(report).toContain('Plutosport (Awin) geeft kliks alleen in totaal');
  });

  it('says why a source failed and keeps the rest, also when the Awin clicks fail', () => {
    const report = formatSalesReport({
      ...base,
      plutosport: {
        current: { error: 'sleutel ontbreekt in GitHub Secrets' },
        previous: { error: 'x' },
        clicks: { current: { error: 'Awin /publishers/3132918/reports/advertiser gaf HTTP 401' }, previous: { error: 'x' } },
      },
      daka: { current: { error: 'sleutels ontbreken in GitHub Secrets' }, previous: { error: 'x' } },
    });
    expect(report).toContain('**Plutosport:** kon niet worden opgehaald (sleutel ontbreekt in GitHub Secrets).');
    expect(report).toContain('**Daka:** kon niet worden opgehaald (sleutels ontbreken in GitHub Secrets).');
    expect(report).toContain('**PassaHockey:** 0 kliks, 0 verkopen.');
  });

  it('reports the Plutosport sales when only the clicks failed', () => {
    const report = formatSalesReport({
      ...base,
      plutosport: {
        current: { rows: [{ reference: 'stickwijzer', clicks: 0, sales: 1 }] },
        previous: { rows: [] },
        clicks: { current: { error: 'geen rij voor adverteerder 8342 in het Awin-rapport' }, previous: { error: 'x' } },
      },
    });
    expect(report).toContain('**Plutosport:** kliks onbekend (geen rij voor adverteerder 8342 in het Awin-rapport), 1 verkopen (nieuw).');
  });

  it('leaves the report of the other shops unchanged without Plutosport and Daka, and never contains money', () => {
    const without = formatSalesReport(base);
    expect(without).not.toContain('Plutosport');
    expect(without).not.toContain('Daka');
    const withBoth = formatSalesReport({
      ...base,
      plutosport: { current: { rows: awinSales(awinTransactions) }, previous: { rows: [] }, clicks: { current: { value: 3 }, previous: { value: 0 } } },
      daka: { current: { rows: daisyconRows([{ subid: 'x', click_raw: 1, transaction_amount: 50 }]) }, previous: { rows: [] } },
    });
    expect(withBoth).not.toMatch(/€|commissie:|omzet:|99,95|6,5/i);
  });
});
