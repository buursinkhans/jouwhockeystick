/**
 * The public side of a recommendation: one GitHub issue without figures (owner
 * decision 2026-11-25). It names the page, the action code, the search terms (no
 * numbers) and the reason in words. All figures stay in the sealed report that the
 * Marketingstudio opens. The marker at the end lets the next run find the issue
 * again and read its labels.
 */
import { ACTION_LABELS, shortId, type Outcome, type Recommendation, type Skipped } from './opportunities';
import { LABELS, markerOf } from './evaluate';

export type IssueDraft = { id: string; title: string; body: string; labels: string[] };

const OUTCOME_LABELS: Record<Outcome['oordeel'], string> = {
  verbeterd: 'Verbeterd',
  gelijk: 'Ongeveer gelijk',
  verslechterd: 'Verslechterd',
  'onvoldoende data': 'Onvoldoende data',
  'niet gemeten': 'Niet gemeten',
};

/**
 * The reply on a recommendation issue 28 days after "uitgevoerd": only the direction in words, no figure
 * (owner decision 2026-11-25). The issue is closed after it. The figures stay in the sealed report.
 */
export function outcomeComment(outcome: Outcome): string {
  return [
    `**Effect na 28 dagen:** ${OUTCOME_LABELS[outcome.oordeel]}.`,
    '',
    outcome.toelichting,
    '',
    'De cijfers staan alleen in het tabblad SEO van de Marketingstudio. Dit issue is hiermee afgerond. Komt de kans terug, dan maakt de maandrun een nieuw issue.',
  ].join('\n');
}

/** The id of a social idea: one per search term. */
export const socialIdOf = (term: string) => shortId(`E|${term}`);

/**
 * An idea for social (action E: a search term outside our offer, no website action), without figures.
 * The Orchestrator lists it under "Voor jou"; the owner decides, the Social-planner is not changed.
 */
export function socialIssueFor(item: Skipped): IssueDraft {
  const id = socialIdOf(item.zoekterm);
  const body = [
    `**Idee voor social:** "${item.zoekterm}"`,
    `**Waarom:** ${item.reden}`,
    '',
    'Dit is geen websiteactie. De zoekopdracht valt buiten ons aanbod; een social post kan er hooguit op inhaken. De cijfers staan niet in dit issue.',
    '',
    'Niet doen? Sluit dit issue. Een gesloten idee komt niet terug.',
    '',
    markerOf(id),
  ].join('\n');
  return { id, title: `SEO-social-idee: "${item.zoekterm}"`, body, labels: [LABELS.social] };
}

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
