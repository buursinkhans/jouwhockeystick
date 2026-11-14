import { DIRECT_MIN_CARBON, SOFT_MAX_CARBON } from '@/advice-engine/carbon';
import { BUDGET_RANGE } from '@/advice-engine/playerContext';
import { getFieldProducts } from '@/catalog';
import { isJuniorStick } from '@/catalog/similar';
import type { ExperienceLevel, Product } from '@/catalog/types';
import type { Article } from '../types';
import { formatEuro } from '../catalogLinks';
import { METHODE } from '../methode';

/**
 * The guide for "welke hockeystick kopen" (owner's brief 2026-11-14; decision
 * log). Kept at its original URL (stable URLs). Until 2026-11-14 this page was
 * "Hockeystick-begrippen uitgelegd" and /blog/hockeystick-kopen owned the
 * buying searches (decision log 2026-10-08); the owner moved the main term
 * "welke hockeystick kopen" here. /sticks keeps "veldhockeysticks" and
 * "vergelijken", so this page does not target comparing.
 *
 * The method is the Jouwhockeystick-methode from methode.ts (speler, stick,
 * maat); its wording is imported, not retyped. Every step stays short and
 * links to the article that goes deeper. The budget table is computed from
 * the catalog (richtprijzen of the hand-checked field sticks), never typed.
 */

/**
 * The budget steps of the stickwijzer (BUDGET_RANGE, question budget_band).
 * Same boundary as the engine's hard filter: a price counts up to and
 * including the maximum, so a stick of exactly €75 is in "Tot €75".
 */
export const BUDGET_BANDS = (['lt_75', '75_125', '125_175', '175_250', 'gt_250'] as const).map((band) => {
  const { minEur: min, maxEur: max } = BUDGET_RANGE[band]!;
  const label = min === 0 ? `Tot €${max}` : Number.isFinite(max) ? `€${min + 1} tot €${max}` : `Meer dan €${min}`;
  return { band, label, min, max };
});

const LEVELS: readonly ExperienceLevel[] = ['beginner', 'gevorderd', 'ervaren'];

/** The hand-checked field sticks in one budget band (price above min, up to and including max). */
export function inBudgetBand(products: readonly Product[], band: (typeof BUDGET_BANDS)[number]): Product[] {
  return products.filter((p) => {
    const price = p.priceIndicativeEur.value;
    return (band.min === 0 ? price >= 0 : price > band.min) && price <= band.max;
  });
}

/** Per budget band: the sticks per level, and how many of them are junior sticks. */
export function budgetRows(products: readonly Product[]): string[][] {
  return BUDGET_BANDS.map((band) => {
    const inBand = inBudgetBand(products, band);
    const perLevel = LEVELS.map((level) => String(inBand.filter((p) => p.experienceLevel.value === level).length));
    return [band.label, ...perLevel, String(inBand.filter(isJuniorStick).length)];
  });
}

const curated = getFieldProducts();
const prices = curated.map((p) => p.priceIndicativeEur.value);
const BUDGET_ROWS = budgetRows(curated);

