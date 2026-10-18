# CLAUDE.md — jouwhockeystick.nl

## Product
jouwhockeystick.nl is een Nederlandse, mobiele-first website die hockeyers en ouders helpt een passende hockeystick te kiezen. De catalogus (`src/catalog/products/`) bevat sticks van meerdere merken. Specs komen bij voorkeur van de officiële merksite; waar dat niet kan, van een winkel (`source: 'partner-shop'`), en dat staat per producteigenschap vermeld. Zie `docs/source-policy.md`.

De site combineert een stickwijzer, uitlegbare adviesregels, productvergelijking, kennisartikelen en e-commerce. De belangrijkste merkwaarden zijn helder, persoonlijk, eerlijk, energiek, deskundig en verifieerbaar.

## Testfase-scope
- Dit is een validatie-MVP: er is GEEN checkout, winkelmand of betaalverwerking. Bouw dit niet, tenzij expliciet gevraagd.
- Kopen gaat via de partnerwinkels (zie Commerce). Voor vragen en persoonlijk advies is er het interesseformulier op `/interesse`.
- Analytics-events (quiz_start, quiz_complete, interest_submit, retailer_click; zie `src/lib/analytics/events.ts`) zijn in deze fase net zo belangrijk als de functionaliteit zelf. Voeg ze toe bij elke relevante wijziging.
- Getoonde prijzen zijn richtprijzen (adviesprijs van de fabrikant of een winkelprijs, met bron en datum), geen live winkelprijzen. Markeer dit zichtbaar op de pagina.

## Commerce
- jouwhockeystick.nl verkoopt zelf niets: er is geen eigen checkout, voorraad of betaalverwerking. De site verwijst door naar twee partnerwinkels:
  - **bol.com**, via het bol.com Partnerprogramma (site ID 1547833), met een sub-ID per plek op de site;
  - **PassaHockey** (de hockeywinkel van PassaSports), via TradeTracker (campagne 39608), met de plek op de site als referentie.
  Beide staan in `src/lib/retailers.ts`. Sticks uit de PassaHockey-productfeed (`src/catalog/imported/`, wekelijks bijgewerkt) krijgen alleen de PassaHockey-knop en `noindex` tot ze met de hand zijn verrijkt; zie de decision log van 2026-10-17. Een stick krijgt een knop voor elke winkel die hem verkoopt: `bolProductUrl` of niet `bolNotSold`, en `passaSportsProductUrl`. Voeg een winkel pas toe als daar een partnerprogramma voor is. Gebruik geen fictieve tracking-parameters.
- Elke winkelknop toont een partnerlink-vermelding. Iedere productpagina en ieder stickadvies maakt duidelijk dat de winkel de verkoper is. Het verschil tussen de winkels staat op `/kennis/waar-koop-je-een-hockeystick`.
- Vergoedingen en de winkel spelen geen rol in de adviesscore.
- Geen kortingsclaims (bijv. "X% korting") zonder een echte, verifieerbare eerdere verkoopprijs; dit is wettelijk gereguleerd (EU Omnibus-richtlijn). Toon alleen de richtprijs.
- Trackinglinks zijn de enige bron van waarheid voor attributie. Hardcode geen commissieaannames in de UI.

## Documentatie
- `docs/README.md` is de inhoudsopgave van alle documenten.
- De specificatie van de keuzehulp is leidend: `docs/spec/keuzehulp-instructie-v1.1.md`. Meld afwijkingen achteraf in `docs/decision-log.md`.
- Merk en logo: `docs/merkinstructie.md`. Bronbeleid: `docs/source-policy.md`.

