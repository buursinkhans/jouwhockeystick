import { BRAND_PREFERENCE_POINTS } from '@/advice-engine/scoring';

/**
 * Public method page copy (implementation spec §14). The general scientific
 * paragraph from §8.2 is deliberately not included yet: it needs at least
 * one verified independent research source before it may be published.
 */
export const METHODIEK = {
  title: 'Hoe komt ons stickadvies tot stand?',
  metaDescription:
    'Zo werkt de keuzehulp van jouwhockeystick.nl: eerst de stick die bij niveau en speelwensen past, daarna of hij er in de juiste maat is. Met bronlabels en zonder commerciële rangschikking.',
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-01',
  updatedAt: '2026-10-16',
  /** Answers the main question within the first 80 words. */
  intro: [
    'Wij kiezen eerst de stick die past bij de speler: het niveau, de speelwensen (zoals aannemen, passen, dribbelen, 3D, backhand of dragflick), het stickgevoel en het budget. Daarna kijken we of die stick er in de juiste maat is. De maat is dus geen punt in de score, maar een harde voorwaarde: een stick die er niet in jouw maat is, adviseren we niet.',
    'Het niveau halen we uit je antwoorden, niet uit de route die je kiest. Bij de jeugd tot en met 15 jaar is de leeftijd het uitgangspunt: onder 11 jaar adviseren we voor een beginnende speler, van 11 tot en met 15 jaar voor een gevorderde speler. Speelt iemand in een selectieteam, kiest hij de prestatieroute of speelt hij al 4 seizoenen of langer met een zekere aanname, dan adviseren we een niveau hoger. Dat doen we niet als de speler de aanname of de basis nog leert. Wie nog geen seizoen speelt, krijgt altijd een advies voor beginners.',
    'Voor beginnende hockeyers adviseren we bewust eenvoudiger. Dan staan maat, hanteerbaarheid, controle en plezier voorop. Een heel stijve of extreem gekromde stick is niet automatisch beter om hockey te leren.',
    'Voor ervaren spelers wegen we meer kenmerken mee, zoals gewenste acties, voorkeur voor een zachter of directer stickgevoel en ervaring met verschillende bow-profielen.',
    'Wil je bij het merk van je huidige stick blijven? Dan is een stick van dat merk altijd je eerste keuze, en zetten we het best passende alternatief van een ander merk ernaast. Past er binnen je budget of op jouw niveau geen stick van dat merk, dan tonen we de best passende toch, met die melding erbij. Alleen als het merk geen stick in jouw maat heeft, lukt het niet; dan zeggen we dat.',
  ],
  routes: [
    {
      name: 'Start',
      body: 'Voor een eerste stick. Kort en rustig, met alleen startmodellen en juniorsticks. Extreme low bows en sticks met heel veel carbon adviseren we hier nooit.',
    },
    {
      name: 'Ontwikkel',
      body: 'Voor spelers die de basis kennen en hun speelstijl ontdekken. We wegen ontwikkeldoelen, stickgevoel en de eerste aanname mee.',
    },
    {
      name: 'Prestatie',
      body: 'Voor gevorderde jeugd en senioren. We vergelijken op acties, techniek per actie, bow-profiel, stijfheid en budget. Wie deze route kiest, krijgt meestal een advies een niveau hoger dan de leeftijd alleen zou geven. Dat geldt niet bij minder dan één seizoen hockey, of als de speler de basis nog leert.',
    },
  ],
  hardFilters: [
    'De stick is bedoeld voor een hoger niveau dan de speler.',
    'De richtprijs ligt boven het budget (tenzij je eerst wilt vergelijken).',
    'Startroute: extreme low bow, dragflickstick of een stick die alleen voor ervaren spelers is bedoeld.',
    'De eerste aanname is nog in ontwikkeling en de stick heeft ongeveer 85% carbon of meer.',
    'De dragflick speelt geen rol en de stick is een uitgesproken dragflickstick.',
    'Bow-profiel, bron of lengtes ontbreken in onze productgegevens. Een onbekend modeljaar sluit een stick niet uit; dat staat dan als aandachtspunt bij het advies.',
    'Als laatste: de stick is er niet in de geadviseerde maat. Is de stick die het best past er niet in jouw maat, dan zeggen we dat en tonen we de best passende sticks die er wel in jouw maat zijn.',
  ],
  roles: [
    {
      name: 'Beste match',
      body: 'De hoogste score, minimaal 70 van de 100 punten, en een stick op het niveau van de speler. Haalt de beste stick dat niet, dan heet hij "dichtstbijzijnde optie".',
    },
    {
      name: 'Veilige keuze',
      body: 'Het beste alternatief dat niet lastiger speelt dan de beste match.',
    },
    {
      name: 'Ambitieuze keuze',
      body: 'Eén verantwoorde stap vooruit. Die tonen we alleen als ervaring en techniek dat toelaten, en nooit om het rijtje vol te maken.',
    },
    {
      name: 'Eerste keuze: jouw merk',
      body: 'Alleen als je bij je merk wilt blijven: de best passende stick van dat merk staat dan altijd bovenaan, ook als hij minder goed past of duurder is dan je budget. Dat staat er dan bij.',
    },
    {
      name: 'Kijk ook eens naar',
      body: 'Alleen als je bij je merk wilt blijven: de stick van een ander merk die het best bij je antwoorden past, om mee te vergelijken.',
    },
  ],
  sourceLabels: [
    {
      name: 'Fabrikantgegevens',
      body: 'Specificaties zoals bow-profiel, carbonpercentage, lengtes en adviesprijs, overgenomen van de officiële productpagina van het merk, met controledatum. Dit zijn gegevens van de fabrikant, geen onafhankelijk bewijs.',
    },
    {
      name: 'Redactionele adviesregel',
      body: 'Onze eigen vertaling van jouw antwoorden naar een stick, bijvoorbeeld welk bow-profiel doorgaans bij een doel past. Dat is een inschatting, geen meting.',
    },
    {
      name: 'Winkelgegevens',
      body: 'Gegevens die we alleen bij een winkel konden controleren en niet bij het merk zelf. Sticks waarvan kerngegevens alleen zo bekend zijn, nemen we niet op in een advies.',
    },
    {
      name: 'Eigen meting en praktijktest',
      body: 'Die hebben we op dit moment nog niet. Bij elke stick staat daarom "niet gemeten" en "nog niet getest". Zodra we meten of testen, vermelden we datum, methode en aantal geteste exemplaren.',
    },
  ],
  partnerLinks:
    'De knoppen naar bol.com zijn partnerlinks van het bol.com Partnerprogramma. Sticks die bol.com niet verkoopt maar PassaSports wel, krijgen een knop naar PassaSports; dat is een partnerlink via TradeTracker. Koop je via zo’n link, dan kunnen wij een vergoeding krijgen; voor jou verandert de prijs niet. Die vergoeding speelt geen rol in het advies: de score kent geen invoer voor marge, vergoeding, winkel of sponsoring.',
  independence:
    'Marge, affiliatevergoeding of sponsoring is geen onderdeel van de score. Bij een gelijke score gaat de stick in de geadviseerde maat voor, daarna de eenvoudigere en daarna de goedkopere stick.',
  weightsIntro: `Elke stick krijgt maximaal 100 punten, verdeeld over de kenmerken van de stick. De maat telt niet mee in de score: die controleren we apart. Bij beginners weegt het niveau en de controle zwaarder, bij gevorderden de gewenste acties. Een stick die eenvoudiger is dan het niveau van de speler sluiten we niet uit: één niveau eenvoudiger krijgt de helft van de punten voor niveau, twee niveaus eenvoudiger bijna niets, en zo'n stick heet nooit "beste match". Wil je bij je merk blijven, dan krijgen sticks van dat merk op jouw niveau ${BRAND_PREFERENCE_POINTS} punten extra.`,
  closing: [
    'Wij vertellen niet alleen wát wij adviseren, maar ook waarop dat advies is gebaseerd. Per stick maken we onderscheid tussen gegevens van de fabrikant, onze eigen metingen, praktijktests en onafhankelijke bronnen. Zo zie je wat vaststaat, wat wij zelf hebben gemeten en waar ervaring of persoonlijke voorkeur meespeelt.',
    'Een stickadvies blijft een hulpmiddel: de juiste maat, techniek, speelstijl en het gevoel in de hand bepalen samen wat voor jou de beste keuze is.',
  ],
} as const;

export const WEIGHT_LABELS = {
  experience: 'Ervaring / controle',
  goal: 'Doel / acties',
  bow: 'Bow-profiel',
  feel: 'Stickgevoel',
  budget: 'Budget',
  availability: 'Beschikbaarheid',
} as const;
