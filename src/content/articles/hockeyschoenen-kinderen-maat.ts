import { getCuratedShoes } from '@/catalog/shoes';
import type { Article } from '../types';

// Counts come from the shoe catalog, so the text stays true when models change.
const juniorCount = getCuratedShoes().filter((s) => s.ageGroup === 'junior').length;

export const hockeyschoenenKinderenMaat: Article = {
  slug: 'hockeyschoenen-kinderen-maat',
  title: 'Hockeyschoenen voor kinderen: maat en groeiruimte',
  intro:
    'De juiste maat hockeyschoenen voor je kind vind je door te passen, niet door te rekenen. Laat je kind passen met de hockeysokken die het echt draagt, en kijk of de tenen ontspannen liggen, de hiel blijft zitten en de voet niet schuift. Een beetje groeiruimte is fijn, maar een vaste regel in millimeters bestaat niet: dat verschilt per schoen en per voet.',
  sections: [
    {
      heading: 'Waarom een maatnummer niet genoeg is',
      level: 2,
      body: [
        'Een EU-maat zegt hoe lang een schoen ongeveer is, maar niet hoe hij zit. Twee schoenen in dezelfde maat kunnen smaller of breder vallen, en een andere hiel of wreef hebben. Dat is ook waarom je bij het ene merk een maat kleiner kiest dan bij het andere.',
        'Kijk dus naar drie plekken: de voorvoet (krap of ruim), de hiel (blijft hij zitten?) en de wreef (druk bovenop de voet). Een smalle hiel met een brede voorvoet komt echt voor, ook bij kinderen.',
      ],
    },
    {
      heading: 'Hoe pas je hockeyschoenen bij een kind?',
      level: 2,
      body: [
        'Pas aan het eind van de dag of na het sporten: voeten zijn dan wat voller. Neem de hockeysokken mee die je kind echt draagt, dikker of dunner kan al verschil maken. Check dan dit:',
        {
          type: 'list',
          items: [
            'Beide schoenen passen, ook als de ene voet iets groter is.',
            'De tenen kunnen ontspannen liggen en worden niet naar voren geduwd.',
            'Er is geen aanhoudende knelling aan de zijkanten of op de wreef.',
            'De hiel blijft goed aangesloten.',
            'De voet schuift niet hinderlijk bij gecontroleerd afremmen.',
            'De voet schuift niet hinderlijk opzij bij een zijwaartse beweging.',
          ],
        },
        'Laat je kind een stukje lopen, even stoppen en opzij stappen, alleen waar daar ruimte voor is. Vraag wat het voelt, en kijk zelf naar de hiel. Kinderen zeggen niet altijd dat het knelt.',
      ],
    },
    {
      heading: 'Hoeveel groeiruimte is goed?',
      level: 2,
      body: [
        'Een beetje ruimte voor de tenen is prima, want kindervoeten groeien. Een vaste regel in millimeters geven we niet: dat verschilt per model en per voet, en een regel die bij de ene schoen klopt, past niet bij de andere.',
        'Onze tip: kies de maat waarin de schoen nu al goed zit, met ruimte voor ontspannen tenen. Een schoen die te groot is, helpt niet. Dan schuift de voet bij het afremmen en blijft de hiel niet goed zitten, en dat maakt hockeyen juist minder fijn. Ook een maat kleiner kiezen om breedte op te lossen is meestal geen goed idee.',
        'Twijfel je? Laat je helpen bij het passen in een winkel, of vraag bij een online bestelling naar de ruil- en retourvoorwaarden voordat je bestelt.',
      ],
    },
    {
      heading: 'Veld of zaal, en welke ondergrond?',
      level: 2,
      body: [
        'Eerst bepaal je waar je kind speelt. Een veldschoen is voor kunstgras, een zaalschoen heeft een vlakkere zool die geen strepen op de vloer achterlaat. Speelt je kind allebei, dan zijn dat twee paar.',
        'Op het veld maakt het uit of het water-, zand- of semi-waterveld is. Vraag het aan de trainer, ook voor uitwedstrijden. Een schoen die volgens het merk voor allebei bedoeld is, kan handig zijn als je kind op verschillende velden speelt. Wat een merk over één model zegt, geldt niet automatisch voor een ander model.',
      ],
    },
    {
      heading: 'Een beginnend kind: begin met een passend basispaar',
      level: 2,
      body: [
        'Voor een kind dat net begint, hoeft het niet ingewikkeld. Een passend basispaar voor de ondergrond waar het speelt is een fijn startpunt. Let op teenruimte, hielvastheid en hoe de schoen aansluit als je kind opzij beweegt.',
        'Een duurdere schoen is niet vanzelf beter, en leeftijd zegt niets over de prijsklasse. Specialisatie naar een positie is voor een beginner niet nodig: kinderen wisselen vaak van plek en weten nog niet wat bij hen past.',
      ],
    },
    {
      heading: 'Pijn, blaren of een blessure',
      level: 2,
      body: [
        'Schuift de voet, ontstaan er blaren of drukplekken? Dat is een aanwijzing voor het passen, maar zeker weten waar het door komt doen we niet. Heeft je kind terugkerende pijn of een recente blessure? Dan kunnen wij geen schoen "bij de klacht" kiezen. Laat je daarvoor individueel beoordelen, bijvoorbeeld door een huisarts of fysiotherapeut. Gebruikt je kind eigen inlegzolen? Neem die mee bij het passen.',
      ],
    },
    {
      heading: 'Welke modellen kijken we naar?',
      level: 2,
      body: [
        `In onze catalogus hebben we ${juniorCount} modellen met de hand nagelopen die voor junioren bedoeld zijn. Per model staat wat het merk of de winkel bevestigt, en wat nog onbekend is. Welke maten er zijn en wat een winkel op voorraad heeft, zie je op de modelpagina.`,
        'Bekijk alle modellen op [hockeyschoenen](/hockeyschoenen), of doe de [schoenenwijzer](/hockeyschoenen/wijzer): een paar vragen en je krijgt maximaal drie modellen, met de reden erbij. Past er geen enkel model, dan zeggen we dat eerlijk. Een maat vinden we daarmee nog niet voor je: dat doe je met passen.',
        'Heeft je kind ook een stick nodig? De [stickwijzer](/stickwijzer) werkt op dezelfde manier.',
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
  publishedAt: '2026-11-03',
  updatedAt: '2026-11-03',
  sources: [
    {
      label: 'Redactioneel uitgangspunt jouwhockeystick.nl: keuzemodel hockeyschoenen (pascontrole, beginnend kind, EU-maat is geen volledige pasvorm)',
    },
    {
      label: 'Modelgegevens en bronnen per schoen: de modelpagina’s onder /hockeyschoenen, met bron en controledatum per eigenschap',
    },
  ],
  metaDescription:
    'Hockeyschoenen voor kinderen: zo pas je de juiste maat, hoeveel groeiruimte is verstandig en waar let je op bij teenruimte, hiel en zijwaarts schuiven?',
};