## Kernregels
- Gebruik TypeScript in strict mode. Vermijd `any`; gebruik expliciete types, discriminated unions en Zod-validatie waar passend.
- Houd content, productcatalogus, adviesregels en UI strikt gescheiden.
- Hardcode geen productclaims, carbonpercentages, prijzen, voorraad of modeljaren in UI-components.
- Elke producteigenschap moet een bron, modeljaar en `lastVerifiedAt` kunnen hebben.
- Geef geen absolute sportprestatieclaims. Gebruik genuanceerde formuleringen zoals "kan passen bij" of "is een logische richting voor".
- Maak de adviesengine verklaarbaar: elk advies moet minimaal 2–3 zichtbare redenen tonen.
- Bij strijdige signalen of onvoldoende informatie: toon een genuanceerde uitkomst en een alternatief, geen schijnprecisie.
- Gebruik Nederlands als primaire taal. Houd code, types en technische comments in het Engels.
- Bouw mobiel-eerst, semantisch HTML-first, toegankelijk volgens WCAG 2.2 AA waar redelijkerwijs haalbaar.
- Gebruik geen onnodige client components. Gebruik server components als standaard.
- Voeg geen externe dependency toe zonder eerst te onderzoeken of de bestaande stack het kan oplossen.
- Voeg nooit secrets toe aan code, logs, Git, tests, documentatie of prompts.
- Wijzig geen productieconfiguratie, DNS, betalingen, CMS-publicatie of deployment zonder expliciete instructie.

## GEO / SEO
- Belangrijke kenniscontent moet direct beschikbaar zijn in server-rendered HTML.
- Elke kennis- of adviespagina beantwoordt de hoofdvraag in de eerste 80 woorden.
- Gebruik één H1 en een logische H2/H3-structuur.
- Metadata moet uniek en inhoudelijk zijn.
- Structured data mag alleen zichtbare, verifieerbare informatie beschrijven.
- Gebruik geen verborgen tekst, keyword stuffing, fake reviews of misleidende schema markup.
- Toon op inhoudelijke pagina's auteur, datum, wijzigingsdatum en bronnen wanneer beschikbaar.
- Houd product-, artikel- en FAQ-URL's stabiel.

## Adviesengine
- De engine adviseert een richting en beschikbare producten; hij doet geen medische diagnose en geeft geen garantie.
- Prioriteit: technische ervaring, gewenste spelacties, huidige stickervaring, rol op het veld, comfortvoorkeur, budget en voorraad.
- Positie is nooit de enige beslisfactor.
- `hard filters` sluiten een product uit, bijvoorbeeld onjuiste lengte, niet beschikbaar of buiten absoluut budget.
- `soft scores` rangschikken passende producten op basis van profielmatch.
- Bewaar een `reasonCodes`-lijst bij iedere score zodat de UI kan uitleggen waarom een product matcht.
- Houd adviesregels versieerbaar. Voeg `ruleSetVersion` toe aan elk opgeslagen quizresultaat.

## Kwaliteit
Vóór afronding van een wijziging:
1. Voer linting uit.
2. Voer typecheck uit.
3. Voer relevante unit/integration tests uit.
4. Voer build uit als routes, metadata, server code of dependencies zijn geraakt.
5. Meld exact wat is uitgevoerd en wat niet kon worden uitgevoerd.

## Werkwijze
0. Contentopdrachten (artikelen, blogs, een issue met label `content-brief`): volg `docs/content-agent.md`. De brief in het issue geldt als goedgekeurd plan; werk hem uit in een PR. Video's (issue met label `video-brief`): volg `docs/video.md`.
1. Lees eerst relevante code en docs.
2. Presenteer bij middelgrote/grote taken een plan en aannames vóór implementatie.
3. Houd wijzigingen klein en coherent.
4. Voeg tests toe voor nieuwe businesslogica en regressierisico's.
5. Werk docs bij wanneer datamodel, adviesregels, architectuur of setup verandert.
6. Rapporteer gewijzigde bestanden, besluitpunten, testresultaten en open punten.

## Niet doen
- Geen grote refactors naast een feature zonder expliciete toestemming.
- Geen automatische productie-deploys.
- Geen database-reset, bulk-delete of destructive migration zonder expliciet akkoord.
- Geen wijziging aan betaalflow, privacytekst of toestemming zonder expliciete opdracht.
- Geen content publiceren vanuit code zonder expliciete opdracht en reviewstap.
