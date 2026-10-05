/**
 * Public method page copy (implementation spec §14). The general scientific
 * paragraph from §8.2 is deliberately not included yet: it needs at least
 * one verified independent research source before it may be published.
 */
export const METHODIEK = {
  title: 'Hoe komt ons stickadvies tot stand?',
  metaDescription:
    'Zo werkt de keuzehulp van jouwhockeystick.nl: eerst maat, ervaring, beschikbaarheid en budget, daarna speelwensen. Met bronlabels per gegeven en zonder commerciële rangschikking.',
  author: 'Redactie jouwhockeystick.nl',
  publishedAt: '2026-10-01',
  updatedAt: '2026-10-01',
  /** Answers the main question within the first 80 words. */
  intro: [
    'Wij kijken eerst naar wat niet onderhandelbaar is: de juiste sticklengte, de ervaring van de speler, beschikbaarheid in die maat en het budget. Daarna vergelijken we de speelwensen, zoals aannemen, passen, dribbelen, 3D, backhand of dragflick.',
    'Voor beginnende hockeyers adviseren we bewust eenvoudiger. Dan staan maat, hanteerbaarheid, controle en plezier voorop. Een heel stijve of extreem gekromde stick is niet automatisch beter om hockey te leren.',
    'Voor ervaren spelers wegen we meer kenmerken mee, zoals gewenste acties, voorkeur voor een zachter of directer stickgevoel en ervaring met verschillende bow-profielen.',
  ],
  routes: [
    {
      name: 'Start',
      body: 'Voor beginnende kinderen en nieuwe hockeyers. Kort en rustig, met alleen startmodellen. Extreme low bows en sticks met heel veel carbon adviseren we hier nooit.',
    },
    {
      name: 'Ontwikkel',
      body: 'Voor spelers die de basis kennen en hun speelstijl ontdekken. We wegen ontwikkeldoelen, stickgevoel en de eerste aanname mee.',
    },
    {
      name: 'Prestatie',
      body: 'Voor gevorderde jeugd en senioren. We vergelijken op acties, techniek per actie, bow-profiel, stijfheid en budget.',
    },
  ],
  hardFilters: [
    'De geadviseerde sticklengte is niet beschikbaar.',
    'De richtprijs ligt boven het budget (tenzij je eerst wilt vergelijken).',
    'De stick past niet bij de ervaring van de speler.',
    'Startroute: extreme low bow, dragflickstick of een stick die alleen voor ervaren spelers is bedoeld.',
    'De eerste aanname is nog in ontwikkeling en de stick heeft ongeveer 85% carbon of meer.',
    'De dragflick speelt geen rol en de stick is een uitgesproken dragflickstick.',
    'Bow-profiel, bron, modeljaar of lengtes ontbreken in onze productgegevens.',
  ],
  roles: [
    {
      name: 'Beste match',
      body: 'De hoogste score, en minimaal 70 van de 100 punten.',
    },
    {
      name: 'Veilige keuze',
      body: 'Het beste alternatief dat niet lastiger speelt dan de beste match.',
    },
    {
      name: 'Ambitieuze keuze',
      body: 'Eén verantwoorde stap vooruit. Die tonen we alleen als ervaring en techniek dat toelaten, en nooit om het rijtje vol te maken.',
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
  independence:
    'Marge, affiliatevergoeding of sponsoring is geen onderdeel van de score. Bij een gelijke score gaat de eenvoudigere en daarna de goedkopere stick voor.',
  closing: [
    'Wij vertellen niet alleen wát wij adviseren, maar ook waarop dat advies is gebaseerd. Per stick maken we onderscheid tussen gegevens van de fabrikant, onze eigen metingen, praktijktests en onafhankelijke bronnen. Zo zie je wat vaststaat, wat wij zelf hebben gemeten en waar ervaring of persoonlijke voorkeur meespeelt.',
    'Een stickadvies blijft een hulpmiddel: de juiste maat, techniek, speelstijl en het gevoel in de hand bepalen samen wat voor jou de beste keuze is.',
  ],
} as const;

export const WEIGHT_LABELS = {
  size: 'Maat / beschikbare lengte',
  experience: 'Ervaring / controle',
  goal: 'Doel / acties',
  bow: 'Bow-profiel',
  feel: 'Stickgevoel',
  budget: 'Budget',
  availability: 'Beschikbaarheid',
} as const;
