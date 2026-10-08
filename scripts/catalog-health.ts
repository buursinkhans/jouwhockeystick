// Prints the catalog health report as Markdown (see src/catalog/health.ts).
// Run with: npm run catalog:health
import { checkCatalogHealth, formatHealthReport } from '../src/catalog/health';
import { getCatalogProducts } from '../src/catalog/index';

const report = checkCatalogHealth(getCatalogProducts());
console.log(formatHealthReport(report));
