# CLAUDE.md — jouwhockeystick.nl

## Product
jouwhockeystick.nl is een Nederlandse, mobiele-first website die hockeyers en ouders helpt een passende hockeystick te kiezen. De catalogus (`src/catalog/products/`) bevat sticks van meerdere merken. Specs komen bij voorkeur van de officiële merksite; waar dat niet kan, van een winkel (`source: 'partner-shop'`), en dat staat per producteigenschap vermeld. Zie `docs/source-policy.md`.

De site combineert een stickwijzer, uitlegbare adviesregels, productvergelijking, kennisartikelen en e-commerce. De belangrijkste merkwaarden zijn helder, persoonlijk, eerlijk, energiek, deskundig en verifieerbaar.

## Testfase-scope
- Dit is een validatie-MVP: er is GEEN checkout, winkelmand of betaalverwerking. Bouw dit niet, tenzij expliciet gevraagd.
- Kopen gaat via de partnerwinkels (zie Commerce). Voor vragen en persoonlijk advies is er het interesseformulier op `/interesse`.
- Analytics-events (quiz_start, quiz_complete, interest_submit, retailer_click; zie `src/lib/analytics/events.ts`) zijn in deze fase net zo belangrijk als de functionaliteit zelf. Voeg ze toe bij elke relevante wijziging.
- Prijzen: op de stickpagina en in het stickadvies staan de actuele feedprijzen van de partnerwinkels in het blok "Waar te koop" (zie Commerce, Prijsvergelijking). Heeft een stick geen actuele winkelprijs (geen prijs in een feed, of ouder dan 14 dagen), en op plekken zonder dat blok (catalogus, vergelijkpagina, artikelen), dan toon je de richtprijs: adviesprijs van de fabrikant of een winkelprijs, met bron en datum, zichtbaar gemarkeerd als richtprijs.

## Commerce
- jouwhockeystick.nl verkoopt zelf niets: er is geen eigen checkout, voorraad of betaalverwerking. De site verwijst door naar drie partnerwinkels:
  - **bol.com**, via het bol.com Partnerprogramma (site ID 1547833), met een sub-ID per plek op de site;
  - **PassaHockey** (de hockeywinkel van PassaSports), via TradeTracker (campagne 39608), met de plek op de site als referentie;
  - **Plutosport**, via Awin (adverteerder 8342, publisher 3132918), met een deeplink (`cread.php`) en de plek op de site als `clickref`. Alleen sticks met een zekere koppeling uit de Plutosport-feed (`src/catalog/offers/matches.ts`, wekelijks bijgewerkt in de PassaHockey-sync) krijgen deze knop; zie de decision log van 2026-10-27.
  Alle drie staan in `src/lib/retailers.ts`. Sticks uit de PassaHockey-productfeed (`src/catalog/imported/`, wekelijks bijgewerkt) krijgen de PassaHockey-knop (en de Plutosport-knop bij een zekere koppeling) en `noindex` tot ze met de hand zijn verrijkt; zie de decision log van 2026-10-17. Sticks uit de Plutosport-feed die nergens anders in de catalogus staan (`src/catalog/imported/plutosport.ts`), krijgen op dezelfde manier alleen de Plutosport-knop; zie de decision log van 2026-10-27. Een stick krijgt een knop voor elke winkel die hem verkoopt: `bolProductUrl` of niet `bolNotSold`, `passaSportsProductUrl` en `plutosportProductUrl`. Voeg een winkel pas toe als daar een partnerprogramma voor is. Gebruik geen fictieve tracking-parameters.
