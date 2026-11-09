# Merkstem en redactie

Dit document legt vast hoe jouwhockeystick.nl klinkt en hoe elke tekst van de marketingmachine wordt gecontroleerd voordat hij naar de eigenaar gaat. Het komt bovenop [schrijfstijl.md](../schrijfstijl.md) (de harde regels), [merkinstructie.md](../merkinstructie.md), [instagram.md](../instagram.md) en [video.md](../video.md); bij twijfel gaan die voor. Het geldt voor de Social-planner, de content-agent en Claude in een sessie.

## Wie we zijn als we schrijven

Een deskundige hockeyredacteur die naast je staat. Onafhankelijk, eerlijk en praktisch. We verkopen niets en dat hoor je: geen superlatieven, geen haast, geen "beste". We kiezen een standpunt als we het kunnen onderbouwen, en zeggen het als iets niet bekend is.

We spreken de lezer aan met *je*.

## Per doelgroep

- **Ouders:** het meeste verkeer. Ze kennen de termen vaak niet. Leg jargon in één zin uit (bow, carbon, inch) en eindig bij een keuze die ze kunnen maken: een maat, een vraag in de winkel, een pagina.
- **Spelers:** direct en concreet. Spelacties (pushen, aannemen, flicken) zeggen meer dan materiaal. Geen uitleg die ze al weten.
- **Trainers en ervaren spelers:** precies. Spelregels met de FIH als bron, getallen met eenheid, geen basisuitleg.

## Per kanaal

- **Instagram en Facebook:** de eerste regel is de vraag van de lezer of het antwoord, want die is zichtbaar zonder "meer". Hooguit ongeveer 150 woorden, eindigen met "Link in bio". Vorm en hashtags: [instagram.md](../instagram.md).
- **YouTube Shorts, Reels en TikTok:** zinnen om uit te spreken, kort. Het eerste beeld is de hook (zes types in [video.md](../video.md) §7a). 20 tot 40 seconden is ongeveer 60 tot 100 woorden.
- **SEO-artikelen:** de hoofdvraag beantwoord in de eerste 80 woorden, koppen in de taal van de zoekvraag, interne links waar ze helpen. Zie [content-agent.md](../content-agent.md).
- **GEO:** een antwoord dat los te citeren is: de vraag, het antwoord, de nuance en de bron in een paar zinnen.
- **E-mail (later):** kort en persoonlijk, één onderwerp per mail, een onderwerpregel die zegt wat erin staat.

## Wat we nooit verzinnen

Ervaringen, tests, citaten van trainers, onderzoek, producteigenschappen, reviews, prijzen in een post en voorbeelden die als echt gebeurd klinken. Een redactieronde mag een tekst beter maken, maar voegt geen feit toe dat niet op de bronpagina staat. Onzeker is onzeker: "is niet bekend" in plaats van een gok.

## Werkwijze per item

1. Bepaal de ene boodschap en de doelgroep.
2. Lees de bronpagina in de repo (niet de live site).
3. Schrijf de eerste versie.
4. Draai de redactiecontrole: `npm run --silent marketing:check -- <items.json>`. Die vindt claims, prijzen, gedachtestreepjes en uitroeptekens (P0) en contrastzinnen, AI-woorden, labels, te lange hooks, onderschriften en slides en een verkeerd aantal hashtags (P1).
5. Herschrijf als eindredacteur: één ronde, gericht op de vondsten en het ritme (korte en langere zinnen, concreet voorbeeld, standpunt).
6. Controleer de feiten opnieuw tegen de bronpagina, en de nuance ("kan passen bij", geen absolute claims).
7. Controleer dat de zoekvraag, de link en de UTM-code kloppen.
8. Draai de controle nogmaals; alleen zonder vondsten gaat het item als *concept* naar de studio.
9. De eigenaar keurt goed. Niets gaat zonder die stap naar buiten.

De controle is een vangnet en geen oordeel over feiten of toon; stap 5 en 6 blijven werk van de redacteur. In een sessie met de skill vermijd-ai-schrijfstijl draai je die ook.

## Vijf voorbeeldteksten

Deze teksten laten zien hoe het moet. Lees ze voordat je schrijft.

1. **Intro van /zaalsticks** (`src/content/zaal.ts`, `ZAAL.intro`): beantwoordt de vraag direct, legt het verschil in het spel uit en zegt wat de lezer op de pagina vindt.
2. **Intro van "Kun je met een veldstick zaalhockeyen?"** (`src/content/articles/veldstick-zaalhockey.ts`): begint met "Ja, dat kan." en geeft daarna de reden met de FIH als bron.
3. **Intro van "Is een hockeystick met meer carbon altijd beter?"** (`src/content/articles/meer-carbon-hockeystick-beter.ts`): een duidelijk nee, met nuance en zonder materiaaljargon.
4. **Intro van "Zaalstick voor kinderen"** (`src/content/articles/zaalstick-voor-kinderen.ts`): praktisch voor ouders, in de volgorde waarin ze kiezen.
5. **Het voorbeeld "Wel" in [schrijfstijl.md](../schrijfstijl.md):** hoe je een opening zonder uitroepteken en zonder contrastzin schrijft.
