/**
 * The public side of a recommendation: one GitHub issue without figures (owner
 * decision 2026-11-25). It names the page, the action code, the search terms (no
 * numbers) and the reason in words. All figures stay in the sealed report that the
 * Marketingstudio opens. The marker at the end lets the next run find the issue
 * again and read its labels.
 */
import { ACTION_LABELS, type Recommendation } from './opportunities';
import { LABELS, markerOf } from './evaluate';

export type IssueDraft = { id: string; title: string; body: string; labels: string[] };

export function issueFor(rec: Recommendation): IssueDraft {
  const body = [
    `**Actie ${rec.code}:** ${ACTION_LABELS[rec.code]}`,
    `**Pagina:** \`${rec.pagina}\``,
    `**Zoekopdracht${rec.zoektermen.length > 1 ? 'en' : ''}:** ${rec.zoektermen.map((term) => `"${term}"`).join(', ')}`,
    `**Waarom:** ${rec.reden}`,
    `**Prioriteit:** ${rec.prioriteit}. **Zekerheid:** ${rec.zekerheid}.`,
    '',
    'De cijfers staan niet in dit issue. Je vindt ze in het tabblad SEO van de Marketingstudio.',
    '',
    '**Zo ga je verder**',
    `- Akkoord? Voeg het label \`${LABELS.approved}\` toe. Zonder dat label gebeurt er niets.`,
    `- Staat de wijziging live? Voeg het label \`${LABELS.done}\` toe. Het maandrapport 28 dagen later kijkt of de positie veranderde, alleen in de studio.`,
    '- Niet doen? Sluit dit issue.',
    '',
    markerOf(rec.id),
  ].join('\n');
  return {
    id: rec.id,
    title: `SEO-kans ${rec.code}: ${rec.pagina}`,
    body,
    labels: [LABELS.recommendation],
  };
}
