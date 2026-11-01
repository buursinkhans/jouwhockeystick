import type { SourceType } from '@/catalog/types';
import type { ShoeAnswers } from '@/shoe-advice/answers';
import type { AdviceCertainty, CheckCode, FitPart, LimitCode, NoMatch, ReasonCode, ShoeAdviceItem } from '@/shoe-advice/types';
import { SHOE_QUESTIONS } from './questions';

/**
 * Result copy of the schoenenwijzer, following the keuzemodel §8 structure
 * and example copy: "volgens de fabrikant geschikt voor", "nog te
 * controleren"; no best shoe, no fit or injury promise, no match percentage.
 */

export const RESULT_HEADINGS = {
  profile: 'Jouw profiel',
  why: 'Waarom dit model in jouw selectie staat',
  check: 'Wat je nog moet controleren',
  limits: 'Mogelijk minder geschikt wanneer',
  basis: 'Basis en zekerheid van het advies',
} as const;

export const ROLE_LABEL: Record<ShoeAdviceItem['role'], string> = {
  eerste: 'Eerste pasadvies',
  alternatief: 'Alternatief met een andere eigenschap',
  voordeliger: 'Voordeliger alternatief',
};

export const CATEGORY_HEADING = { veld: 'Voor veldhockey', zaal: 'Voor zaalhockey' } as const;

export const ADVICE_CERTAINTY: Record<AdviceCertainty, { label: string; text: string }> = {
  'goede-onderbouwing': {
    label: 'Goede onderbouwing',
    text: 'De kenmerken die voor jou tellen, zijn met een bron bevestigd en er is geen bekend conflict. Dat is geen garantie op een goede pasvorm.',
  },
  voorwaardelijk: {
    label: 'Voorwaardelijk advies',
    text: 'Wat we konden controleren past bij je antwoorden, maar een deel moet je nog zelf controleren, zoals de pasvorm.',
  },
  'onvoldoende-informatie': {
    label: 'Onvoldoende informatie',
    text: 'Er is te weinig bevestigd om dit model aan te raden.',
  },
};

const SOURCE: Record<SourceType, string> = {
  'brand-website': 'volgens de fabrikant',
  'partner-shop': 'volgens de winkel',
  'editorial-estimate': 'volgens onze inschatting',
  'fih-rules': 'volgens het FIH-reglement',
};
export const SOURCE_NAME: Record<SourceType, string> = {
  'brand-website': 'fabrikant',
  'partner-shop': 'winkel',
  'editorial-estimate': 'redactie',
  'fih-rules': 'FIH-reglement',
};
const SURFACE = { water: 'waterveld', zand: 'zandveld', 'semi-water': 'semi-waterveld' } as const;
const PART = { voorvoet: 'de voorvoet', hiel: 'de hiel', wreef: 'de wreef' } as const satisfies Record<FitPart, string>;
const SHOP = { passasports: 'PassaHockey', plutosport: 'Plutosport' } as Record<string, string>;
const euro = (n: number) => `€ ${n.toFixed(2).replace('.', ',')}`;
/** The source's words in quotes; a closing full stop is dropped, the sentence around it adds its own. */
const quoted = (text: string) => `“${text.replace(/^["“]|["”]$/g, '').replace(/\.$/, '')}”`;

