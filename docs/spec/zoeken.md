# Zoeken in de header

Status: deel 1 (zoekvenster, index, events) en deel 2 (directe antwoorden, vangnet naar de stickwijzer, algemene zoektermen, `source: search`) gebouwd op 2026-11-24. Besluiten van de eigenaar staan in `docs/decision-log.md`, 2026-11-24.

## Wat het doet
- Een zoekknop in de header (alle schermen) en Ctrl of Cmd + K openen een zoekvenster. Op een telefoon is dat een scherm van boven tot onder, op een computer een venster onder de header.
- Vanaf 2 tekens verschijnen resultaten, onmiddellijk en zonder pagina te herladen: sticks (computer 4, telefoon 3), merken (2, telefoon 1) en kennisbank of blog (3, telefoon 2). Onderaan staat "Alle resultaten bekijken" naar `/zoeken?q=...`, dat ook schoenen en de feed-sticks zoekt.
- Zonder invoer staan er maximaal vijf populaire zoekopdrachten uit `search-config.json`.
- Enter opent de gekozen rij. Is er geen rij gekozen en is de eerste stick een duidelijke modelmatch (minstens twee woorden, elk een heel woord van de naam), dan opent die. Anders gaat Enter naar `/zoeken?q=...`.
- Pijl omhoog en omlaag, Enter, Tab en Esc werken. Het veld is een `combobox` met `aria-expanded`, `aria-controls` en `aria-activedescendant`; het aantal resultaten wordt voorgelezen via een `aria-live`-regio.

## Kennisvragen, antwoorden en de stickwijzer
- **Direct antwoord:** bij een kennisvraag (carbon, beginner, lengte, maat, low bow) staat boven de resultaten een kort antwoord met "Lees volledig artikel". Op een telefoon hooguit twee regels, op een groter scherm de hele tekst. De tekst staat in `search-config.json` en komt uit het artikel waar de link naartoe gaat; een test controleert dat dat artikel bestaat en dat elk getal in het antwoord ook in het artikel staat. Het antwoord verschijnt alleen bij een korte zoekopdracht (hooguit drie woorden) en niet als een stick op naam past.
- **Kennisvraag eerst:** bij een kennisvraag of algemeen woord staan de artikelen vóór de sticks (en één stick minder), zodat minstens één artikel zichtbaar blijft. Een exacte modelmatch (minstens twee woorden, minstens één daarvan een modelnaam en geen algemeen woord als "low", "bow", "carbon" of "junior") staat nooit onder een artikel.
- **Geen resultaat:** nooit een lege zoekervaring. "Geen exacte match gevonden. Laat onze Stickwijzer binnen 1 minuut de juiste stick voor je kiezen." met de knop "Start de Stickwijzer". De tijdsaanduiding sluit aan op "In 1 minuut" op /methodiek.
- **Algemene woorden** (kind, kinderen, junior, beginner, advies, maat, eerste): onder de resultaten een rustige regel "Weet je nog niet welke stick bij je past? Laat de Stickwijzer kiezen."
- **Zoeken werkt niet:** de melding met dezelfde knop.

## Waar de gegevens vandaan komen
- `src/search/buildIndex.ts` bouwt bij elke build `/data/zoekindex.json` (statisch, ongeveer 50 KB, `noindex`). Er is geen serverfunctie.
- Sticks: alleen de met de hand beheerde catalogus (`getAllProducts` zonder feed-imports). De duizenden feed-modellen zouden de index te groot maken en blijven op `/zoeken` (server).
- Merken: de merkprofielen met minstens één stick. Een merk met een merkpagina linkt naar `/merken/<merk>`, de rest naar de plek op `/merken`.
- Artikelen: de kennisbank en de blog, op titel en tussenkoppen.
- De index wordt pas geladen bij de eerste interactie (muis op de knop, focus of openen) en daarna bewaard voor de rest van het bezoek.

## Volgorde en score
Per groep: score = 70% tekstuele relevantie (een woord in de titel telt zwaarder dan een woord in de tussenkoppen) + 20% exacte match + 10% als de titel met het eerste woord begint. De groepen staan vast: sticks, merken, kennisbank. Een exacte modelmatch staat daarmee altijd boven een artikel. Prijs, winkel of vergoeding spelen geen rol. Een populariteitsscore bestaat niet in versie 1 (besluit eigenaar: er is nog geen bron voor).

Normalisatie: kleine letters, geen accenten, "low bow" en "lowbow" zijn gelijk (ook als de naam het anders schrijft), "36,5" en "36.5" zijn gelijk, een getal moet heel overeenkomen ("5" vindt niet "500"), afkortingen als pb, lb, jr en zaal worden uitgeschreven (zie `src/search/tokens.ts`).

