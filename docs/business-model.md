# Business model — jouwhockeystick.nl

**Status:** strategiedocument; de actuele situatie staat in sectie 5. Inhoudsopgave van alle documenten: `docs/README.md`.
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
- **Bij beide te koop:** de stick krijgt twee knoppen. De pagina `/kennis/waar-koop-je-een-hockeystick` legt het verschil tussen de winkels uit.
- **Vergoedingen** lopen via de voorwaarden van die programma's. We nemen ze nergens in code of tekst aan, en ze tellen niet mee in het advies.
- **Bestellen bij een lokale winkel** blijft een optie voor later (zie hieronder).

Het eerdere plan voor deze tussenstap, met een mailto-bestelformulier en aannames over bol-commissies, staat in de git-geschiedenis van dit bestand.

## 6. Latere fases (niet in scope voor MVP)

Deze opties blijven denkbaar zodra verkeer, conversie en vertrouwen bewezen zijn:

1. **Margedeling in plaats van commissie** — vraagt inzage in inkoopprijzen van de winkel.
2. **Meerdere partnerwinkels** — vermindert afhankelijkheid van één partij, vergroot complexiteit in feed- en attributiebeheer.
3. **Eigen merk (private label)** — zie de losse businesscase (`Businesscase_hockeysticks.xlsx`) voor de cijfers hierachter. Bouwt voort op dezelfde content- en verkeersbasis.
4. **Eigen webshop met checkout** — pas zinvol bij voldoende volume en een duidelijke reden om van het partnermodel af te wijken (bijv. de partnerwinkel kan niet meeschalen).

---

## 7. Openstaande aannames om te valideren

- Commissiepercentage en attributieperiode (afhankelijk van onderhandeling met de winkel).
- Of de winkel een productfeed kan leveren, en in welk formaat.
- Welke dealercontracten van de winkel (Grays en anderen) beperkingen opleggen aan online prijsvermelding of promotie.
- Realistisch verkeer- en conversievolume voor de eerste 6 maanden (nul-meting nodig).
- Exact commissiepercentage van het bol Affiliate Programma voor de categorie sport/hockeysticks (aanname: Zilver, ~4%).
- Welke bol.com-producten daadwerkelijk overeenkomen met de sticks in de catalogus, zodra die catalogus met echte data wordt gevuld.