- Elke winkelknop toont een partnerlink-vermelding. Iedere productpagina en ieder stickadvies maakt duidelijk dat de winkel de verkoper is. Het verschil tussen de winkels staat op `/kennis/waar-koop-je-een-hockeystick`.
- Vergoedingen en de winkel spelen geen rol in de adviesscore.
- Geen kortingsclaims (bijv. "X% korting") zonder een echte, verifieerbare eerdere verkoopprijs; dit is wettelijk gereguleerd (EU Omnibus-richtlijn). Toon alleen de richtprijs.
- Trackinglinks zijn de enige bron van waarheid voor attributie. Hardcode geen commissieaannames in de UI.
- **Prijsvergelijking per stick** (besloten 2026-10-26, fase 1 gebouwd 2026-10-27; zie `docs/spec/prijsvergelijking.md`). Het blok "Waar te koop" (`src/components/offers/WhereToBuy.tsx`, gegevens in `src/catalog/offers/`) staat op de stickpagina en in elk stickadvies. Daar gelden deze regels, en vervangen ze de richtprijsregel uit Testfase-scope:
  - Sorteer op totaalprijs (prijs plus verzendkosten): de laagste staat bovenaan. Nooit op commissie, cookieduur of netwerk.
  - Alle winkelrijen zien er hetzelfde uit ("Koop bij [winkel]"), behalve dat de bovenste rij, de laagste prijs incl. verzending, een iets dikkere rand heeft. Die nadruk volgt alleen de prijs, nooit de vergoeding, en heet nergens "goedkoopst" of "beste prijs".
  - Toon alleen de actuele feedprijs met de datum waarop die is gelezen. Geen van-/voorprijzen, doorgestreepte bedragen, kortingspercentages of "goedkoopst"-claims.
  - Is een prijs ouder dan 14 dagen, verberg dan het bedrag en toon alleen de knop.
  - Leg bij het blok in één zin uit hoe gesorteerd wordt en dat de site per aankoop een vergoeding krijgt.
  - Toon een winkel alleen bij een bevestigde koppeling (zelfde model en modeljaar) en alleen als het partnerprogramma is goedgekeurd en in de decision log staat.
  - Structured data (`Offer`/`AggregateOffer`) alleen voor prijzen die in het blok zichtbaar zijn en niet ouder dan 14 dagen.
  - Verzendkosten: vast bedrag per winkel uit de openbare voorwaarden, met bron en datum, in `src/lib/retailers.ts` (`SHIPPING`); onbekend is `null` en staat er zo bij.

## Hockeyschoenen
Sectie `/hockeyschoenen` op deze site (issue #100), in fasen gebouwd. Leidend is `docs/spec/hockeyschoenen-keuzemodel.md`; afwijkingen achteraf in de decision log. Alles uit dit bestand geldt ook voor schoenen. Daarnaast:
- Eigen catalogus in `src/catalog/shoes/` en eigen adviesregels (`src/shoe-advice/`, nog te bouwen). De stickcatalogus, `src/advice-engine/` en de stick-`ruleSetVersion` blijven ongemoeid.
- Weeg in deze volgorde: veld of zaal, ondergrond, voetvorm en pasproblemen, belasting en comfort, bewegingsstijl, en als laatste voorkeuren, budget en uitstraling. Positie is context: alleen een andere positie geeft nooit een andere selectie, en tel niet dubbel.
- Elke eigenschap is bevestigd, ongeschikt of onbekend, met bron. Onbekend is nooit geschikt of gemiddeld en verhoogt een match nooit. Een algemene winkelcategorie "hockeyschoenen" is geen bron voor veld of zaal.
- Geen "beste schoen", geen "voorkomt blessures", geen "gegarandeerde pasvorm", geen matchpercentages en geen grip-, dempings- of slijtagescores zonder vergelijkbare testgegevens. Bronsoorten zichtbaar: fabrikant (`brand-website`), winkel (`partner-shop`), redactie (`editorial-estimate`); een eigen test pas met een vastgelegd testprotocol.
- Bij nul geschikte modellen een eerlijke melding, nooit een versoepelde harde voorwaarde. Keepers krijgen een aparte begrenzing. Bij pijn of blessure geen diagnose of correctieve keuze; dat antwoord gaat niet naar analytics, de deel-link of logs. Zonder bevestigde maat en voorraad geen belofte van directe levering. Kinderen nooit automatisch naar premiummodellen.
- Winkels en prijsregels zoals bij sticks (Commerce). Koppelen tussen winkels alleen op EAN of na handmatige bevestiging, nooit op naam. Modellen uit de feeds (`src/catalog/shoes/imported.ts`, wekelijks in de PassaHockey-sync) krijgen `noindex` tot ze met de hand zijn verrijkt.

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
