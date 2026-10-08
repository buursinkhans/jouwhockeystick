import { isProductActive } from './index';
import type { Product } from './types';

/**
 * Catalog health check (source-policy.md §3): which products need a
 * re-check, are hidden, or are incomplete. Read-only; it never changes data.
 */

/** Quarterly re-check of active brands (source-policy.md §3). */
export const RECHECK_AFTER_MONTHS = 3;

export type HealthIssue =
  | { kind: 'hidden'; field: string; lastVerifiedAt: string }
  | { kind: 'recheck_due'; field: string; lastVerifiedAt: string }
  | { kind: 'invalid_date'; field: string; lastVerifiedAt: string }
  | { kind: 'test_data' }
  | { kind: 'missing_image' }
  | { kind: 'search_link_only' }
  | { kind: 'not_sold_at_bol'; checkedAt: string };

export type ProductHealth = {
  slug: string;
  name: string;
  issues: HealthIssue[];
};

export type CatalogHealthReport = {
  checkedAt: string;
  productCount: number;
  products: ProductHealth[];
  /** Earliest date on which some property becomes due for a re-check. */
  nextRecheckDue: string | null;
};

type SourcedField = { field: string; lastVerifiedAt: string };

/** Every top-level property that carries a lastVerifiedAt. */
function sourcedFields(product: Product): SourcedField[] {
  const fields: SourcedField[] = [];
  for (const [field, value] of Object.entries(product)) {
    if (
      typeof value === 'object' &&
      value !== null &&
      'lastVerifiedAt' in value &&
      typeof value.lastVerifiedAt === 'string'
    ) {
      fields.push({ field, lastVerifiedAt: value.lastVerifiedAt });
    }
  }
  return fields;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function checkProductHealth(
  product: Product,
  now: Date = new Date(),
): ProductHealth {
  const issues: HealthIssue[] = [];
  const hidden = !isProductActive(product, now);

  for (const { field, lastVerifiedAt } of sourcedFields(product)) {
    const verified = new Date(lastVerifiedAt);
    if (Number.isNaN(verified.getTime())) {
      issues.push({ kind: 'invalid_date', field, lastVerifiedAt });
    } else if (hidden && field === 'experienceLevel') {
      issues.push({ kind: 'hidden', field, lastVerifiedAt });
    } else if (addMonths(verified, RECHECK_AFTER_MONTHS) <= now) {
      issues.push({ kind: 'recheck_due', field, lastVerifiedAt });
    }
  }
  if (product.dataStatus === 'test-data') {
    issues.push({ kind: 'test_data' });
  }
  if (!product.imageUrl) {
    issues.push({ kind: 'missing_image' });
  }
  if (product.bolNotSold) {
    issues.push({ kind: 'not_sold_at_bol', checkedAt: product.bolNotSold.checkedAt });
  } else if (!product.bolProductUrl) {
    issues.push({ kind: 'search_link_only' });
  }

  return { slug: product.slug, name: product.name, issues };
}

export function checkCatalogHealth(
  products: readonly Product[],
  now: Date = new Date(),
): CatalogHealthReport {
  const dueDates = products
    .flatMap(sourcedFields)
    .map(({ lastVerifiedAt }) => new Date(lastVerifiedAt))
    .filter((date) => !Number.isNaN(date.getTime()))
    .map((date) => addMonths(date, RECHECK_AFTER_MONTHS))
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    checkedAt: toIsoDate(now),
    productCount: products.length,
    products: products.map((product) => checkProductHealth(product, now)),
    nextRecheckDue: dueDates[0] ? toIsoDate(dueDates[0]) : null,
  };
}

const ISSUE_LABELS: Record<HealthIssue['kind'], string> = {
  hidden: 'Verborgen op de site (verificatie ouder dan 12 maanden)',
  recheck_due: 'Kwartaalcontrole nodig',
  invalid_date: 'Ongeldige lastVerifiedAt',
  test_data: 'Nog gemarkeerd als testdata',
  missing_image: 'Geen productfoto (toont illustratie)',
  search_link_only: 'Winkelknop gaat naar een zoekopdracht, niet naar de productpagina',
  not_sold_at_bol: 'Niet verkrijgbaar bij bol.com',
};

/** One line per issue kind; re-checks are grouped per product to keep the report short. */
function describeIssues(issues: HealthIssue[]): string[] {
  const lines: string[] = [];
  const recheck = issues.filter((issue) => issue.kind === 'recheck_due');
  if (recheck.length > 0) {
    const fields = recheck.map((issue) => `\`${issue.field}\``).join(', ');
    lines.push(`${ISSUE_LABELS.recheck_due}: ${fields}`);
  }
  for (const issue of issues) {
    if (issue.kind === 'recheck_due') continue;
    const label = ISSUE_LABELS[issue.kind];
    if ('field' in issue) {
      lines.push(`${label}: \`${issue.field}\` (${issue.lastVerifiedAt})`);
    } else if (issue.kind === 'not_sold_at_bol') {
      lines.push(`${label} (gecontroleerd ${issue.checkedAt})`);
    } else {
      lines.push(label);
    }
  }
  return lines;
}

/** Markdown report in Dutch, for a GitHub issue. */
export function formatHealthReport(report: CatalogHealthReport): string {
  const withIssues = report.products.filter((p) => p.issues.length > 0);
  const lines = [
    `# Catalogus-controle ${report.checkedAt}`,
    '',
    `${report.productCount} sticks gecontroleerd, ${withIssues.length} met aandachtspunten.`,
  ];
  if (report.nextRecheckDue) {
    lines.push(
      report.nextRecheckDue <= report.checkedAt
        ? `Kwartaalcontrole achterstallig sinds **${report.nextRecheckDue}**.`
        : `Eerstvolgende kwartaalcontrole: **${report.nextRecheckDue}**.`,
    );
  }
  lines.push('');

  if (withIssues.length === 0) {
    lines.push('Alles in orde: geen actie nodig.');
  } else {
    for (const product of withIssues) {
      lines.push(`### ${product.name} (\`${product.slug}\`)`);
      for (const line of describeIssues(product.issues)) {
        lines.push(`- ${line}`);
      }
      lines.push('');
    }
  }
  lines.push(
    '',
    '_Automatisch gegenereerd door de wekelijkse catalogus-controle. Wijzigt geen data._',
  );
  return lines.join('\n');
}
