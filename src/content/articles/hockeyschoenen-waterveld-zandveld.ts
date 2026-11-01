import { getCuratedShoes } from '@/catalog/shoes';
import { confirmedBySource } from '@/catalog/shoes/certainty';
import type { Article } from '../types';

// Counts come from the shoe catalog, so the text stays true when models change.
const field = getCuratedShoes().filter((s) => s.category.value === 'veld');
const water = field.filter((s) => confirmedBySource(s.surfaceWater)).length;
const sand = field.filter((s) => confirmedBySource(s.surfaceSand)).length;
const both = field.filter((s) => confirmedBySource(s.surfaceWater) && confirmedBySource(s.surfaceSand)).length;
const semi = field.filter((s) => confirmedBySource(s.surfaceSemiWaterHybrid)).length;

export const hockeyschoenenWaterveldZandveld: Article = {
  slug: 'hockeyschoenen-waterveld-zandveld',
  title: 'Hockeyschoenen voor water-, zand- of semi-waterveld',
  intro:
    'Voor een water-, zand- of semi-waterveld kies je een veldschoen waarvan de fabrikant zegt dat hij bij jouw ondergrond past. Een vaste indeling "waterschoen" of "zandschoen" bestaat niet echt: sommige zolen zijn volgens de fabrikant voor allebei bedoeld. Onze tip: weet eerst op welk kunstgras je traint én speelt, ook uit, en kijk dan per model wat het merk of de winkel bevestigt.',
  sections: [
    {
      heading: 'Moet ik kiezen tussen een waterschoen en een zandschoen?',
      level: 2,
      body: [
        'Niet per se. Sommige fabrikanten maken zolen die ze zelf bedoelen voor water- én zandkunstgras. Andere modellen noemen maar één ondergrond. Het hangt dus af van het model, niet van een vaste indeling.',
        'Speel je bijna altijd op één soort veld, dan zoek je een schoen die daarvoor bevestigd geschikt is. Speel je regelmatig op allebei, dan kijk je of het merk beide ondergronden noemt. Noemt het merk er maar één, dan weten we voor de andere niet of hij past. Dat laten we dan op "onbekend" staan.',
      ],
    },
    {
      heading: 'Hoe herken je je ondergrond?',
      level: 2,
      body: [
        'Zeker weten doe je het met een simpele vraag: vraag het bij je club. Zij weten welk kunstgras er ligt, en of het een water-, zand- of semi-waterveld is.',
        'Denk daarbij niet alleen aan je thuisveld. Je traint misschien op een ander veld dan waar je wedstrijden speelt, en uitwedstrijden kunnen weer op een ander soort kunstgras zijn. Vraag dus ook naar de velden waar je team regelmatig komt.',
        'Weet je het echt niet? Dan kunnen we alleen een voorwaardelijk advies geven. Dat is eerlijker dan raden.',
      ],
    },
    {
      heading: 'Wat betekent "volgens de fabrikant geschikt voor waterveld"?',
      level: 2,
      body: [
        'Op onze schoenpagina’s staat per ondergrond of die bevestigd, ongeschikt of onbekend is, met erbij wie dat zegt. "Bevestigd" betekent: het merk of de winkel noemt deze ondergrond bij dit model. Het betekent niet dat de schoen beter presteert dan een ander model. Een fabrikantclaim is geen test.',
        'Zegt een bron dat een schoen voor "alle ondergronden" is, dan tellen wij dat als water én zand. Semi-water of hybride tellen we daar niet bij: dat moet de bron zelf noemen.',
        'Staat er "onbekend"? Dan zegt geen bron er iets over, en tellen we het nooit als "waarschijnlijk wel goed".',
      ],
    },
    {
      heading: 'En semi-waterveld of hybride?',
      level: 2,
      body: [
        'Daar gaan we niet uit van een vaste indeling: een semi-waterveld is niet automatisch hetzelfde als water of zand. Wij kijken apart of een bron semi-water of hybride noemt, en zo niet, dan blijft het onbekend.',
        'Speel je op semi-waterveld? Vraag je club welk type het precies is, en controleer bij het model wat het merk zegt.',
      ],
    },
    {
      heading: 'Welke noppen horen bij welk veld?',
      level: 2,
      body: [
        'Je hoort wel eens dat waterveld lange, scherpe noppen vraagt en zandveld korte, ronde. Zo simpel is het niet, en dat gebruiken wij niet als regel. Ook is een duurdere schoen niet vanzelf een schoen met meer grip.',
        'Wij testen de schoenen niet zelf en hebben geen vergelijkbare testgegevens over grip of slijtage. Daarom zeggen we ook niet welke schoen op welk veld het meeste grip heeft.',
      ],
    },
    {
      heading: 'Wat staat er in onze catalogus?',
      level: 2,
      body: [
        `Van de ${field.length} veldmodellen die we met de hand hebben nagelopen, bevestigt een bron bij ${water} waterveld en bij ${sand} zandveld. Bij ${both} noemt de bron allebei. Bij ${semi} noemt een bron semi-water of hybride.`,
        'Per model zie je wat er precies bevestigd is, wie dat zegt en wanneer we het controleerden. Alle modellen vind je op [hockeyschoenen](/hockeyschoenen).',
      ],
    },
    {
      heading: 'Zo gebruik je dit',
      level: 2,
      body: [
        {
          type: 'list',
          ordered: true,
          items: [
            'Vraag je club welke velden jij gebruikt, ook voor trainingen en uitwedstrijden.',
            'Kijk of het model die ondergrond(en) bevestigd heeft, en wie dat zegt.',
            'Controleer daarna de pasvorm: de juiste ondergrond lost een slechte pasvorm nooit op.',
          ],
        },
        'Lees ook [welke hockeyschoenen je nodig hebt](/kennis/welke-hockeyschoenen-heb-je-nodig), of doe de [schoenenwijzer](/hockeyschoenen/wijzer): een paar vragen en je krijgt maximaal drie modellen, met de reden erbij. Past er geen enkel model, dan zeggen we dat eerlijk.',
        'Zoek je ook een stick? De [stickwijzer](/stickwijzer) werkt op dezelfde manier.',
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
  publishedAt: '2026-11-02',
  updatedAt: '2026-11-02',
  sources: [
    {
      label: 'Redactioneel uitgangspunt jouwhockeystick.nl: keuzemodel hockeyschoenen (ondergrond meenemen, geen kunstmatige scheiding)',
    },
    {
      label: 'Modelgegevens en bronnen per schoen: de modelpagina’s onder /hockeyschoenen, met bron en controledatum per eigenschap',
    },
    {
      label: 'Grays — AeroCage XW10 (fabrikantinformatie over een zool voor water- en zandkunstgras)',
      url: 'https://www.grays-hockey.com/products/aerocage-xw10-shoe',
    },
    {
      label: 'Grays — Our Guide To The Best Grays Hockey Shoes (fabrikantbeschrijving van ondergrondgeschiktheid)',
      url: 'https://www.grays-hockey.com/blogs/news/our-guide-to-the-best-grays-hockey-shoes',
    },
  ],
  metaDescription:
    'Welke hockeyschoenen passen bij water-, zand- of semi-waterveld? Zo herken je je ondergrond en lees je wat "geschikt volgens de fabrikant" betekent.',
};