export function reasonText(reason: ReasonCode): string {
  switch (reason.code) {
    case 'CATEGORIE':
      return `Dit is ${SOURCE[reason.source]} een ${reason.category}hockeyschoen.`;
    case 'ONDERGROND':
      return `Je speelt op ${SURFACE[reason.surface]}. Dit model is ${SOURCE[reason.source]} geschikt voor ${SURFACE[reason.surface]}${reason.quote ? ` (${reason.quote.replace(/ \(algemene claim voor alle ondergronden\)$/, '; een claim voor alle ondergronden')})` : ''}.`;
    case 'NON_MARKING':
      return `Je speelt in de zaal. De zool is ${SOURCE[reason.source]} non-marking.`;
    case 'PASVORM':
      return `Je noemde ${PART[reason.part]}. ${SOURCE[reason.source][0]!.toUpperCase()}${SOURCE[reason.source].slice(1)}: ${quoted(reason.fit)}.`;
    case 'MAAT_OP_VOORRAAD':
      return `Volgens de productfeed van ${reason.shops.map((s) => SHOP[s] ?? s).join(' en ')} is maat ${reason.size} op voorraad. De winkel bevestigt dat pas bij het bestellen.`;
    case 'BINNEN_BUDGET':
      return `Past in je budget: ${euro(reason.priceEur)} bij de winkel (feedprijs, zonder verzending).`;
    case 'DEMPING':
      return `${reason.why === 'comfort' ? 'Je vindt comfort belangrijk.' : reason.why === 'loopmeters' ? 'Je maakt veel loopmeters.' : 'Je gebruikt de schoenen vaak of lang.'} Over de demping zegt de bron: ${quoted(reason.claim)}.`;
    case 'ONDERSTEUNING':
      return `${reason.why === 'stevig' ? 'Je wilt een stevige aansluiting.' : reason.why === 'zijwaarts' ? 'Je beweegt veel zijwaarts.' : 'Je maakt veel korte sprints en stops.'} Over de ondersteuning zegt de bron: ${quoted(reason.claim)}.`;
    case 'SLIJTVAST':
      return `${reason.why === 'slijtvast' ? 'Je vindt slijtvastheid belangrijk.' : 'Je gebruikt de schoenen vier keer per week of vaker.'} Over de slijtvastheid zegt de bron: ${quoted(reason.claim)}.`;
    case 'VOCHT':
      return `Je wilt bescherming tegen vocht. De bron noemt het ${reason.kind === 'anders' ? '' : `${reason.kind}: `}${quoted(reason.claim)}.`;
    case 'GEWICHT':
      return `Je wilt een licht gevoel. Gewicht volgens de bron: ${reason.grams} g in maat ${reason.size}.`;
    case 'JUNIOR_MODEL':
      return 'Een juniormodel, voor een speler die nog groeit.';
    case 'VOORDELIGER':
      return `Voordeliger: ${euro(reason.priceEur)} tegen ${euro(reason.thanEur)} voor het eerste advies, en het voldoet aan dezelfde voorwaarden.`;
  }
}

export function checkText(check: CheckCode): string {
  switch (check.code) {
    case 'ONDERGROND_ONBEKEND':
      return `Of dit model geschikt is voor ${SURFACE[check.surface]}: nog niet bevestigd. Vraag het na bij de winkel.`;
    case 'SPELER_ONDERGROND_ONBEKEND':
      return 'Op welk veld je speelt: vraag het na bij je club. Dan kun je controleren of de schoen daarbij past.';
    case 'NON_MARKING_ONBEKEND':
      return 'Of de zool non-marking is: nog niet bevestigd. Vraag het na bij de winkel.';
    case 'PASVORM_ONBEKEND':
      return `Hoe ${PART[check.part]} aansluit: online nog niet bevestigd. Let daar bij het passen op.`;
    case 'PASVORM_ALGEMEEN':
      return 'De pasvorm: ruimte voor je tenen, een hiel die goed blijft zitten en geen druk op de wreef. Online nog niet bevestigd.';
    case 'MAAT_NIET_BEVESTIGD':
      return `Of maat ${check.size} op voorraad is: dat zegt de winkel niet per maat in zijn feed. Kijk het na bij de winkel.`;
    case 'MAAT_NOG_BEPALEN':
      return 'Je maat: die bepaal je bij het passen. Een EU-maat zegt niet alles over de pasvorm.';
    case 'PRIJS_ONBEKEND':
      return 'De prijs: er is geen actuele prijs bekend. Bekijk hem bij de winkel.';
    case 'WINKELBRON':
      return 'Een deel van de gegevens komt van de winkel, niet van het merk.';
  }
}

