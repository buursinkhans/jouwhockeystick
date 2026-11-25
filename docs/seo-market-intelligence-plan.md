# Plan SEO-kansenrapport, Fase 0: audit en implementatieplan

Datum: 2026-11-25. Status: voorstel, wacht op goedkeuring van de eigenaar. Fase 1 is niet gestart.
Dit bestand bevat geen echte Search Console-, PostHog- of affiliatecijfers. Voorbeelden zijn synthetisch en gemarkeerd.

Leeswijzer: de kern (hoofdstuk 1 tot en met 4) past op twee pagina's. De bijlagen A tot en met H zijn de onderbouwing, vooral in tabellen. Een status in de bijlagen is **feit** (in code of documentatie gezien), **aangetoond** (het levert aantoonbaar data op), **ontbreekt** of **niet geverifieerd** (ik heb geen toegang om het te controleren; wat jij moet aanleveren staat in bijlage E).

---

## 1. Managementsamenvatting

**Wat er al is.** Vrijwel alle bouwstenen:
- een wekelijkse Search Console-koppeling die per zoekopdracht én pagina de laatste 28 dagen met de 28 daarvoor vergelijkt (`scripts/search-console-report.ts`, `src/seo/searchConsole.ts`), plus een Bing-rapport en een Technical SEO-controle;
- een Marktverkenner, een Conversie-rapport (PostHog) en een Verkooprapport;
- een Orchestrator die elke maandag uit al die rapporten hooguit twee contentvoorstellen en een weekplanning maakt (`docs/orchestrator.md`);
- een sitemap die alle indexeerbare pagina's kent (`src/app/sitemap.ts`) en een catalogus met merk, veld of zaal, kromming, carbon, lengtes, prijs en partnerlinks;
- een afgeschermd kanaal voor cijfers: versleuteld, via de dagcijfers naar de Marketingstudio (`docs/marketing/dagbericht.md`).

**Wat echt ontbreekt.**
1. De rijen per zoekopdracht en pagina worden nergens bewaard. Alleen de lijsten met de bovenste 15 staan in een GitHub-issue dat elke week wordt overschreven. Er is dus geen historie en geen maandvergelijking.
2. Geen filter op Nederland en geen scheiding tussen merk- en niet-merkzoekopdrachten.
3. Geen koppeling van een zoekopdracht aan zoekintentie, paginatype en aanbod in de catalogus.
4. Geen vaste actiecategorie per kans en geen controle op kannibalisatie.
5. Geen terugkoppeling: wat gebeurde er nadat we iets hadden gedaan?
6. Geen seizoensinput uit Google Trends.

De funnel "organische landingspagina naar affiliateklik" bestaat in PostHog nog niet, maar kan met de bestaande opzet zonder nieuwe tracking (bijlage A.5).

**Aanbevolen oplossing: optie B, beperkt uitbreiden.** Eén rekenmodule en één maandscript bovenop de bestaande Search Console-code, een extra deel in de bestaande versleutelde dagcijfers en een tabblad in de Marketingstudio (zoals het tabblad Conversie). Alles blijft gewone TypeScript in bestaande workflows. Geen nieuwe dienst, database, scraper, Trends-koppeling of afhankelijkheid.

**Waarom dit de eenvoudigste is.** Optie A (niets bouwen) lost punt 1 tot en met 5 niet op. Optie C (een nieuw onderdeel) herhaalt wat er al staat. Optie B hergebruikt wat werkt en voegt alleen toe wat ontbreekt.

**Is nieuwbouw nodig?** Een nieuw systeem: nee. Een kleine uitbreiding: ja, naar schatting twee pull requests voor Fase 1, vergelijkbaar met het Conversie-rapport en het tabblad Conversie van deze maand.

**Kosten.** Geen nieuwe terugkerende kosten: GitHub Actions is gratis voor een openbare repository, Search Console en Trends-exports zijn gratis, en AI wordt alleen gebruikt voor de duiding binnen het bestaande abonnement.

## 2. De aanbeveling in gewone taal

Eén keer per maand (bijvoorbeeld de eerste maandag) draait een script. Het haalt de Search Console-gegevens op voor Nederland, vergelijkt de laatste 28 verwerkte dagen met de 28 daarvoor, koppelt elke zoekopdracht aan een pagina en aan ons aanbod, en kiest per kans één actie:

| Code | Actie |
|---|---|
| A | Bestaande pagina verbeteren |
| B | Interne links versterken |
| C | Nieuwe kenniscontent |
| D | Vergelijker of productpresentatie verbeteren |
| E | Geen websiteactie, alleen social |
| F | Geen actie |

Het rapport bevat hooguit vijf aanbevelingen en hooguit drie "dit doen we bewust niet", met per punt een onderbouwing en een zekerheid (hoog, middel, laag). Is er te weinig data, dan staat er "Onvoldoende data voor een betrouwbare conclusie".