export const hoeKiesJeDeJuisteHockeystick: Article = {
  slug: 'hoe-kies-je-de-juiste-hockeystick',
  title: 'Welke hockeystick kopen? Kies in drie stappen: speler, stick, maat',
  seoTitle: 'Welke hockeystick kopen? Kies in drie stappen',
  intro: `Welke hockeystick je koopt, hangt af van wie ermee speelt. Kijk eerst naar niveau, speelstijl en budget, dan naar kromming en stickgevoel, en controleer als laatste de lengte. Voor wie begint, is een eenvoudige stick met weinig carbon en een rustige kromming meestal de juiste keuze. Een dure stick met veel carbon maakt leren eerder lastiger dan makkelijker.`,
  sections: [
    {
      id: 'methode',
      heading: 'De Jouwhockeystick-methode: speler, stick, maat',
      level: 2,
      body: [
        METHODE.m50,
        {
          type: 'table',
          columns: ['Stap', 'Waar je op let', 'Verder lezen'],
          rows: [
            ['1. Speler', 'Ontwikkelfase (niveau), speelstijl en budget', '[Kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners), [wat kost een stick](/kennis/wat-kost-een-hockeystick)'],
            ['2. Stick', 'Kromming (bow-profiel), materiaal en stickgevoel', '[Low bow of mid bow](/kennis/low-bow-vs-mid-bow), [hoeveel carbon](/kennis/meer-carbon-hockeystick-beter)'],
            ['3. Maat', 'Lengte bij je lichaamslengte, zonder schoenen', '[Lengtetabel](/kennis/hockeystick-lengte-tabel)'],
          ],
        },
        'Waarom deze volgorde? Een stick in de juiste lengte die niet bij je spel past, helpt je niet verder. Daarom kies je eerst wat bij de speler past, en controleer je daarna of die stick er in jouw maat is. Hoe de [stickwijzer](/stickwijzer) dit stap voor stap doet, lees je in de [uitleg van de methode](/methodiek#methode).',
      ],
    },
    {
      id: 'speler',
      heading: 'Stap 1: de speler',
      level: 2,
      body: [
        'Begin bij wie er met de stick gaat spelen. Drie dingen tellen: hoe ver de speler is, wat hij of zij het liefst doet in het veld, en wat de stick mag kosten.',
      ],
    },
    {
      heading: 'Ontwikkelfase',
      level: 3,
      body: [
        'Wie net begint of een paar seizoenen speelt, heeft het meest aan maat, controle en plezier. Een rustige kromming en weinig carbon vergeven dan meer, en een extreme low bow is geen goede eerste stick. Kent een speler de basis en ontdekt hij of zij een eigen stijl, dan tellen ook de eerste aanname, de ontwikkeldoelen en het stickgevoel mee. Gevorderde jeugd en senioren kiezen gerichter: op acties, kromming, stijfheid en budget.',
        'Zoek je voor een kind, of voor iemand die net begint? In [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners) staat waar je dan op let.',
      ],
    },
    {
      heading: 'Speelstijl',
      level: 3,
      body: [
        'Kijk naar wat de speler doet en wil leren: aannemen, passen, dribbelen, 3D-acties, de backhand of de sleeppush. Wie vooral strak vlak wil passen, heeft weinig aan een stick die gemaakt is om de bal op te tillen. Positie zegt minder dan je denkt: een verdediger die veel dribbelt, zoekt iets anders dan een verdediger die vooral lange ballen slaat. Positie gebruik je daarom alleen om de keuze te verfijnen.',
      ],
    },
    {
      heading: 'Budget',
      level: 3,
      body: [
        `Zie je budget als een bovengrens: daaronder hoef je niet het duurste te zoeken. In onze catalogus staan ${curated.length} met de hand nagekeken veldsticks, met richtprijzen van ${formatEuro(Math.min(...prices))} tot ${formatEuro(Math.max(...prices))}. Zo zijn ze over de budgetten van de [stickwijzer](/stickwijzer) verdeeld:`,
        {
          type: 'table',
          columns: ['Richtprijs', 'Beginner', 'Gevorderd', 'Ervaren', 'Waarvan junior'],
          rows: BUDGET_ROWS,
        },
        'Je ziet het patroon: sticks voor beginners en kinderen zitten vooral in de lagere budgetten, de duurste sticks zijn gemaakt voor ervaren spelers. Een hoger budget betaalt in onze catalogus vooral voor meer carbon, en dus voor een stijvere stick. Dat is niet voor iedereen een voordeel. Wat een stick per niveau kost, lees je in [wat kost een hockeystick?](/kennis/wat-kost-een-hockeystick)',
        {
          type: 'note',
          text: 'Niveau zoals het merk of de winkel het opgeeft, of onze inschatting als die ontbreekt; bij elke stick staat welke van de twee. Richtprijzen zijn adviesprijzen of winkelprijzen op de controledatum; de actuele prijs staat bij de winkel.',
        },
      ],
    },
    {
      id: 'stick',
      heading: 'Stap 2: de stick',
      level: 2,
      body: [
        'Pas als je weet wat bij de speler past, kijk je naar de stick zelf. Daarbij kijk je vooral naar de kromming en het stickgevoel.',
      ],
    },
    {
      heading: 'Kromming (bow-profiel)',
      level: 3,
      body: [
        'De bow is de kromming van de stick. Elk merk gebruikt eigen namen; grofweg zijn er drie groepen:',
        {
          type: 'list',
          items: [
            '**Standaard en mid bow:** een rustige kromming. Een goed startpunt, ook als je vooral werkt aan aannemen, passen en je slag.',
            '**Dynabow en pro bow:** een allround tussenvorm, voor wie de basis beheerst en de eerste 3D-acties wil maken.',
            '**Low bow en extreme low bow:** een lage, uitgesproken kromming voor liften, 3D en de sleeppush. Past meestal bij gevorderde spelers.',
          ],
        },
        'Het verschil tussen de twee populairste profielen lees je in [low bow of mid bow](/kennis/low-bow-vs-mid-bow).',
      ],
    },
    {
      heading: 'Materiaal en stickgevoel',
      level: 3,
      body: [
        `Carbon maakt een stick stijver. Dat voelt directer, maar een stijve stick vergeeft minder als je de bal net niet goed raakt. Voor beginners is 0 tot ${SOFT_MAX_CARBON}% carbon meestal genoeg; een stick met ${DIRECT_MIN_CARBON}% of meer past vooral bij wie de bal al zuiver aanneemt en slaat. Het carbonpercentage is een indicatie: ook de kromming, het gewicht en de balans bepalen hoe een stick voelt, en niet elk merk vermeldt het percentage.`,
        'In de stickwijzer kies je daarom een stickgevoel: **zacht en controlegericht** (vaak prettiger bij aannemen), **in balans**, of **direct en krachtig** (vooral als de eerste aanname op tempo betrouwbaar is). Meer over carbon lees je in [hoeveel carbon heeft je hockeystick nodig?](/kennis/meer-carbon-hockeystick-beter)',
      ],
    },
    {
      id: 'maat',
      heading: 'Stap 3: de maat',
      level: 2,
      body: [
        'Als laatste controleer je de lengte. Die volgt uit de lichaamslengte, gemeten zonder schoenen; sticklengtes staan in inch. In de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel) zie je per lichaamslengte welke maat past.',
        'Koop een kinderstick niet een maat groter om in te groeien. Een te lange stick maakt aannemen en dribbelen lastiger, en het kind moet er nu mee kunnen spelen. Twijfel je tussen twee maten, kies dan de kortere. Koop je de stick als cadeau, zonder dat het kind erbij is? Lees dan [hockeystick als cadeau](/kennis/hockeystick-cadeau).',
      ],
    },
    {
      id: 'niet-beter',
      heading: 'Duurder, meer carbon of een bekend merk: niet vanzelf beter',
      level: 2,
      body: [
        'Een hogere prijs betaalt vaak voor meer carbon en een uitgesprokener kromming. Voor een speler die nog leert, maakt dat de stick eerder lastiger. Meer carbon geeft een harder, directer gevoel; dat kan helpen als je de bal al zuiver raakt, maar wie nog leert, verliest de bal er vaak juist makkelijker mee. En een bekend merk vertelt nog niet of dit model bij je past. Dat lees je af aan niveau, kromming en lengte, en elk merk maakt sticks voor beginners en voor ervaren spelers.',
        'Het gaat om de match tussen speler en stick. Daarom telt in de stickwijzer elke stick binnen je budget even zwaar mee, en gebruikt de stickwijzer geen niveau dat alleen uit de prijs is geschat. Zes fouten die vaak gemaakt worden, staan in [veelgemaakte fouten bij het kiezen van een hockeystick](/blog/hockeystick-kiezen-praktische-tips).',
      ],
    },
    {
      id: 'naast-elkaar',
      heading: 'Sticks naast elkaar leggen',
      level: 2,
      body: [
        'Heb je een paar sticks op het oog, leg ze dan zo naast elkaar:',
        {
          type: 'list',
          ordered: true,
          items: [
            'Houd de maat gelijk: kijk alleen naar sticks die er in de juiste lengte zijn.',
            'Leg sticks van hetzelfde niveau naast elkaar.',
            'Kijk naar kromming en carbon samen: één getal zegt weinig.',
            'Let op de bron en het modeljaar van elk gegeven. Ontbreekt een gegeven, dan is het onbekend; reken het dan niet als nul.',
            'Vergelijk de prijs als laatste, met de verzendkosten erbij.',
          ],
        },
        'Op [alle veldhockeysticks](/sticks) filter je op niveau, lengte, maximale prijs, kromming en merk, en bij elke stick staat de bron van elk gegeven. Speel je in de zaal, kijk dan bij de [zaalsticks](/zaalsticks). Waar de winkels in verschillen, lees je in [waar koop je een hockeystick?](/kennis/waar-koop-je-een-hockeystick)',
      ],
    },
    {
      id: 'hulp',
      heading: 'Liever hulp bij kiezen?',
      level: 2,
      body: [
        'De [stickwijzer](/stickwijzer) stelt je de vragen uit deze drie stappen en geeft maximaal drie sticks, elk met de redenen en de bron. Voor een eerste stick of een kind is er een korte route; wie verder is, krijgt meer vragen over acties en stickgevoel.',
        {
          type: 'note',
          text: 'Bij de sticks staan knoppen naar partnerwinkels. Dat zijn partnerlinks: koop je via zo\'n knop, dan krijgen wij een kleine vergoeding van de winkel, en de winkel is de verkoper. Die vergoeding telt niet mee in het advies, en sticks die geen partnerwinkel verkoopt, blijven in het advies.',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-09-22',
  updatedAt: '2026-11-14',
  sources: [
    { label: 'Methodiek van de stickwijzer', url: 'https://jouwhockeystick.nl/methodiek' },
    { label: "Richtprijzen, niveaus en lengtes: de productpagina's op deze site, met bron en datum per gegeven" },
    { label: 'Redactionele inschatting jouwhockeystick.nl (geen eigen tests, geen prestatie-advies)' },
  ],
  metaDescription:
    'Welke hockeystick kopen? Kies eerst op de speler, dan op de stick en als laatste op de maat. Met budgetten uit onze catalogus en hulp van de stickwijzer.',
};
