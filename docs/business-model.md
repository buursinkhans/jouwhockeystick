# Business model — jouwhockeystick.nl

**Status:** strategiedocument; de actuele situatie staat in sectie 5, de uitbreiding met meer partnerprogramma's in sectie 5a, hockeyschoenen in sectie 5b. Inhoudsopgave van alle documenten: `docs/README.md`.
**Doel van dit document:** vastleggen welk verdienmodel de MVP volgt, zodat de technische keuzes (checkout, productfeed, tracking) hierop worden afgestemd in plaats van andersom.
**Plaats in repo:** `docs/business-model.md`.

---

## 1. Gekozen model: contentplatform + affiliate-samenwerking

> **Stand van zaken (2026-10-18):** de site verwijst door naar twee partnerwinkels: **bol.com** (bol.com Partnerprogramma) en **PassaHockey**, de hockeywinkel van PassaSports (via TradeTracker). Er is geen eigen winkel, voorraad of checkout. Hoe de links werken, staat in `src/lib/retailers.ts` en `docs/decision-log.md` (2026-09-26 en 2026-10-16). Hieronder volgt het oorspronkelijke model met een lokale winkelpartner. Dat blijft een mogelijke latere stap, maar is nu niet in gebruik; de pitch daarvoor staat in `docs/archief/partner-pitch.md`.

jouwhockeystick.nl start **niet** als eigen webshop met eigen inkoop, voorraad en checkout. De site bouwt vertrouwen en vindbaarheid op via de stickwijzer en kennisbank, en verwijst de aankoop door naar bol.com.

| Partij | Verantwoordelijkheid |
|---|---|
| **jouwhockeystick.nl** | Content, GEO/SEO, stickwijzer, adviesengine, merken van de vraagkant, tracking en rapportage |
| **bol.com** | Verkoop, voorraad, prijsstelling, verzending, retouren, klantenservice (via bol.com en de betreffende marketplace-verkopers) |

Dit vervangt voor de MVP de aanname in sectie 2 van de ontwikkelinstructie dat er een eigen checkout (Shopify-headless of Mollie + eigen checkout) wordt gebouwd. Die optie blijft relevant voor een latere fase (zie sectie 5).

### Waarom dit model voor de MVP
- **Kapitaalarm:** geen voorraad, geen dealercontract, geen eigen retourproces nodig.
- **Sneller live:** de knelpunten van een eigen webshop (voorraadfeed, betaalprovider, retourbeleid, aansprakelijkheid) vervallen.
- **Focus op de sterkte van het platform:** content, advies en vindbaarheid — precies waar de technische blauwdruk (adviesengine, GEO-proof kennisbank) al op is ingericht.
- **Bewijslast voor later:** als het verkeer en de conversie aantoonbaar zijn, is een eigen merk of eigen webshop (zie sectie 5) een logische volgende stap met een onderbouwde business case.

---

## 2. Verdienmodel

**Commissie op verkoop**, aangevuld met een lead-/afsprakevergoeding voor click & collect (online oriënteren en reserveren, in de winkel passen en afhalen). Zie `docs/archief/partner-pitch.md` voor het voorstel aan de winkel.

| Onderdeel | Uitgangspunt |
|---|---|
| Commissiepercentage | 8–15% van de netto omzet (excl. btw) van bestellingen via jouwhockeystick.nl, in te zetten als onderhandelingsmarge |
| Proefperiode | 6 maanden, daarna evaluatie en eventueel overstap naar margedeling |
| Attributieperiode | Vast te leggen in het contract (bijv. 30 dagen na eerste klik via kortingscode of trackinglink) |
| Uitbetaling | Maandelijks, met exportbare rapportage van de onderliggende verkopen |

**Indicatieve unit economics** (bij €129,95 incl. btw, ca. €107 excl. btw):

| Commissie | Opbrengst per stick | Sticks/maand nodig bij €1.500 doel |
|---|---|---|
| 8% | ca. €8,60 | ca. 175 |
| 10% | ca. €10,70 | ca. 140 |
| 12% | ca. €12,90 | ca. 115 |
| 15% | ca. €16,10 | ca. 95 |

Dit zijn aannames, nog niet gevalideerd met een echte winkelpartner. Valideer met een pilot voordat je dit vastlegt in prognoses.

---

## 3. Impact op de technische blauwdruk

Pas de volgende onderdelen van de ontwikkelinstructie aan:

