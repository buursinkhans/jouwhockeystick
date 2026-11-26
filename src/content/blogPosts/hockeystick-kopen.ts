import type { Article } from '../types';

const INTERSPORT_GUIDE =
  'https://intersport.nl/blogs/hockey/waar-moet-je-op-letten-bij-de-aanschaf-van-een-hockeystick';
const PASSAHOCKEY_INDOOR = 'https://www.hockeydirect.nl/zaalhockeyadvies';

/**
 * Kept at its original URL (stable URLs), but since 2026-11-14 about trying a
 * stick out and checking it before you buy, not about choosing one: "welke
 * hockeystick kopen" belongs to /kennis/hoe-kies-je-de-juiste-hockeystick
 * (owner's keyword table, decision log 2026-11-14). The choosing parts
 * (play, length, carbon, bow) moved there; this post links to it.
 */
export const hockeystickKopen: Article = {
  slug: 'hockeystick-kopen',
  title: 'Een hockeystick uitproberen voor je koopt: de test in vijf stappen',
  seoTitle: 'Hockeystick uitproberen voor je koopt: test in 5 stappen',
  intro:
    'Of een stick bij je past, merk je pas als je hem in je handen hebt. Probeer daarom voor je koopt de acties die je in een wedstrijd het vaakst maakt: aannemen, dribbelen, passen, je favoriete actie en iets wat je lastig vindt. Koop je online, controleer dan de maat met een stick in je handen en kijk vooraf hoe retourneren gaat.',
  sections: [
    {
      heading: 'Wat doe je vóór je gaat uitproberen?',
      level: 2,
      body: [
        'Zet eerst twee of drie sticks op een rij die al bij je passen. Die kies je eerst op de speler (niveau, speelstijl en budget), dan op de stick (kromming en stickgevoel) en als laatste op de maat. Hoe dat gaat, lees je in [welke hockeystick kopen?](/kennis/hoe-kies-je-de-juiste-hockeystick) De [stickwijzer](/stickwijzer) zet zo een rijtje voor je klaar: maximaal drie sticks, elk met de redenen erbij. Zelf rondkijken kan bij de [veldsticks](/sticks) en de [zaalsticks](/zaalsticks).',
      ],
    },
    {
      heading: 'Hoe test je een hockeystick in de winkel?',
      level: 2,
      body: [
        'Test in vijf stappen: aannemen, dribbelen, passen, je favoriete actie en iets wat je lastig vindt. Hoe een stick in je handen ligt, lees je niet af aan een specificatie.',
        {
          type: 'list',
          ordered: true,
          items: [
            '**Neem een paar passes aan.** Blijft de bal dichtbij en voelt het contact goed?',
            '**Dribbel en wissel van richting.** Beweeg je de stick snel en ontspannen?',
            '**Speel korte en lange passes.** Gaat de bal waar je hem hebben wilt?',
            '**Probeer je favoriete actie,** bijvoorbeeld een backhand of een lift.',
            '**Doe ook een actie die je lastig vindt.** Helpt de stick je, of voelt het onwennig?',
          ],
        },
        'Neem je huidige stick mee als dat kan, dan heb je iets om mee te vergelijken.',
        'Verander niet alles tegelijk. Wie van een soepele, rustige stick in één keer naar een stijve extreme low bow gaat, weet daarna niet welk verschil hem bevalt.',
      ],
    },
    {
      heading: 'Hoe check je of de maat klopt?',
      level: 2,
      body: [
        'Laat de speler de stick vasthouden in een normale hockeyhouding. Beweegt hij of zij ontspannen, lukt dribbelen en blijft de stick dicht bij het lichaam? Dan zit je goed. Welke maat bij welke lichaamslengte hoort, zie je in de [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel).',
        'Twijfel je tussen twee maten, kies dan de kortere, zeker bij een kind.',
      ],
    },
    {
      heading: 'Hoe koop je online zonder uit te proberen?',
      level: 2,
      body: [
        'Controleer vooraf de maat, de modelnaam en de retourvoorwaarden:',
        {
          type: 'list',
          items: [
            'Kies de maat met de lengtetabel en controleer hem met een geleende stick van dezelfde lengte, bijvoorbeeld van een teamgenoot.',
            'Controleer bij het bestellen de lengte en de modelnaam: winkels verkopen vaak meerdere jaargangen van hetzelfde model.',
            'Lees de retourvoorwaarden: hoe lang je hebt, en of een stick waarmee je een bal hebt geraakt nog terug mag.',
            'Bewaar de verpakking en het bonnetje tot je zeker bent.',
          ],
        },
        'Waar de winkels verschillen in verzending, retour en bezorging, lees je in [waar koop je een hockeystick?](/kennis/waar-koop-je-een-hockeystick)',
      ],
    },
    {
      heading: 'Wat controleer je voor je afrekent?',
      level: 2,
      body: [
        {
          type: 'list',
          items: [
            'Is dit de juiste lengte en de juiste uitvoering?',
            'Is het een veldstick of een zaalstick? Een zaalstick is meestal lichter en dunner, gemaakt voor het spel binnen.',
            'Wat verandert er ten opzichte van je huidige stick, en wil je dat?',
            'Wat zijn de retourvoorwaarden, en mag je de stick even uitproberen?',
            'Geldt een korting voor precies het model dat je zoekt?',
          ],
        },
        'Een mooi ontwerp mag meetellen: met een stick die je mooi vindt, speel je liever. Laat het uiterlijk pas beslissen als maat, gevoel en budget kloppen.',
        'Spreek vooraf een budget met jezelf af. Geef pas meer uit als je kunt uitleggen wat je daarvoor terugkrijgt en waarom dat bij je spel past.',
      ],
    },
    {
      heading: 'Moet je een eerste stick uitproberen?',
      level: 2,
      body: [
        'Dat hoeft niet uitgebreid. Begin je net met hockey, kies dan een betaalbare stick in de juiste maat en ontdek wat je leuk vindt. Bij je volgende stick weet je beter wat je anders wilt, en dan heeft testen meer zin. Waar je bij een eerste stick op let, staat in [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
        {
          type: 'note',
          text: '*Wij testen sticks niet zelf. Deze tips zijn onze eigen uitgangspunten, gebaseerd op informatie van merken en hockeywinkels. Koop je via een knop op deze site, dan zijn dat partnerlinks: wij krijgen dan een kleine vergoeding van de winkel, en de winkel is de verkoper.*',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-06',
  updatedAt: '2026-11-26',
  sources: [
    {
      label: 'Intersport: Waar moet je op letten bij de aanschaf van een hockeystick',
      url: INTERSPORT_GUIDE,
    },
    { label: 'PassaHockey: Zaalhockeyadvies', url: PASSAHOCKEY_INDOOR },
    {
      label:
        'Redactionele uitgangspunten jouwhockeystick.nl (geen eigen testresultaten of prestatiegaranties)',
    },
  ],
  metaDescription:
    'Een hockeystick uitproberen voor je koopt: de test in vijf stappen, de maat checken, online kopen zonder testen en wat je controleert voor je afrekent.',
};