export function limitText(limit: LimitCode): string {
  switch (limit.code) {
    case 'PASVORM_CONFLICT':
      return `Je noemde ${PART[limit.part]}, en de bron beschrijft daar: ${quoted(limit.fit)}. Dat kan knellen of schuiven.`;
    case 'BOVEN_BUDGET':
      return `Het kost ${euro(limit.priceEur)}, boven je budget van ${euro(limit.maxEur)}. Je gaf aan dat een duurder alternatief mag.`;
    case 'TWEEDE_ONDERGROND_ONBEKEND':
      return `Je ook op ${SURFACE[limit.surface]} speelt: dat is voor dit model niet bevestigd.`;
    case 'WATERAFSTOTEND_NIET_WATERDICHT':
      return 'Je natte voeten wilt voorkomen: waterafstotend is niet hetzelfde als waterdicht.';
    case 'ANDERE_LEEFTIJDSGROEP':
      return limit.modelFor === 'junior'
        ? 'Je maat groter is dan de juniormaten: dit is een juniormodel. Kijk of jouw maat erbij zit.'
        : 'Je een kleine maat nodig hebt: dit is een model voor volwassenen. Kijk of jouw maat erbij zit.';
  }
}

export function noMatchText(noMatch: NoMatch, category: 'veld' | 'zaal'): string {
  if (noMatch.reason === 'niet-bevestigd') {
    return noMatch.missing === 'non-marking'
      ? 'We vonden geen zaalschoen waarvan bevestigd is dat de zool non-marking is. Een verantwoord advies is daarom niet mogelijk. In het overzicht zie je de zaalschoenen met wat wel en niet bekend is.'
      : 'We vonden geen veldschoen die volgens een bron geschikt is voor jouw ondergrond. Een verantwoord advies is daarom niet mogelijk. In het overzicht zie je de veldschoenen met wat wel en niet bekend is.';
  }
  const why = noMatch.failed.includes('maat')
    ? 'Geen enkel model is volgens de winkels in jouw maat op voorraad, binnen je budget.'
    : noMatch.failed.includes('categorie')
      ? `Er staan nog geen ${category}hockeyschoenen in onze catalogus waarvan bevestigd is dat het een ${category}schoen is.`
      : 'Geen enkel model past binnen je budget en voorwaarden.';
  return `${why} We versoepelen geen voorwaarde om toch iets te laten zien. Kies eventueel "Maat nog bepalen" of een ander budget, of bekijk het overzicht.`;
}

export const KEEPER_TEXT = {
  heading: 'Schoenen voor keepers',
  text: 'Keepers hebben andere eisen: de schoen zit onder de keepersuitrusting en moet daarbij passen. Daar geven we online geen advies over. Laat je adviseren door een winkel met keepersuitrusting of door je club, en neem je uitrusting mee als je gaat passen.',
};

/** "Jouw profiel": what the advice is based on, from the answers (question 7 is added in the browser). */
export function profileLines(answers: ShoeAnswers): string[] {
  const label = (id: keyof ShoeAnswers, value: unknown) =>
    SHOE_QUESTIONS.find((q) => q.id === id)?.options.find((o) => o.value === String(value))?.label;
  const list = (id: keyof ShoeAnswers, values: readonly string[] | undefined) =>
    (values ?? []).map((v) => label(id, v)).filter(Boolean).join('; ').toLowerCase();
  return [
    `Voor: ${label('purpose', answers.purpose)?.toLowerCase()}, ${label('player', answers.player)?.toLowerCase()}`,
    answers.surface && `Ondergrond: ${label('surface', answers.surface)?.toLowerCase()}${answers.secondSurface && answers.secondSurface !== 'geen' ? `, daarnaast ${label('secondSurface', answers.secondSurface)?.toLowerCase()}` : ''}`,
    answers.frequency && `Gebruik: ${label('frequency', answers.frequency)?.toLowerCase()}${answers.session ? `, ${label('session', answers.session)?.toLowerCase()}` : ''}`,
    answers.fitIssues && `Pasvorm: ${list('fitIssues', answers.fitIssues)}`,
    answers.movements && `Spel: ${list('movements', answers.movements)}${answers.position ? ` (positie: ${label('position', answers.position)?.toLowerCase()}, alleen ter informatie)` : ''}`,
    answers.budget && `Budget: ${label('budget', answers.budget)}${answers.allowAboveBudget ? ', duurder alternatief mag' : ''}`,
    answers.preferences && `Voorkeuren: ${list('preferences', answers.preferences)}`,
    `Maat: ${answers.size ?? 'nog te bepalen'}`,
  ].filter((line): line is string => Boolean(line));
}