### Sectie 2 — E-commerce
- **Geen** eigen checkout, Mollie-integratie of eigen productvoorraad in de MVP.
- In plaats daarvan: een **doorverwijs- en trackinglaag** (affiliate links, kortingscodes, UTM-parameters) naar de website, telefoon, of het fysieke adres van de partnerwinkel.
- Als de winkel een productfeed kan leveren (voorraad, prijs), toon die op de productpagina's. Zonder feed: toon indicatieve prijzen met een duidelijke "controleer actuele prijs bij de winkel"-vermelding.

### Sectie 2 — Database
- Geen ordertabel nodig in de MVP. Wel: **kliks, kortingscode-gebruik en (indien beschikbaar) doorgegeven verkoopdata van de winkel** voor attributie en rapportage.

### Sprint 5 ("Commerce en meten")
Herdefinieer het doel van deze sprint:
- **Doel wordt:** betrouwbare doorverwijzing en attributie, niet een eigen checkout.
- Bouw: kortingscode- of trackinglink-generator per bron (organisch, club, campagne), een eenvoudig commissie-dashboard (of een export naar een spreadsheet), en een duidelijke CTA "Bekijk bij [winkelnaam]" op product- en resultaatpagina's.
- **Acceptatie:** een testklik is END-TO-END traceerbaar van resultaatpagina tot (gerapporteerde) verkoop bij de winkel.

### `CLAUDE.md` — toe te voegen regel
```
## Commerce
- De MVP verwijst door naar een externe partnerwinkel; er is geen eigen checkout, voorraad of betaalverwerking.
- Iedere productpagina en ieder stickadvies bevat een duidelijke, niet-misleidende vermelding dat de partnerwinkel de verkoper is.
- Trackinglinks en kortingscodes zijn de enige bron van waarheid voor attributie; hardcode geen commissieaannames in de UI.
```

---

## 4. Transparantie en vertrouwen (GEO- en klantbelang)

De ontwikkelinstructie hecht terecht veel waarde aan uitlegbaar advies en betrouwbare bronvermelding. Dat principe geldt evenzeer voor de commerciële relatie:

- Vermeld op elke pagina met een productaanbeveling **duidelijk en direct** dat de verkoop via de partnerwinkel loopt.
- Verklaar niet dat jouwhockeystick.nl de verkoper, garantieverstrekker of retourpartij is.
- Zie `docs/source-policy.md` voor de volledige bronvermeldings- en transparantie-eisen.

---

## 5. Huidige situatie: twee partnerwinkels

- **bol.com:** elke stick die bol.com verkoopt, krijgt een knop met een partnerlink (site ID en sub-ID per plek op de site).
- **PassaHockey:** elke stick die PassaHockey verkoopt, krijgt een rode knop met een TradeTracker-link. De referentie is de plek op de site.
- **PassaHockey-productfeed (TradeTracker):** het assortiment van PassaHockey wordt wekelijks geïmporteerd. Prijzen en voorraad van die sticks volgen de feed.
- **Bij beide te koop:** de stick krijgt twee knoppen. De pagina `/kennis/waar-koop-je-een-hockeystick` legt het verschil tussen de winkels uit.
- **Vergoedingen** lopen via de voorwaarden van die programma's: volgens de eigenaar 7% bij bol.com (categorie Sport) en 5% bij PassaHockey. Deze percentages staan alleen in dit document als rekengrondslag; ze komen nergens in code of sitetekst, en ze tellen niet mee in het advies.
- **Bestellen bij een lokale winkel** blijft een optie voor later (zie hieronder).

Het eerdere plan voor deze tussenstap, met een mailto-bestelformulier en aannames over bol-commissies, staat in de git-geschiedenis van dit bestand.

## 5a. Uitbreiding met meer partnerprogramma's (stand 2026-10-26)

**Waarom:** nu valt een bezoeker af als bol.com of PassaHockey een stick niet verkoopt. Met meer winkels krijgt vrijwel elke stick een koopknop, en wordt een prijsvergelijking per stick mogelijk (zie hieronder). Dit is de uitwerking van "meerdere partnerwinkels" uit sectie 6.

**Aanmeldingen bij affiliatenetwerken:**

