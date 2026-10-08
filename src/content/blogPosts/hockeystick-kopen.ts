import type { Article } from '../types';

const GRAYS_DEFENDERS =
  'https://www.grays-hockey.com/blogs/news/what-is-the-best-hockey-stick-for-defenders';
const GRAYS_GX1000 =
  'https://www.grays-hockey.com/products/gx1000-ultrabow-composite-hockey-stick-red';
const INTERSPORT_GUIDE =
  'https://intersport.nl/blogs/hockey/waar-moet-je-op-letten-bij-de-aanschaf-van-een-hockeystick';
const INTERSPORT_STICKS = 'https://intersport.nl/collections/hockeysticks';
const PASSAHOCKEY_INDOOR = 'https://www.hockeydirect.nl/zaalhockeyadvies';

export const hockeystickKopen: Article = {
  slug: 'hockeystick-kopen',
  title: 'Hockeystick kopen? Zo kies je een stick die bij je past',
  intro:
    'Een nieuwe hockeystick kopen lijkt eenvoudig, totdat je het aanbod bekijkt. Verschillende merken, carbonpercentages, krommingen en prijzen: waar begin je? De belangrijkste tip: kies niet automatisch de duurste stick of het model van je favoriete international. Begin bij je ervaring, de juiste maat en wat je prettig vindt op het veld. Hieronder lees je hoe je een verstandige keuze maakt — zonder eerst materiaalexpert te worden.',
  sections: [
    {
      heading: '1. Begin bij jouw spel',
      level: 2,
      body: [
        'Vraag jezelf vóór het shoppen af: **wat wil ik behouden en wat wil ik verbeteren?**',
        'Misschien vind je jouw huidige stick prettig bij het aannemen, maar wil je makkelijker een bal liften. Of je zoekt juist meer rust bij harde passes. Schrijf maximaal twee wensen op. Daarmee maak je het vergelijken veel eenvoudiger.',
        'Denk bijvoorbeeld aan:',
        {
          type: 'list',
          items: [
            'Makkelijker aannemen en gecontroleerd passen.',
            'Sneller dribbelen en korte acties maken.',
            'Meer vertrouwen bij je backhand.',
            'Vaker aerials spelen.',
            'Een prettiger gevoel bij flats en slagen.',
          ],
        },
        `Je positie geeft daarbij richting, maar bepaalt niet alles. Twee verdedigers kunnen heel anders spelen: de één verdeelt vooral met korte passes, de ander slaat veel lange ballen en gebruikt aerials. Ook Grays benadrukt dat er niet één beste stick voor alle verdedigers bestaat. [Bron: Grays — sticks voor verdedigers](${GRAYS_DEFENDERS})`,
        '**Tip:** zoek niet alleen naar “stick voor een aanvaller”, maar vooral naar eigenschappen die passen bij de acties die jij daadwerkelijk uitvoert.',
      ],
    },
    {
      heading: '2. Kies de juiste lengte',
      level: 2,
      body: [
        `Een verkeerde maat kun je niet oplossen met meer carbon of een duurder model. Vooral bij kinderen verdient de lengte daarom aandacht: een te lange stick kan het leren van de techniek lastiger maken. [Bron: Intersport — hockeystick kopen](${INTERSPORT_GUIDE})`,
        'Gebruik bij een online aankoop de maattabel van de aanbieder als startpunt. Laat de speler bij twijfel ook een stick vasthouden in een normale hockeyhouding. Kan diegene ontspannen bewegen, dribbelen en de stick dicht bij het lichaam houden?',
        'Per lichaamslengte zie je de passende maat in onze [hockeystick lengte tabel](/kennis/hockeystick-lengte-tabel). De [stickwijzer](/stickwijzer) rekent de maat voor je uit en laat direct sticks zien die in die lengte te krijgen zijn.',
        `Voor volwassenen is 36,5 inch een veelgebruikte lengte. Er zijn ook langere modellen, maar langer is niet automatisch beter: vergelijk ze op hanteerbaarheid en persoonlijke voorkeur. [Bron: Intersport — hockeysticks](${INTERSPORT_STICKS})`,
      ],
    },
    {
      heading: 'Koop een kinderstick niet op de groei',
      level: 3,
      body: [
        `Het klinkt voordelig: nu een grotere maat kopen, zodat de stick langer meegaat. Ons advies is om de huidige hanteerbaarheid zwaarder te laten wegen. Een stick die nu te lang is, kan het oefenen juist moeilijker maken. [Bron: Intersport — hockeystick kopen](${INTERSPORT_GUIDE})`,
        'Begint je kind net? Houd de keuze dan eenvoudig:',
        {
          type: 'list',
          items: [
            'Een passende lengte.',
            'Een stick die makkelijk te hanteren is.',
            'Een rustig, niet te specialistisch profiel.',
            'Een prijs waarbij je later zonder grote drempel kunt overstappen.',
          ],
        },
        'Welke junior- en beginnerssticks we in de catalogus hebben, zie je bij [hockeystick voor kinderen en beginners](/kennis/hockeystick-kinderen-en-beginners).',
        `Dat sluit aan bij hoe fabrikanten hun instapmodellen ontwikkelen. Grays beschrijft bijvoorbeeld de GX1000 Ultrabow als een stick voor het leren van de kernvaardigheden van hockey. Dat is een fabrikantomschrijving, geen garantie dat ieder kind met dit model beter leert. [Fabrikantgegevens: Grays — GX1000 Ultrabow](${GRAYS_GX1000})`,
      ],
    },
    {
      heading: '3. Carbon en kromming uitgelegd',
      level: 2,
      body: [
        'Je hoeft niet alle technische details te kennen. Twee begrippen komen vrijwel overal terug: carbon en bow.',
      ],
    },
    {
      heading: 'Meer carbon is niet automatisch beter',
      level: 3,
      body: [
        `Carbon wordt gebruikt om een stick stijver te maken. In koopgidsen worden soepelere sticks doorgaans gekoppeld aan beginners en controle, en stijvere sticks aan kracht en een directere respons. [Bron: Intersport — hockeystick kopen](${INTERSPORT_GUIDE})`,
        'Maar een hoog percentage is geen rapportcijfer. Een stick met 90% carbon is niet automatisch een betere aankoop dan een model met 50%.',
        'Ons advies: begin bij de vraag of je de bal prettig kunt aannemen en gecontroleerd kunt passen. Meer directe respons is pas waardevol als je dat gevoel ook fijn vindt.',
        {
          type: 'table',
          columns: ['Jouw situatie', 'Logisch uitgangspunt'],
          rows: [
            ['Je begint net', 'Een soepele, controlegerichte stick'],
            [
              'Je ontwikkelt je basis en wilt allround spelen',
              'Een gebalanceerde stick',
            ],
            [
              'Je beheerst de basis en zoekt een directer gevoel',
              'Een stijvere stick om te vergelijken',
            ],
            [
              'Je hebt een specifieke techniek, zoals dragflick',
              'Gericht kijken naar een specialistisch profiel',
            ],
          ],
        },
        'Gebruik deze indeling als keuzehulp, niet als vaste regel. Ook materiaalopbouw, gewicht en balans spelen mee in hoe een stick aanvoelt.',
      ],
    },
    {
      heading: 'Wat betekent bow?',
      level: 3,
      body: [
        `Bow is de kromming van de stick. Niet alleen de hoeveelheid kromming, maar ook de plaats ervan maakt verschil. Een lager geplaatste kromming helpt bijvoorbeeld om onder de bal te komen voor lifts en 3D-acties; een rustiger of hoger geplaatst profiel wordt vaak als startpunt voor beginners geadviseerd. [Bron: PassaHockey — zaalhockeyadvies](${PASSAHOCKEY_INDOOR}) · [Bron: Intersport — hockeystick kopen](${INTERSPORT_GUIDE})`,
        'Je kunt het eenvoudig zo onthouden:',
        {
          type: 'list',
          items: [
            '**Mid bow of rustig profiel:** een logisch startpunt voor basistechniek en allround spel.',
            '**Pro bow of vergelijkbaar allround profiel:** interessant als je controle wilt combineren met technische acties.',
            '**Low bow:** vooral het vergelijken waard als lifts, 3D en aerials een belangrijk onderdeel van je spel zijn.',
            '**Extreme low bow:** een specialistische keuze, niet iets wat iedere speler nodig heeft.',
          ],
        },
        'Let op: profielnamen verschillen per merk. Vergelijk daarom niet alleen het woord op de stick, maar ook de omschrijving van het exacte model.',
        'Twijfel je tussen de twee meest gekozen profielen? Lees [low bow of mid bow](/kennis/low-bow-vs-mid-bow). Weet je niet welk profiel bij jouw spel past, dan vraagt de [stickwijzer](/stickwijzer) naar je spelacties en geeft een richting met redenen.',
      ],
    },
    {
      heading: '4. Test slim en vergelijk eerlijk',
      level: 2,
      body: [
        'Een stick moet niet alleen goed klinken op papier. Hij moet prettig voelen in jouw handen.',
        'Wanneer je kunt testen, kijk dan niet uitsluitend hoe hard je kunt slaan. Probeer ook de acties die je tijdens een wedstrijd het vaakst uitvoert.',
      ],
    },
    {
      heading: 'Een eenvoudige test in vijf stappen',
      level: 3,
      body: [
        {
          type: 'list',
          ordered: true,
          items: [
            '**Neem enkele passes aan.** Blijft de bal dichtbij en voelt het contact prettig?',
            '**Dribbel en wissel van richting.** Kun je de stick snel en ontspannen bewegen?',
            '**Speel korte en langere passes.** Voelt de richting voorspelbaar?',
            '**Probeer jouw favoriete actie,** bijvoorbeeld een backhand of lift.',
            '**Herhaal een actie die je lastig vindt.** Helpt het materiaal, of voelt het juist onwennig?',
          ],
        },
        'Neem waar mogelijk je huidige stick mee. Dat geeft je een herkenbaar vergelijkingspunt.',
        '**Tip:** verander niet alles tegelijk. Van een soepele, rustige stick overstappen naar een zeer stijve extreme low bow maakt het lastig om te ontdekken welk verschil je prettig vindt.',
      ],
    },
    {
      heading: 'Kijk verder dan merk en korting',
      level: 3,
      body: [
        'Een mooi ontwerp mag best meewegen. Een stick waar je graag mee speelt is aantrekkelijker dan een model dat je tegenstaat. Maar laat uiterlijk pas beslissen wanneer maat, gevoel en budget kloppen.',
        'Controleer vóór aankoop:',
        {
          type: 'list',
          items: [
            'Is dit de juiste lengte én de juiste uitvoering?',
            'Gaat het om een veldstick of een zaalstick?',
            'Welke kenmerken veranderen ten opzichte van je huidige stick?',
            'Wat zijn de retourvoorwaarden en mag je het product gebruiken tijdens een test?',
            'Is de korting op het exacte model dat je zoekt, of vooral op een aantrekkelijk klinkende productnaam?',
          ],
        },
        `Veld- en zaalsticks zijn niet hetzelfde. Zaalsticks zijn doorgaans lichter en smaller en afgestemd op het zaalspel. Controleer daarom altijd voor welke toepassing je koopt. [Bron: PassaHockey — zaalhockeyadvies](${PASSAHOCKEY_INDOOR}) · [Bron: Intersport — hockeystick kopen](${INTERSPORT_GUIDE})`,
        'Stel bovendien vooraf een budget vast. Ons advies is om alleen meer uit te geven als je kunt uitleggen welke eigenschap je daarmee koopt en waarom die voor jouw spel relevant is.',
      ],
    },
    {
      heading: '5. Eerst ontdekken, later verfijnen',
      level: 2,
      body: [
        'Voor een beginnende hockeyer hoeft de eerste aankoop geen uitgebreide zoektocht naar de perfecte specialistische stick te zijn.',
        'Kies een passende, betaalbare basisstick en ontdek eerst wat je leuk vindt: opbouwen, verdedigen, dribbelen, afronden of overal meedoen. Bij een volgende aankoop kun je veel gerichter aangeven wat je prettig vindt en wat je wilt veranderen.',
        'Voor een ervaren speler is die verfijning juist waardevol. Dan gaat het niet om “meer carbon” of “meer kromming”, maar om een concrete afweging: meer directe passing, een ander kopgevoel, makkelijker liften of juist meer rust bij de eerste aanname.',
        '**De beste aankoopvraag is daarom niet: “Welke stick is de beste?” Maar: “Welke stick past bij mijn spel, mijn ontwikkeling en mijn budget?”**',
        'Precies die vraag beantwoordt de [stickwijzer](/stickwijzer): je vult je lengte, ervaring, spelwensen en budget in en krijgt maximaal drie sticks, elk met zichtbare redenen en de bron van elk gegeven.',
        {
          type: 'note',
          text: '*Over de onderbouwing: deze kooptips gebruiken fabrikantinformatie en praktische koopgidsen. Fabrikantomschrijvingen vertellen waarvoor een model is ontworpen; ze bewijzen niet dat het voor iedere speler de beste keuze is. De keuzeadviezen in dit artikel zijn redactionele uitgangspunten, geen eigen testresultaten of prestatiegaranties.*',
        },
      ],
    },
  ],
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-06',
  updatedAt: '2026-10-08',
  sources: [
    {
      label: 'Grays — Wat is de beste hockeystick voor verdedigers?',
      url: GRAYS_DEFENDERS,
    },
    { label: 'Grays — GX1000 Ultrabow (fabrikantgegevens)', url: GRAYS_GX1000 },
    {
      label:
        'Intersport — Waar moet je op letten bij de aanschaf van een hockeystick',
      url: INTERSPORT_GUIDE,
    },
    {
      label: 'Intersport — Hockeysticks (assortiment en lengtes)',
      url: INTERSPORT_STICKS,
    },
    { label: 'PassaHockey — Zaalhockeyadvies', url: PASSAHOCKEY_INDOOR },
    {
      label:
        'Redactionele uitgangspunten jouwhockeystick.nl — geen eigen testresultaten of prestatiegaranties',
    },
  ],
  metaDescription:
    'Hockeystick kopen? Begin bij je spel en de juiste lengte, en lees wat carbon en bow betekenen, hoe je een stick test en waar je vóór aankoop op let.',
};