## Prijs onder een stick
Dezelfde regels als "Waar te koop": alleen de actuele feedprijs (hooguit 14 dagen oud, de browser controleert de datum), met het aantal winkels; "Vergelijk prijzen vanaf €XX bij X winkels", bij één winkel "€XX incl. verzending bij 1 winkel". Zonder actuele prijs staat de richtprijs, gemarkeerd als richtprijs. Nooit "goedkoopst", "beste prijs" of een korting.

## Meting
Zonder cookies, via `trackEvent` (Simple Analytics en PostHog). De getypte tekst gaat nooit naar analytics (besluit eigenaar 2026-11-24, zelfde regel als `search_results`).
- `search`: `queryLength`, `resultsCount`, 800 ms nadat het typen stopt.
- `search_no_results`: `queryLength`.
- `select_search_result`: `resultType` (`stick`, `merk`, `kennisbank`, `stickwijzer`, `popular_suggestion`) en `itemName`, de openbare naam van de stick, het merk of het artikel. Bij `stickwijzer` zegt `itemName` waar de klik vandaan kwam: geen resultaat, algemene zoekterm of zoeken niet beschikbaar. Een klik op "Lees volledig artikel" telt als `kennisbank`.
- `quiz_start` en `quiz_complete` krijgen `source: 'search'` als de stickwijzer vanuit de zoekfunctie is geopend (onthouden 30 minuten in `sessionStorage`, gewist bij het afronden; `src/lib/analytics/searchContext.ts`). Er zijn geen aparte `stickwijzer_started` en `stickwijzer_completed`: de bestaande events houden de rapporten gelijk.
- `retailer_click` heeft een extra veld `fromSearch: true` als de stickpagina uit een zoekresultaat is geopend (onthouden in `sessionStorage`, alleen het pad, `src/lib/analytics/searchContext.ts`). Zo zie je hoeveel winkelkliks via de zoekfunctie lopen, zonder dat de zoektekst wordt vastgelegd.
- Een apart `affiliate_click` of `price_comparison_click` is er niet: `retailer_click` met `fromSearch` en `select_search_result` met `resultType: stick` zijn hetzelfde, zonder dubbeltelling.
- GA4 wordt niet gebruikt: de site meet zonder cookies en de privacytekst is niet aangepast.

## Handleiding: `src/search/search-config.json`
Alleen dit bestand hoef je aan te passen; de test controleert daarna of alles klopt.
- **Populaire zoekopdrachten** (`popular`): maximaal vijf. `label` is wat de bezoeker ziet, `query` is wat er gezocht wordt. Kies een zoekopdracht die resultaat geeft; de test faalt als er niets gevonden wordt. Geen "beste" of "goedkoopste" in een label.
- **Synoniemen** (`synonyms`): groepen woorden die hetzelfde betekenen, bijvoorbeeld `{ "terms": ["junior", "kinderen", "jeugd"] }`. Een zoekopdracht met een van de woorden vindt ook de andere. Elk woord is één woord in kleine letters, zonder leestekens.
- **Directe antwoorden** (`answers`): `terms` zijn de woorden die het antwoord oproepen (één woord, kleine letters; "lowbow" vangt ook "low bow"), `text` het antwoord (40 tot 320 tekens, geen getal dat niet in het artikel staat, geen "altijd", "nooit", "beste" of "garantie") en `article` de slug van het kennisartikel. Staat de slug niet bij de gepubliceerde artikelen, dan faalt de test. Schrijf in de stijl van `docs/schrijfstijl.md`.
- **Stickwijzer-woorden** (`stickwijzer.terms`): algemene woorden waarbij de zoekfunctie onder de resultaten naar de stickwijzer wijst.
- **Correcties** (`corrections`): een veelgemaakte spelfout of variant en de schrijfwijze die de catalogus gebruikt, bijvoorbeeld `"maharaja": "maharadja"`.
- Een fout in het bestand (een woord met een spatie, meer dan vijf suggesties, een zoekopdracht zonder resultaat) laat de build en de test falen met een duidelijke melding. De live site verandert pas na een deploy.

## Bewust niet
- Geen Fuse.js, Pagefind of andere dependency: bij ongeveer 150 documenten is een eigen matcher klein, snel en te testen.
- Geen schoenen en geen feed-sticks in het zoekvenster; die staan op `/zoeken`.
- `/zoeken` blijft `noindex` (besluit eigenaar): elke zoekopdracht geeft anders een dunne, dubbele pagina.
- Geen GA4, geen popularityScore, geen ruwe zoektekst in analytics.