**Waar jij het leest.** In een nieuw tabblad van de Marketingstudio (privé; de cijfers zijn versleuteld, net als bij Vandaag en Conversie). In GitHub verschijnt per aanbeveling alleen een issue **zonder cijfers**: pagina, actiecode en de reden in woorden. Jij keurt goed met een label; de bestaande Orchestrator en content-agent voeren uit zoals nu. De maand erna vergelijkt het script voor en na, en zegt of de aanbeveling effect had.

**Wat het niet doet.** Niets zelf publiceren of aanpassen, geen nieuwe tracking, geen scraping, geen zoekvolumes verzinnen, geen totaalscores. Commissie speelt geen rol bij wat we aanbevelen.

## 3. Wat ik van jou nodig heb

1. **Beslissingen: genomen op 2026-11-25** (zie bijlage D). Er is geen beslissing meer open voor het starten van Fase 1; Fase 1 start pas na het expliciete bericht "start Fase 1".
2. **Twee controles:** uitgevoerd door de eigenaar op 2026-11-25 (bijlage E). Beide bevestigd; er staan geen cijfers in dit document.
3. **Later (Fase 2):** een ankerterm kiezen voor de Trends-exports.

## 4. Afzonderlijk gemeld (geen onderdeel van dit plan)

- **Openbare rapporten bevatten echte cijfers.** De wekelijkse issues (Search Console, Conversie, Verkoop, Bing, Marktverkenning) en delen van `docs/decision-log.md` bevatten echte, geaggregeerde cijfers uit Search Console, PostHog en de netwerken. Dat staat haaks op de strengere regel van deze opdracht. Bijlage H beschrijft de opties; ik heb niets aangepast.
- **Twee openstaande pull requests van mij (#287 en #293)** bevatten ook echte geaggregeerde cijfers. Ik stel voor die te herschrijven voordat je ze merget, tenzij je anders beslist.

---

# Bijlagen

## A. Auditbevindingen

### A.1 Infrastructuur

| Onderwerp | Bevinding | Status | Bestanden |
|---|---|---|---|
| Taal en framework | TypeScript (strict), Next.js 16, Vitest, geen database. Scripts draaien met Node 22 via `npm run`. Dezelfde code draait lokaal en in GitHub Actions. | Feit | `package.json`, `tsconfig.json` |
| Workflows | 30 workflows. Rapportages draaien op maandagochtend (UTC 05:17 tot 06:37), daarna de Orchestrator. | Feit | `.github/workflows/*.yml` |
| Rapportage | Elk rapport is één GitHub-issue met een label, elke week overschreven. Cijfers die niet openbaar mogen, gaan versleuteld naar de branch `social-state` en worden in de Marketingstudio geopend. | Feit | `docs/beveiliging.md`, `scripts/daily-metrics.ts`, `src/marketing/seal.ts` |
| Aangetoond dat het draait | De issues van Search Console, Technical SEO, Marktverkenning, Verkoop, Conversie, Beveiliging, Bing en de Weekplanning zijn deze week bijgewerkt. | Aangetoond | GitHub-issues met de genoemde labels |
| Tests | Vitest-tests naast elke module, lint, typecheck en build in `ci.yml`. | Feit | `.github/workflows/ci.yml` |
| Uitbreiden zonder nieuwe infrastructuur | Ja: nieuwe pure functies in `src/seo/`, een script in `scripts/`, een deel in de bestaande dagcijfers en een tabblad in `social/studio/index.html`. | Feit | zie boven |

### A.2 Google Search Console

| # | Vraag | Antwoord | Status |
|---|---|---|---|
| 1 | Werkende API-koppeling? | Ja, via een serviceaccount (secret `GSC_SERVICE_ACCOUNT_JSON`, rechten Beperkt). Het weekrapport is deze week bijgewerkt. Het haalt rijen op met de dimensies zoekopdracht en pagina, en alleen pagina; 5.000 rijen per aanvraag. | Aangetoond |
| 2 | Historie? | De API levert tot ongeveer 16 maanden terug. Deze property heeft pas sinds oktober 2026 gegevens, dus er is geen vorig jaar. Het script bewaart geen rijen. In de bewerkingsgeschiedenis van het issue staan wel eerdere versies (ik kon ze lezen met de toegang van de eigenaar), maar alleen de lijsten met de bovenste 15. Of die geschiedenis voor anderen zichtbaar is, is niet geverifieerd. | Feit, deels aangetoond |
| 3 | Per zoekopdracht én pagina? | Ja in de aanvraag (zoekopdracht × pagina). In het issue komen alleen de bovenste 15 per lijst. | Feit |
| 4 | Filter op Nederland, merk of niet-merk? | De API ondersteunt een landfilter. De code gebruikt het niet en maakt geen onderscheid tussen merk en niet-merk. | Ontbreekt |
| 5 | Periodevergelijking en definities | Laatste 28 dagen tegen de 28 ervoor, met 3 dagen vertraging. Positie is het met vertoningen gewogen gemiddelde. Drempels bewust laag (minstens 3 vertoningen voor "bijna pagina 1" en "nieuwe zoekwoorden", 20 voor "weinig kliks"). | Feit (`src/seo/searchConsole.ts`) |
| 6 | Opslag en publicatie | Alleen in het openbare issue met het label `search-console`. De dagcijfers bevatten daarnaast versleuteld de dagtotalen, de bovenste zoektermen van 7 dagen en stijgers. | Feit |
| 7 | Beperkingen | Vertraging van ongeveer drie dagen. Een groot deel van de vertoningen hoort bij zeldzame, geanonimiseerde zoektermen: die tellen mee in totalen en per pagina, maar staan niet per zoekopdracht. Kleine aantallen maken posities onbetrouwbaar. Een dag zonder gegevens is niet hetzelfde als nul. | Feit (de code en het rapport zeggen dit zelf) |
| 8 | Voldoende voor Fase 1? | Voor de structuur ja. Niet voor historie, landfilter en bewaren van rijen: dat is de uitbreiding. Zonder die uitbreiding is een maandvergelijking per zoekopdracht niet mogelijk. | Oordeel |

### A.3 Pagina-inventaris en zoekintentie

- **Eén lijst van indexeerbare pagina's:** `src/app/sitemap.ts` combineert vaste pagina's (`/`, `/stickwijzer`, `/sticks`, `/zaalsticks`, `/hockeyschoenen`, `/kennis`, `/merken`, `/vergelijk`, `/blog`, `/clubs`, `/black-friday-hockey`), kennisartikelen, blogs, merkpagina's, reekspagina's, stickpagina's en schoenpagina's. Feit.
- **Pagina's koppelen aan zoektermen:** de Search Console-URL geeft het pad; het pad bepaalt het paginatype (`/sticks/<slug>` productpagina, `/kennis/` kennis, `/merken/` merk, `/vergelijk/` vergelijker, enzovoort). Titels, omschrijvingen en updatedata staan in `src/content/*`, de stickgegevens in `src/catalog/products/*`. Feit.
- **Canonicals en noindex:** `pageMetadata` zet de canonical op het pad zonder query; feed-sticks, `/zoeken` en `/aanbod/` zijn `noindex` of afgesloten. Fase 1 moet die keuzes respecteren en geen aanbeveling doen voor een pagina die bewust niet geïndexeerd wordt. Feit.
- **Zoekintentie:** er is geen intentieveld. Fase 1 leidt de intentie deterministisch af uit regels (bijvoorbeeld woorden als kopen, prijs, verschil, welke, maat, merknamen) en uit het paginatype, en laat AI alleen de duiding schrijven. Voorstel.
- **Kannibalisatie:** dezelfde zoekopdracht op meer dan één pagina is een onderzoekssignaal, geen fout. Het script markeert het en laat een mens beslissen. Voorstel.

### A.4 Productcatalogus

| Vraag | Antwoord | Status |
|---|---|---|
| Welke kenmerken? | Merk, naam, veld of zaal (`discipline`, standaard veld), niveau, kromming, carbonpercentage, lengtes, gewicht, adviesprijs, voorraad, aanbevolen posities, partnerlinks per winkel, en of de stick uit een feed komt (`feedImport`). Elk kenmerk heeft bron en controledatum. | Feit (`src/catalog/types.ts`) |
| Past een zoekopdracht bij het aanbod? | Ja, met de bestaande zoekmodule (`src/search/`) en de merkprofielen. | Feit |
| Aanbod ontbreekt? | `catalog:gaps` en de Catalogus-aanvuller signaleren ontbrekende sticks uit de marktscan. | Feit |
| Actualiteit | Prijzen zijn hooguit 14 dagen oud, `lastVerifiedAt` per kenmerk. | Feit |
| Verkeer zonder aanbod voorkomen | Fase 1 markeert een kans zonder passend aanbod als "eerst aanbod", niet als contentkans. | Voorstel |

### A.5 PostHog en funnel

| Onderdeel | Bevinding | Status |
|---|---|---|
| Events en definities | `src/lib/analytics/events.ts` (onder meer `retailer_click` met winkel, plek en stick, `quiz_start`, `quiz_complete`, `search`, `brand_view`, `versus_view`, `compare_open`). Rapportdefinities in `src/analytics-report/conversion.ts`. | Feit |
| Cookieloos | Een bezoeker is binnen één dag te volgen, niet over meerdere dagen. Een funnel is dus altijd "per bezoeker per dag". | Feit |
| Herkomst | `sourceLabel` onderscheidt Google, andere zoekmachines, social, AI-assistenten en direct. | Feit |
| Landingspagina per bezoek | Bestaat al voor AI-bezoeken (`aiVisits` in `scripts/conversion-report.ts`: eerste pageview per bezoeker per dag). Hetzelfde patroon werkt voor Google. | Feit |
| Landing naar vergelijker of product naar klik | Niet aanwezig als rapport. Met één extra zoekopdracht in dezelfde stijl te maken, **zonder nieuwe events of tracking**. | Ontbreekt, klein |
| Landing naar Stickwijzer naar klik | De stap "advies, daarna klik op dezelfde dag" bestaat; de verdeling per landingspagina en herkomst niet. | Ontbreekt, klein |
| Is Google als herkomst betrouwbaar herkend? | Niet geverifieerd: dat kan alleen in PostHog (bijlage E, stap 2). | Niet geverifieerd |
| Privacy | Geen nieuwe gegevens. Binnen de bestaande afspraken (geen cookies, geen persoonsgegevens). | Feit |
| Nodig voor Fase 1? | Nee, kan wachten. Het rapport kan eerst zonder funnel; affiliateklikken zijn een aanvullende kwaliteitsindicator, geen drempel voor een kans. | Oordeel |

### A.6 Google Trends

Bron: de officiële pagina "Google Trends API Alpha" op developers.google.com en het bijbehorende bericht van 24 juli 2025, gelezen op 2026-11-25.

- **Beschikbaarheid:** een alpha, "available only to a very limited number of testers", toegang via een aanvraag. Voorwaarden, limieten en kosten van de API staan **niet** op die pagina's. Er is dus geen toegankelijke, kosteneffectieve officiële koppeling. Besluit: geen API, geen onofficiële koppeling, CSV-import als route.
- **Wat de API zou bieden** (voor later, als toegang ooit komt): vijf jaar historie, dagelijks tot jaarlijks, regio's, en een schaling die over aanvragen heen consistent is. Dat lost het probleem van losse exports op, maar de toegang ontbreekt.
- **Beperkingen van de CSV-exports (meenemen in elk rapport):** relatieve index, 100 is geen absoluut volume, 0 betekent niet dat niemand zoekt, losse exports zijn niet zonder meer vergelijkbaar, nichetermen hebben weinig data, een zoekterm is iets anders dan een onderwerp, en regio, periode, zoektype en vergelijkingsgroep veranderen de uitkomst.
- **Vast te leggen bij elke handmatige export:** zoekterm of onderwerp, regio (Nederland), periode, zoektype (web), categorie, de vergelijkingsgroep (welke termen samen), en de exportdatum.
- **Ankerterm:** een vaste term die in elke export zit, maakt exports onderling te schalen, mits die term genoeg volume heeft (de uitkomsten zijn afgeronde gehele getallen, dus schalen met kleine waarden maakt fouten). Voorstel voor Fase 2: de brede term `hockeystick`, met de beperking dat die ook ijshockey en niet-koopintentie omvat.
- **Bouwen in Fase 0:** niets.

### A.6b Aanvullende marktinformatie

- **Marktverkenner** (`marktverkenning.yml`, `scripts/market-scan.ts`) leest de openbare sitemaps van concurrerende winkels, de productpagina's van merken en de populairste sticks op bol.com, en vergelijkt met vorige week (snapshot op de branch `data/marktverkenning`). Een korte duiding komt van Claude (Haiku).
- **Dekt:** nieuwe producten en merken, concurrentiepagina's. **Dekt niet:** zoekgedrag, veelgestelde vragen, veranderende zoekresultaten, seizoenspatronen.
- **Seizoenen en commerciële momenten** staan al, op aannames, in `marketing/sites/jouwhockeystick.json` (kalender met onder meer Black Friday, Sinterklaas en de seizoenen) en in `docs/orchestrator.md`. Die twee gebruiken niet dezelfde seizoensgrenzen en zijn niet met data getoetst: dat is een Fase 2-punt.
- **Advies:** geen nieuwe scraping en geen nieuwe marktbron. De Marktverkenner behouden, het seizoensdeel in Fase 2 toetsen met Trends.

## B. Overlap met bestaande agents en keuze A, B of C

### B.1 Tabel per agent

| Agent of workflow | Bestaande functionaliteit | Overlap met het plan | Ontbreekt | Advies |
|---|---|---|---|---|
| Search Console-rapport (`search-console.yml`, maandag 05:43 UTC) | Zoekopdracht × pagina, 28 tegen 28 dagen, bijna pagina 1, weinig kliks, nieuwe zoekwoorden, stickpagina's. Output: openbaar issue. | Groot: dit is de basis. | Landfilter, merk/niet-merk, rijen bewaren, intentie, aanbod, actiecode, historie | **Uitbreiden** (code hergebruiken) |
| Dagcijfers (`dagcijfers.yml`) en routine Dagbericht | Dagelijkse cijfers uit PostHog, Search Console en Bing, versleuteld naar de Marketingstudio. | Het afgeschermde kanaal | Geen maanddata per zoekopdracht | **Hergebruiken** (extra deel) |
| Bing-rapport (`bing-webmaster.yml`) | Bing-klikken, vertoningen, zoekopdrachten per week. | Klein, tweede zoekmachine | Geen koppeling aan pagina's of aanbod | **Behouden**, niet uitbreiden |
| Technical SEO (`technical-seo.yml`) | Crawlt de sitemap: titels, omschrijvingen, canonical, noindex, H1, links, afbeeldingen, laadtijd. | Voorkomt kansen op pagina's met een technisch probleem | Niets voor dit plan | **Behouden**, als invoer lezen |
| Marktverkenner (`marktverkenning.yml`) | Concurrentiepagina's en populaire sticks, wekelijks, Haiku-duiding. | Klein (markt, aanbod) | Zoekgedrag, vragen, seizoenen | **Behouden** |
| Orchestrator (`orchestrator.yml`, maandag 06:37 UTC) | Leest alle rapporten, maakt hooguit twee briefs en een weekplanning, kiest kansen (bijna pagina 1, seizoen, markt). | Groot: dit is de bestemming van de aanbevelingen | Maandcijfers en vaste actiecodes als invoer | **Hergebruiken**, nieuwe invoer toevoegen |
| Content-agent (`claude.yml`) | Schrijft op `@claude akkoord` of label `akkoord` een PR. | Voert aanbevelingen A en C uit | Niets | **Hergebruiken** |
| Geplande publicatie (`publicatie.yml`) | Dagelijks beslissen over een nieuwe build, IndexNow. | Brengt wijzigingen live | Niets | **Hergebruiken** |
| IndexNow (`indexnow.yml`) | Meldt gewijzigde pagina's aan Bing. | Versnelt zichtbaarheid bij Bing | Google doet niet mee | **Behouden** |
| Catalogus-controle, -aanvuller, -verrijker, -hercontrole | Kwaliteit, ontbrekende sticks, verrijken, kwartaalcontrole. | Aanbod voor "past dit bij ons assortiment" | Niets | **Hergebruiken** als bron |
| bol.com-feed (handmatig), PassaHockey-sync en overige feeds (Plutosport, HockeyCity, Daka, schoenen) | Prijzen, voorraad, nieuwe en verdwenen sticks. | Aanbod en beschikbaarheid | Niets | **Hergebruiken** |
| Conversie-rapport en Verkooprapport | Funnel, kliks per plek, winkel en stick; kliks en bestellingen per plek. | Eventuele funnel, sub-ID's | Landing naar klik per herkomst | **Hergebruiken**, optioneel een query toevoegen |
| Weekrapport (routine in claude.ai) en Onderzoeker | KPI's, contentlijnen, social. Leest onder meer het Search Console-issue. | Gebruikt dezelfde bron | Niets | **Behouden**, niet verdubbelen |
| Review-agent (`review.yml`) | Controleert content- en catalogus-PR's. | Bewaakt kwaliteit van de uitvoering | Niets | **Hergebruiken** |
| Social-planner, Publiceerder, Metricool | Social posts. | Alleen voor actiecode E | Niets | **Niet gebruiken** voor dit plan |

### B.2 Optie A, B of C

| Criterium | A: bestaande agents behouden | B: beperkt uitbreiden (aanbevolen) | C: nieuw onderdeel |
|---|---|---|---|
| Toegevoegde waarde | Laag: punt 1 tot en met 5 blijven open | Hoog: sluit alle gaten | Hoog, maar dubbel werk |
| Implementatie | Geen | Twee PR's | Meer dan vier PR's |
| Onderhoud | Geen extra | Laag (één module, één script) | Hoog (tweede systeem) |
| Dataveiligheid | Huidige openbare issues blijven | Versleuteld kanaal hergebruikt | Nieuwe opslag nodig |
| Betrouwbaarheid | Geen historie, geen vergelijking | Deterministische berekening met tests | Vergelijkbaar, meer risico |
| Complexiteit | Laag | Laag tot middel | Hoog |
| Structurele kosten | €0 | €0 | €0 tot meer (opslag, dienst) |
| Gebruiksgemak voor jou | Rapporten blijven verspreid | Eén tabblad en één issue per aanbeveling | Een nieuw ding om te leren |

Keuze: **B**. A volstaat niet voor de gewenste maandelijkse onderbouwde aanbevelingen. C is aantoonbaar niet nodig.

## C. Voorgestelde architectuur Fase 1 (niet bouwen)

**Eenvoudigste variant:**
1. **Data ophalen:** een maandscript `scripts/seo-opportunities.ts` hergebruikt `googleAuth.ts` en de aanvraag van `search-console-report.ts`, met een extra landfilter Nederland. Perioden: laatste 28 verwerkte dagen tegen de 28 ervoor, aangevuld met 90 dagen. Een jaar terug alleen zodra er twaalf maanden historie zijn (vroegst oktober 2027).
2. **Verwerken:** nieuwe pure functies in `src/seo/opportunities.ts` (met tests): paginatype uit het pad, intentie uit regels, merk of niet-merk uit de lijst van de eigenaar (bijlage D, besluit 4), aanbod via de bestaande zoekmodule, kannibalisatie, vergelijking van twee periodes, actiecode A tot en met F, kwalitatieve prioriteit en zekerheid. Geen gewogen totaalscore.
3. **Drempels (voorstel, te testen):** een rij met minder dan 10 vertoningen in 28 dagen krijgt "Onvoldoende data voor een betrouwbare conclusie". Een positieverschil telt alleen als beide perioden minstens 10 vertoningen hebben. Een paginaconclusie vraagt minstens 30 vertoningen per periode. Reden: Search Console middelt de positie over vertoningen, dus bij weinig vertoningen bepaalt één rangschikkingstest het gemiddelde. De huidige drempel van 3 vertoningen in het weekrapport is bewust laag gekozen omdat de site jong is.
4. **Veilige opslag:** het resultaat wordt versleuteld (zelfde `seal` en sleutel als de dagcijfers) als extra deel in `dagcijfers.json` op de branch `social-state` of, zodra het groter wordt, als eigen versleuteld bestand. De historie (basislijnen en eerdere aanbevelingen) staat in hetzelfde versleutelde bestand; het script leest het vorige bestand, voegt de nieuwe maand toe en schrijft het terug. Geen database, geen artifact, geen cijfers in het workflowlog (een openbare repo heeft openbare logs: het script schrijft alleen een statusregel).
5. **Zo komt het bij jou:** een tabblad "SEO" in de Marketingstudio, naar het voorbeeld van Conversie (de pagina ontsleutelt in jouw browser met jouw bewaarde sleutel). Geen aanpassing van de geplande taak nodig, omdat het deel meeloopt in de dagcijfers.
6. **Openbare kant zonder cijfers:** per aanbeveling een issue met het label `seo-aanbeveling`: pagina, actiecode en de reden in woorden. Geen vertoningen, kliks, posities of conversiecijfers. Of een zoekterm zonder cijfers erin mag, is een beslissing (bijlage D).
7. **Evaluatielus zonder database:** statussen voorgesteld, goedgekeurd, uitgevoerd, resultaat. Voorgesteld zet het script, goedgekeurd en uitgevoerd zet jij met een label op het issue, en 28 dagen na "uitgevoerd" (plus de 3 dagen vertraging) berekent het script het resultaat uit de versleutelde basislijn. Succesindicator per code: A de positie en CTR van het gekoppelde paar zoekopdracht en pagina; B de vertoningen en kliks naar de doelpagina; C de vertoningen van de nieuwe pagina na indexering; D de doorklik naar de winkel (PostHog, indien beschikbaar); E en F geen meting.
8. **Tests:** Vitest-tests voor alle berekeningen met synthetische data, gemarkeerd `DEMO — GEEN WERKELIJKE DATA`, en een test die waarborgt dat het script alleen een statusregel uitvoert. De bestaande kwaliteitscontroles (lint, typecheck, tests, build) blijven de poort.
9. **Aansluiting op hoe je nu wordt geïnformeerd:** het maandrapport komt in het tabblad; de Orchestrator leest de nummerloze issues mee als invoer voor zijn weekplanning (zijn regel "bijna pagina 1" en "seizoen" blijft). Het bestaande weekrapport van Search Console blijft als signaallaag bestaan.
10. **Lokale fallback:** het script kan ook lokaal draaien met de sleutel in een omgevingsvariabele en uitvoer in een map buiten de repo. Dat is alleen een noodoplossing: het vraagt dat jij of ik in een sessie de serviceaccountsleutel lokaal beschikbaar maak, wat we niet in de chat doen.

**Beperkingen van de aanpak:** kleine aantallen, dus conclusies zijn richting, geen bewijs; een cookieloze funnel kent alleen dezelfde dag; de versleuteling beschermt zolang de sleutel sterk en geheim blijft.

## D. Aannames, beperkingen en open vragen

| Soort | Punt |
|---|---|
| Feiten (gecontroleerd in code of documentatie) | Zie bijlage A en B. |
| Aannames | Het serviceaccount heeft toegang tot dezelfde property voor het maandscript. De dagcijfers-uitbreiding past in het bestaande versleutelde bestand. GitHub Actions blijft gratis voor deze openbare repo. |
| Hypotheses | De drempels uit C.3 zijn werkbaar. Een deterministische intentie-indeling is nauwkeurig genoeg voor een eerste versie. Een maandelijks ritme past bij de kleine hoeveelheid data. |
| Niet geverifieerd | Of de laatste run van elke andere workflow groen was (alleen de issues zijn bijgewerkt); voor het Search Console-rapport en de herkomst Google in PostHog is dat op 2026-11-25 bevestigd (bijlage E). Het document `docs/seo-metingen.md` of `claude/seo-metingen.md`: bestaat niet (bevestigd door de eigenaar op 2026-11-25). |
| Ontbrekend | Een jaar historie, een landfilter in de huidige code, opgeslagen rijen. |
| Besluiten van de eigenaar (2026-11-25) | 1. **Optie B** (beperkt uitbreiden): akkoord. 2. **Cijfers:** advies gevolgd. Het nieuwe SEO-rapport staat met cijfers alleen versleuteld in de Marketingstudio. De bestaande wekelijkse issues blijven voor nu zoals ze zijn (apart besluit later). Mijn open PR's #287 en #293 worden zonder echte cijfers herschreven vóór de merge. (De eigenaar schreef dit onder "vraag 3"; ik lees het als antwoord op vraag 2 en meld dat in de chat.) 3. **Zoekterm zonder cijfers in een openbaar issue:** ja, beperkt: alleen de zoekterm, de actiecode en de pagina, nooit aantallen, posities of percentages. 4. **Merkwoorden:** `jouwhockeystick`, `jouw hockeystick`, `jouwhockeystick.nl` en typfouten daarvan, plus `indian maharadja` en `princess` (ook de schrijfwijzen `maharaja`, `maharadja` en `marahadja`). Andere productmerken zoals Osaka, Grays en Brabo tellen als niet-merk. Gevolg voor de weergave: omdat deze twee merknamen nu bij "merk" horen, staan ze in het tabblad onder een eigen kopje binnen merk en vallen ze niet in de lijst met niet-merkkansen; hun vraag blijft zichtbaar voor de keuze van nieuwe merkpagina's. De lijst staat in één configuratiebestand en is later aan te passen. 5. **Goedkeuren met een label** (bijvoorbeeld `seo-akkoord`): akkoord. Zonder label wordt niets gebouwd of veranderd. 6. **Maandelijks ritme op de eerste maandag:** akkoord. |

## E. Handelingen voor de eigenaar

1. **Controleer dat het Search Console-rapport groen draait:** ga naar GitHub, de repository, tabblad **Actions** → **Search Console-rapport** → bekijk de laatste run. Groen? Dan is de koppeling bevestigd. **Bevestigd door de eigenaar op 2026-11-25: de laatste run is groen.**
2. **Controleer de herkomst Google in PostHog:** ga naar PostHog (Europese omgeving) → **SQL** (of **Data management → SQL editor**) → plak onderstaande zoekopdracht → **Run**. Staat `www.google.com` of `www.google.nl` in de lijst? Antwoord met ja of nee (cijfers hoef je niet te delen). **Bevestigd op 2026-11-25 via het dashboardblok "Bezoek per bron (30 dagen)": Google staat apart in de lijst, naast onder meer Bing, DuckDuckGo, ChatGPT, YouTube en Instagram.** Aandachtspunten voor Fase 1: het blok telt een bezoeker bij elke bron waar die in voorkomt (de kolommen zijn dus niet op te tellen), de aantallen zijn klein (richting, geen exacte uitkomst), en `jouwhockeystick.nl` staat zelf als herkomst in de lijst. Die eigen verwijzingen horen niet bij de funnel van organisch verkeer en worden uitgesloten.
   `SELECT properties.$referring_domain AS bron, count() AS n FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 28 DAY GROUP BY bron ORDER BY n DESC LIMIT 10`
3. **Controleer de rechten:** ga naar Search Console → **Instellingen** → **Gebruikers en machtigingen**. Staat het serviceaccount erbij met **Beperkt**? Meer rechten zijn niet nodig.
4. **Beslissingen:** genomen op 2026-11-25 (bijlage D). Niets meer te doen.
5. **Document `docs/seo-metingen.md` of `claude/seo-metingen.md`:** de eigenaar bevestigt op 2026-11-25 dat dit niet bestaat. Het plan werkt zonder.
6. **Pas in Fase 2:** kies samen met mij een ankerterm voor de Trends-exports.

## F. Inschatting per fase

Onderbouwde inschattingen, geen zekerheden. De referentie is wat vergelijkbaar werk deze maand kostte (het Conversie-rapport en het tabblad Conversie: twee PR's).

| | Fase 1: rapport | Fase 2: Trends en seizoen | Fase 3: planning en automatisering |
|---|---|---|---|
| Wat | Maandscript, rekenmodule, tests, extra deel in de dagcijfers, tabblad SEO, issue per aanbeveling | CSV-import (NL en EN, herkennen van onbruikbare bestanden, duplicaten voorkomen, instellingen vastleggen), seizoenssignalen, combineren met Search Console, toetsen of 4 tot 8 weken voorbereiden loont | Maandelijkse run, koppeling met Orchestrator en contentkalender, social als aanvulling, terugkoppeling |
| Eenmalige inspanning | Ongeveer twee PR's | Ongeveer één PR | Ongeveer één tot twee PR's |
| Onderhoud | Laag: drempels bijstellen, API-wijzigingen | Laag: formaat van de exports | Laag, hergebruikt bestaande agents |
| Handmatig per maand | Ongeveer 15 minuten lezen en labelen | Eén set exports per kwartaal (naar schatting 6 tot 10 exports met één ankerterm, ongeveer 30 minuten) | Hetzelfde |
| Kosten | €0 extra | €0 | €0 |
| Risico's | Schijnnauwkeurigheid bij weinig data, uitlekken via logs | Niet-vergelijkbare exports | Te veel automatisering zonder oordeel |
| Toegevoegde waarde | Hoog: maandelijkse onderbouwde keuzes en een terugkoppeling | Middel tot hoog: seizoenstiming | Middel: minder handwerk |

## G. Zelfcontrole vóór de pull request

| # | Controle | Resultaat | Beperking | Vervolgactie |
|---|---|---|---|---|
| 1 | Bestaand eerst | Voor elke gevraagde functie is gezocht in workflows, scripts en documentatie; hergebruik staat per onderdeel in bijlage B. | De routines in claude.ai (Dagbericht, Weekrapport) staan alleen in documentatie. | Bevestigen via de eigenaar. |
| 2 | Data en privacy | Dit bestand bevat geen echte cijfers en wordt het enige gewijzigde bestand. | Eerdere openbare rapporten en twee open PR's bevatten wel echte geaggregeerde cijfers (hoofdstuk 4, bijlage H). | Beslissing van de eigenaar. |
| 3 | Betrouwbaarheid | Cijfers ontbreken bewust. Drempels en aanpak staan als voorstel of hypothese. Trends-index staat nergens als absoluut volume. | Drempels zijn niet aan data getoetst. | Testen na de eerste run. |
| 4 | Eenvoud | Optie B zonder nieuwe infrastructuur gekozen. | Het versleutelde kanaal hangt af van een geheime sleutel. | Sleutelbeheer blijft zoals in de beveiligingsreview. |
| 5 | Strategie | Het plan richt zich op relevant organisch verkeer, bestaande pagina's eerst (actie A, B en D vóór C), de vergelijker en seizoenstiming. | Affiliateklikken zijn een aanvullende indicator. | Bij Fase 2 de seizoenstoets. |
| 6 | Meetbaarheid | Per actiecode is een succesindicator en een evaluatiemoment gekozen. | Kleine aantallen. | Resultaat als richting presenteren. |
| 7 | Gebruiksgemak | Kern in gewone taal, klikbare stappen in bijlage E. | De details staan in tabellen. | Vragen stellen na lezen. |
| 8 | Scope | Alleen `docs/seo-market-intelligence-plan.md` is toegevoegd. | De werkmap bevat nog wijzigingen van de eigenaar (`AGENTS.md`, `docs/README.md`, `docs/spec/pdp-herontwerp.md`) die ik niet heb aangeraakt en niet meecommit. | Geen. |

## H. Afzonderlijk gemelde problemen

1. **Echte cijfers in openbare plaatsen.** De wekelijkse rapportissues (labels `search-console`, `conversie`, `verkoop`, `bing`, `marktverkenning`, `marketing`) zijn openbaar en bevatten geaggregeerde echte cijfers, en `docs/decision-log.md` noemt op meerdere plekken Search Console-cijfers. Bestaande afspraak (beveiligingsreview 2026-11-13): alleen aantallen, geen bedragen, geen personen. Deze opdracht is strenger. Opties: (a) laten staan en de afspraak "alleen geaggregeerde aantallen" bevestigen; (b) de rapporten privé maken door ze via het versleutelde kanaal te sturen en alleen een nummerloze samenvatting te publiceren; (c) alleen nieuwe plekken schoonhouden. **Besluit 2026-11-25:** het nieuwe SEO-rapport houdt cijfers alleen versleuteld; de bestaande wekelijkse issues blijven voor nu staan; of die later privé moeten, is een apart besluit. Er is nog niets aangepast.
2. **Mijn open PR's #287 en #293.** Ze bevatten geaggregeerde cijfers (kliks bij netwerken tegenover PostHog, vertoningen en posities uit Search Console). **Besluit 2026-11-25:** herschrijven zonder echte cijfers vóór de merge. Dit gebeurt niet in deze PR en pas na een apart bericht van de eigenaar.
3. **Ontbrekend document.** `docs/seo-metingen.md` en `claude/seo-metingen.md` bestaan niet (bevestigd door de eigenaar op 2026-11-25). Geen vervolgactie.
4. **Seizoensdefinities lopen uiteen.** `docs/orchestrator.md`, `marketing/sites/jouwhockeystick.json` en de contentplanning gebruiken verschillende grenzen voor het zaal- en veldseizoen, zonder datatoets. Dat hoort bij Fase 2.
