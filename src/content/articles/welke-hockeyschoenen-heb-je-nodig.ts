import { getCuratedShoes } from '@/catalog/shoes';
import type { Article } from '../types';

// Counts come from the shoe catalog, so the text stays true when models change.
const checked = getCuratedShoes();
const fieldCount = checked.filter((s) => s.category.value === 'veld').length;
const indoorCount = checked.filter((s) => s.category.value === 'zaal').length;

export const welkeHockeyschoenenHebJeNodig: Article = {
  slug: 'welke-hockeyschoenen-heb-je-nodig',
  title: 'Welke hockeyschoenen heb je nodig?',
  intro:
    'Welke hockeyschoenen je nodig hebt, bepaal je in een vaste volgorde: eerst of je op het veld of in de zaal speelt, dan op welk kunstgras, dan hoe je voet past, en pas als laatste je budget en smaak. Je positie is hooguit een hint, geen regel. Onze tip: begin bij het veld waar je écht speelt, en laat je pas daarna verleiden door kleur of merk.',
  sections: [
    {
      heading: 'Stap 1: veld of zaal?',
      level: 2,
      body: [
        'Dit is de eerste vraag, want hij sluit de meeste schoenen meteen uit. Een veldschoen is gemaakt voor kunstgras en heeft een zool met profiel of noppen. Een zaalschoen heeft een vlakkere zool die geen strepen op de zaalvloer achterlaat (non-marking).',
        'Speel je allebei, dan zijn dat twee paar. Wij raden geen "compromisschoen" aan: een veldschoen hoort niet de zaal in en een zaalschoen niet het veld op.',
        {
          type: 'note',
          text: 'Staat bij een schoen alleen "hockeyschoen" in de winkelcategorie? Dat zegt nog niet of het een veld- of zaalmodel is. Bij ons staat zo’n model op "onbekend" tot een bron het bevestigt.',
        },
      ],
    },
    {
      heading: 'Stap 2: op welke ondergrond speel je?',
      level: 2,
      body: [
        'Bij veldhockey maakt het uit of je op water-, zand- of semi-waterveld speelt. Denk ook aan de trainingen en de uitwedstrijden, niet alleen aan je eigen club.',
        'Je hoeft niet te kiezen tussen "alleen water" en "alleen zand". Sommige merken maken zolen die volgens hen voor allebei bedoeld zijn. Wat een merk zegt over één model geldt niet automatisch voor het volgende model, en ook niet voor semi-waterveld of hybride: daar kijken we apart naar.',
        'Wat we niet doen: zeggen dat de ene schoen meer grip heeft dan de andere. Daarvoor hebben we geen vergelijkbare testgegevens, en wij testen zelf niet. We laten alleen zien wat het merk of de winkel over de ondergrond zegt.',
      ],
    },
    {
      heading: 'Stap 3: hoe past jouw voet?',
      level: 2,
      body: [
        'Hier winnen of verliezen de meeste schoenen het. Denk aan drie plekken: de voorvoet (krap of juist ruim), de hiel (blijft hij zitten?) en de wreef (druk bovenop de voet). Die kunnen allemaal anders zijn: een brede voorvoet met een smalle hiel komt echt voor.',
        'Weet je wat je nu draagt en wat daar niet fijn aan is? Dat is goud waard. Schuift je voet, heb je blaren of drukplekken? Dan is dat een aanwijzing voor het passen, geen vaststaande oorzaak.',
        'Gebruik je eigen inlegzolen of een brace? Neem die mee bij het passen. Heb je terugkerende pijn of een recente blessure? Dan kunnen wij geen schoen "bij de klacht" kiezen. Laat je daarvoor individueel beoordelen, bijvoorbeeld door een specialist.',
      ],
    },
    {
      heading: 'Stap 4: hoe vaak en hoe lang draag je ze?',
      level: 2,
      body: [
        'Eén keer per week een training is iets anders dan vier keer per week trainen én wedstrijden van een uur of langer. Hoe vaker je ze draagt, hoe belangrijker comfort en slijtage worden. Die grenzen zijn onze eigen indeling, geen wetenschappelijk omslagpunt.',
        'Een duurdere schoen is daarom niet vanzelf beter voor jou. Bij kinderen sturen we niet automatisch naar premiummodellen: een passend basispaar voor het veld waar ze spelen is een prima begin.',
      ],
    },
    {
      heading: 'Stap 5: hoe beweeg je?',
      level: 2,
      body: [
        'Veel korte sprints en plots stoppen, veel zijwaarts bewegen, of vooral loopmeters maken: dat zegt iets over wat je van een schoen vraagt, zoals aansluiting bij afremmen of comfort bij langer lopen.',
        'Je positie is daarbij context. Een aanvaller heeft niet automatisch een lichte schoen nodig, en een verdediger niet automatisch een stevige. Spelers op dezelfde positie spelen heel verschillend. Daarom vragen we naar hoe je beweegt, niet alleen waar je staat.',
      ],
    },
    {
      heading: 'Stap 6: pas als laatste je budget en voorkeuren',
      level: 2,
      body: [
        'Is het veld of de zaal bepaald, klopt de ondergrond en past de voet? Dan mag je kijken naar budget, gewicht, kleur en uitstraling. Een voorkeur zoals "licht" haalt een duidelijk pasprobleem nooit in: een lichte schoen met een te ruime hiel blijft een slechte keuze.',
      ],
    },
    {
      heading: 'Zo pas je ze',
      level: 2,
      body: [
        'Pas met de hockeysokken die je echt draagt. Let hierop:',
        {
          type: 'list',
          items: [
            'Beide schoenen passen, ook als de ene voet iets groter is.',
            'Je tenen kunnen ontspannen liggen.',
            'Er is geen aanhoudende knelling aan de zijkanten of op de wreef.',
            'Je hiel blijft goed aangesloten.',
            'Je voet schuift niet hinderlijk bij gecontroleerd afremmen of opzij.',
          ],
        },
        'Een vaste regel voor het aantal millimeters ruimte hebben we niet: dat verschilt per model en per voet. Twijfel je, laat je dan helpen bij het passen. Beweeg alleen waar daar ruimte voor is.',
      ],
    },
    {
      heading: 'Welke modellen kijken we naar?',
      level: 2,
      body: [
        `In onze catalogus hebben we ${fieldCount} veldmodellen en ${indoorCount} zaalmodellen met de hand nagelopen. Bij elk model staat wat het merk of de winkel bevestigt en wat nog onbekend is. Onbekend is bij ons nooit "waarschijnlijk wel goed".`,
        'Bekijk alle modellen op [hockeyschoenen](/hockeyschoenen), of doe de [schoenenwijzer](/hockeyschoenen/wijzer): een paar vragen en je krijgt maximaal drie modellen, met de reden erbij. Past er geen enkel model, dan zeggen we dat eerlijk.',
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
  publishedAt: '2026-11-01',
  updatedAt: '2026-11-01',
  sources: [
    {
      label: 'Redactioneel uitgangspunt jouwhockeystick.nl: keuzemodel hockeyschoenen (volgorde van de stappen, pascontrole)',
    },
    {
      label: 'Modelgegevens en bronnen per schoen: de modelpagina’s onder /hockeyschoenen, met bron en controledatum per eigenschap',
    },
    {
      label: 'Grays: AeroCage XW10 (fabrikantinformatie over een zool voor water- en zandkunstgras)',
      url: 'https://www.grays-hockey.com/products/aerocage-xw10-shoe',
    },
  ],
  metaDescription:
    'Welke hockeyschoenen heb je nodig? Kies in vaste volgorde: veld of zaal, ondergrond, pasvorm, gebruik en bewegingsstijl, en pas dan budget en smaak.',
};
