import { getCuratedShoes } from '@/catalog/shoes';
import type { Article } from '../types';

// Counts come from the shoe catalog, so the text stays true when models change.
const checked = getCuratedShoes();
const withFitInfo = checked.filter((s) =>
  [s.fitForefoot, s.fitHeel, s.fitInstep].some((claim) => claim.value !== 'onbekend'),
).length;
const fitSentence =
  withFitInfo === 0
    ? `Van de ${checked.length} modellen die we met de hand hebben nagelopen, zegt geen enkele bron iets over de pasvorm van voorvoet, hiel of wreef. Bij al die modellen staat pasvorm dus op "onbekend".`
    : `Van de ${checked.length} modellen die we met de hand hebben nagelopen, staat bij ${withFitInfo} iets over de pasvorm van voorvoet, hiel of wreef; bij de rest staat pasvorm op "onbekend". Per model zie je wat de bron zegt, in de woorden van de bron.`;

export const hockeyschoenenSmalleBredeVoet: Article = {
  slug: 'hockeyschoenen-smalle-brede-voet',
  title: 'Smalle of brede voet: waar let je op bij het passen van hockeyschoenen?',
  intro:
    'Heb je een smalle of brede voet, kijk dan niet naar één woord als "smal" of "breed", maar naar drie plekken: de voorvoet, de hiel en de wreef. Die kunnen verschillen: een brede voorvoet met een smalle hiel komt echt voor. Pas daarom met je eigen hockeysokken en let op knelling, een losse hiel en druk bovenop de voet. Zeg je een maat groter om breedte op te lossen? Dat is meestal geen goed idee.',
  sections: [
    {
      heading: 'Waarom "smal" of "breed" te weinig zegt',
      level: 2,
      body: [
        'Een voet is niet overal even breed. Je voorvoet kan ruim zijn terwijl je hiel juist smal is, of andersom. En dan is er nog de wreef: de bovenkant van je voet, waar de veters overheen lopen. Heb je daar veel volume, dan voel je druk, ook als de schoen verder prima zit.',
        'Daarom vragen we in de schoenenwijzer niet naar één voetvorm, maar naar de plekken apart: knelt het bij de voorvoet, zit de hiel te ruim, voel je druk op de wreef, of schuift je voet? Zo kun je tegelijk een brede voorvoet en een smalle hiel aangeven, zonder dat je in een hokje wordt gestopt.',
      ],
    },
    {
      heading: 'Waar let je op bij het passen?',
      level: 2,
      body: [
        'Pas aan het eind van de dag of na het sporten, want dan zijn je voeten wat voller. Neem de hockeysokken mee die je echt draagt, en eigen inlegzolen of een brace als je die gebruikt. Check dan dit:',
        {
          type: 'list',
          items: [
            'Beide schoenen passen, ook als de ene voet iets groter is.',
            'Je tenen kunnen ontspannen liggen. Een brede voorvoet mag niet worden samengeknepen, ook de kleine teen niet.',
            'Er is geen aanhoudende knelling aan de zijkanten of op de wreef.',
            'Je hiel blijft goed aangesloten en komt niet omhoog als je loopt.',
            'Je voet schuift niet hinderlijk bij gecontroleerd afremmen.',
            'Je voet schuift niet hinderlijk opzij bij een zijwaartse beweging.',
          ],
        },
        'Loop een stukje, stop even en stap opzij, alleen waar daar ruimte en ondergrond voor zijn. Voel je bij elke stap iets wringen? Dan is het meestal niet "even inlopen".',
      ],
    },
    {
      heading: 'Brede voorvoet: niet automatisch een maat groter',
      level: 2,
      body: [
        'Knelt het aan de voorkant, dan lijkt een grotere maat een logische oplossing. Maar een langere schoen is ook langer op de plekken waar je hem niet wilt: je hiel zit losser en je voet schuift bij het afremmen. Dat maakt hockeyen juist minder fijn.',
        'Onze tip: kijk liever naar een model dat voorin meer ruimte laat, en pas het in je eigen maat. Wat een merk over de voorvoet zegt, staat bij ons per model bij de eigenschappen, als het bekend is. Een vaste regel in millimeters geven we niet: die verschilt per schoen en per voet.',
      ],
    },
    {
      heading: 'Smalle hiel: de schoen blijft niet goed zitten',
      level: 2,
      body: [
        'Komt je hiel omhoog of voelt het alsof je er half uit glijdt? Dan telt de hielaansluiting zwaarder dan een paar gram minder gewicht. Een lichte schoen met een te ruime hiel is geen goede match.',
        'Hier helpen soms de veters of een andere strik, maar zeker weten dat het opgelost is doe je pas als je er goed mee kunt afremmen en opzij kunt stappen.',
      ],
    },
    {
      heading: 'Druk op de wreef',
      level: 2,
      body: [
        'Druk bovenop de voet kun je niet oplossen door de veters losser te maken en dan te hopen dat het goed gaat. Dan zit de schoen ineens losser op andere plekken. Probeer een ander model of een andere sluiting, en controleer de hiel opnieuw.',
      ],
    },
    {
      heading: 'Wat zeggen merken over de breedte?',
      level: 2,
      body: [
        'Eerlijk is eerlijk: merken zeggen zelden iets over de breedte van een hockeyschoen. Staat er niets bij, dan zetten wij pasvorm op "onbekend". Dat is nooit "past wel" en ook nooit "gemiddeld", en het telt niet als een pluspunt voor een model.',
        fitSentence,
        'Daarom blijft passen nodig, ook als een model goed lijkt op papier. Past een model op een plek niet, dan zeggen wij dat ook eerlijk, in plaats van een schoen te beloven.',
      ],
    },
    {
      heading: 'Pijn, blaren of een blessure',
      level: 2,
      body: [
        'Heb je vaak blaren of drukplekken? Dat is een aanwijzing voor het passen, maar zeker weten waar het door komt doen we niet. Heb je terugkerende pijn of een recente blessure? Dan kunnen wij geen schoen "bij de klacht" kiezen. Laat je daarvoor individueel beoordelen door een huisarts, fysiotherapeut of podotherapeut. Neem je eigen inlegzolen mee bij het passen.',
      ],
    },
    {
      heading: 'Hoe gebruik je dit op onze site?',
      level: 2,
      body: [
        'Bekijk alle modellen op [hockeyschoenen](/hockeyschoenen), met per model wat de bron bevestigt en wat nog onbekend is. Of doe de [schoenenwijzer](/hockeyschoenen/wijzer): geef bij de pasvraag aan waar het knelt of schuift, en je krijgt maximaal drie modellen met de reden erbij. Past er geen enkel model, dan zeggen we dat eerlijk.',
        'Wil je eerst de volgorde van de keuze weten? Lees dan [welke hockeyschoenen je nodig hebt](/kennis/welke-hockeyschoenen-heb-je-nodig). Zoek je schoenen voor je kind? Dan is [maat en groeiruimte](/kennis/hockeyschoenen-kinderen-maat) het artikel om te lezen. Heb je ook een stick nodig? De [stickwijzer](/stickwijzer) werkt op dezelfde manier.',
      ],
    },
    {
      heading: 'Over deze tekst',
      level: 2,
      body: [
        {
          type: 'note',
          text: 'Dit is onze eigen vertaling van productinformatie naar advies, geen medisch advies en geen garantie op een goede pasvorm. Wij testen de schoenen niet zelf.',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-11-04',
  updatedAt: '2026-11-04',
  sources: [
    {
      label:
        'Redactioneel uitgangspunt jouwhockeystick.nl: keuzemodel hockeyschoenen (voorvoet, hiel en wreef apart, pascontrole, geen automatisch grotere maat)',
    },
    {
      label:
        'Modelgegevens en bronnen per schoen: de modelpagina’s onder /hockeyschoenen, met bron en controledatum per eigenschap',
    },
  ],
  metaDescription:
    'Smalle of brede voet? Zo let je bij hockeyschoenen op voorvoet, hiel en wreef, waarom een grotere maat zelden helpt en wanneer pasvorm "onbekend" blijft.',
};