| Netwerk | Account | Opmerking |
|---|---|---|
| bol.com Partnerprogramma | actief | site ID 1547833 |
| TradeTracker | actief | PassaHockey (campagne 39608) |
| Daisycon | aangemaakt 2026-10-24 | media "jouwhockeystick" (441384) geverifieerd via bestand in `public/` (PR #91) |
| Awin | aangemaakt 2026-10-24 | |
| Odyssey Partnerships | aangevraagd | nodig voor Decathlon NL; vóór gebruik checken waar het bedrijf zit en waar de data staat (EU-afspraak) |

**Programma's per winkel (stand 2026-10-26, opgave eigenaar uit de dashboards):**

| Winkel | Netwerk | Commissie | Cookieduur | Status | Opmerking |
|---|---|---|---|---|---|
| bol.com | bol.com Partnerprogramma | 7% (Sport) | 5 dagen | goedgekeurd, live | |
| PassaHockey | TradeTracker | 5% | 14 dagen | goedgekeurd, live | |
| Plutosport NL | Awin | 5% | 15 dagen | goedgekeurd, live (knop bij zekere feedkoppelingen, 2026-10-27) | adverteerder-ID 8342; feed (Awin) bevat 113 hockeysticks op plutosport.nl: Indian Maharadja, Brabo, Osaka, adidas, Princess, Reece; geen Grays of JDH. Overlapmeting in issue #99 |
| HockeyCity.nl | TradeTracker | 5% | onbekend | aangevraagd | hockeyspecialist voor junioren; openbare pagina noemt 100 dagen cookie; productfeed onbekend |
| Jumbo Sports | Daisycon | 12% | 100 dagen | aangevraagd | golf- en hockeywinkel; productfeed en deeplinks |
| DAKA | Daisycon | 5% | 30 dagen | aangevraagd | algemene sportwinkel met hockey; productfeed onbekend |
| Decathlon NL | Odyssey Partnerships | onbekend | onbekend | aangevraagd | verkoopt via de marketplace o.a. Grays; EU-check Odyssey nodig |

**Afgevallen of onzeker:**
- **Hockeygear.eu:** bestaat niet meer.
- **Playhockey.shop:** volgens affi.io op TradeTracker, maar niet zichtbaar in het dashboard. Alleen via een directe mail te bevestigen.
- **Hockeydirect:** programma's op Daisycon en TradeTracker gesloten. Eventueel direct mailen.
- **Hockeyspullen.nl, Intersport NL:** geen programma gevonden.
- **Decathlon via Awin:** het NL-programma op Awin is gesloten; Decathlon NL loopt via Odyssey.

**Les:** overzichtssites zoals affi.io lopen achter. Alleen het dashboard van het netwerk of de eigen pagina van de winkel telt als bron.

**Spelregels bij uitbreiding:**
1. Een winkel krijgt pas een knop op de site als het programma is goedgekeurd (CLAUDE.md: "Voeg een winkel pas toe als daar een partnerprogramma voor is").
2. Per goedgekeurd programma vastleggen: commissie, cookieduur, productfeed (ja/nee), deeplinks (ja/nee).
3. Niet dezelfde winkel via meerdere netwerken aanmelden: dat levert geen extra omzet op, wel extra administratie.
4. Niet meer netwerken dan nodig. Elk netwerk heeft een eigen uitbetalingsdrempel en een eigen feed om te onderhouden.
5. Elke nieuwe winkel op de site is een besluit in `docs/decision-log.md`. Extra trackingdomeinen kunnen gevolgen hebben voor de privacy- en cookietekst; die wordt alleen op expliciete opdracht van de eigenaar aangepast.

**Volgende stap: prijsvergelijking per stick (besloten 2026-10-26; uitwerking en architectuur in `docs/spec/prijsvergelijking.md`)**

Per stick tonen bij welke partnerwinkel hij te koop is, met prijs en datum, gesorteerd op prijs.

- **Waarom interessant:** zoekopdrachten als "[merk model] prijs" hebben hoge koopintentie; elke stick krijgt een koopknop; het past bij "Eerlijk stickadvies op maat", ook als de goedkoopste winkel minder commissie oplevert.
- **Risico's:** sticks koppelen tussen winkels (andere namen, lengtes en collectiejaren, vaak geen EAN). Een verkeerde koppeling schaadt het vertrouwen meer dan geen vergelijking.
- **Regels:** sorteren op prijs, nooit op commissie; uitleggen hoe gesorteerd wordt en dat de site per klik verdient; geen "goedkoopst!"-belofte, wel "laagste prijs in de feeds op [datum]"; vermelden of verzendkosten meetellen. Dit vraagt een aanpassing van de regel in CLAUDE.md dat getoonde prijzen richtprijzen zijn.
- **Kosten:** elke prijsupdate is een live-zetting (15 Netlify-credits). Wekelijks bijwerken kost ongeveer 60 credits per maand, dagelijks ongeveer 450; wekelijks volstaat voor sticks.

**Aanpak:**
1. Wachten op goedkeuring van de programma's hierboven.
2. Overlapmeting: hoeveel sticks uit de catalogus zijn bij twee of meer winkels te koop, en hoeveel verschilt de prijs? Bij minder dan zo'n 20% overlap, of verschillen van een paar euro, levert de vergelijking weinig op.
3. Bij een positieve uitkomst: klein starten met een blok "Waar te koop" op de stickpagina, niet op de homepage en niet in de stickwijzer.

## 5b. Uitbreiding: hockeyschoenen als sectie (besluit 2026-10-26)

**Besluit eigenaar:** hockeyschoenen worden een sectie `/hockeyschoenen` op jouwhockeystick.nl, géén aparte site. Het domein jouwhockeyschoen(en).nl is geregistreerd; het wordt pas een doorverwijzing op expliciete opdracht (DNS). Plan en meetpunten: issue #100.

**Rekengrondslag** (businesscase `jouwhockeystick-businesscase.xlsx`, tabblad Schoenen; zelfde methode als sticks):

| | Sticks | Schoenen |
|---|---|---|
| Verkocht per jaar in NL (schatting) | ca. 190.000 | ca. 200.000 paren |
| Marktwaarde (incl. btw) | ca. €17,8 mln | ca. €12,6 mln |
| Gemiddelde aankoopprijs | ca. €94 | ca. €63 |
| Retour en annulering (geen commissie) | 10% | 35% |
| Commissie per verkoop | ca. €4,75 | ca. €2,20 |
| Haalbaar marktaandeel | scenario 1 / 3 / 6% | de helft daarvan |
| Commissie per maand (scenario 1 / 3 / 6%) | €752 / €2.255 / €4.509 | €184 / €553 / €1.105 |

**Conclusie:** een sectie voegt ca. 25% toe aan de commissie, tegen bijna geen extra kosten. Een aparte site zou dubbele vaste kosten en eigen autoriteitsopbouw vragen voor een lagere opbrengst per bezoeker.

**Waarom retour zwaar telt:** bij bol.com wordt de commissie afgewezen als een bestelling binnen 30 dagen retour gaat of wordt geannuleerd ([FAQ](https://affiliate.bol.com/nl/veelgestelde-vragen/)). Bij online schoenen gaat 30% tot 60% retour (Shoppingtomorrow/TNO, "Get rid of returns"). Maatadvies in de schoenenwijzer verlaagt de retouren en is dus ook commercieel van belang.

**Beslismoment:** ca. 3 maanden na livegang (eind februari 2027), op de meetpunten in issue #100.

## 6. Latere fases (niet in scope voor MVP)

Deze opties blijven denkbaar zodra verkeer, conversie en vertrouwen bewezen zijn:

1. **Margedeling in plaats van commissie** — vraagt inzage in inkoopprijzen van de winkel.
2. **Meerdere partnerwinkels** — vermindert afhankelijkheid van één partij, vergroot complexiteit in feed- en attributiebeheer. Wordt nu uitgewerkt, zie sectie 5a.
3. **Eigen merk (private label)** — zie de losse businesscase (`Businesscase_hockeysticks.xlsx`) voor de cijfers hierachter. Bouwt voort op dezelfde content- en verkeersbasis.
4. **Eigen webshop met checkout** — pas zinvol bij voldoende volume en een duidelijke reden om van het partnermodel af te wijken (bijv. de partnerwinkel kan niet meeschalen).

---

## 7. Openstaande aannames om te valideren

- Commissiepercentage en attributieperiode (afhankelijk van onderhandeling met de winkel).
- Of de winkel een productfeed kan leveren, en in welk formaat.
- Welke dealercontracten van de winkel (Grays en anderen) beperkingen opleggen aan online prijsvermelding of promotie.
- Realistisch verkeer- en conversievolume voor de eerste 6 maanden (nul-meting nodig).
- ~~Exact commissiepercentage van het bol Affiliate Programma voor de categorie sport/hockeysticks (aanname: Zilver, ~4%).~~ Bekend: 7% op Sport (eigenaar, 2026-10-25). PassaHockey: 5%.
- Commissie, cookieduur en productfeed van de aangevraagde programma's (sectie 5a), zodra ze zijn goedgekeurd.
- Hoeveel sticks uit de catalogus bij meer dan één partnerwinkel te koop zijn (overlapmeting, sectie 5a).
- Hockeyschoenen (sectie 5b): paren per speler per jaar, retourpercentage via onze links, haalbaar marktaandeel naast sticks, en of de PassaHockey- en Plutosport-feeds schoenen bevatten.
- Welke bol.com-producten daadwerkelijk overeenkomen met de sticks in de catalogus, zodra die catalogus met echte data wordt gevuld.
